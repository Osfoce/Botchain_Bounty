const cron = require("node-cron");
const { randomUUID } = require("crypto");
const { CHAINS, getPublicClient } = require("../config/chains");
const { BOUNTY_ABI } = require("../config/abi");
const Bounty = require("../modules/bounty.module");
const DistributionSync = require("../modules/distributionSync.module");
const DistributionScanCheckpoint = require("../modules/distributionScanCheckpoint.module");
const { synchronizeDistribution } = require("../services/distributionSync.service");
const { getSafeErrorCode, logSecurityEvent } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");
const {
  verifyRewardsAssignedEvent,
} = require("../services/verifiedDistributionEvent.service");

const LEASE_MS = 3 * 60 * 1000;
const DEFAULT_BLOCK_RANGE = 500;
const DEFAULT_OVERLAP_BLOCKS = 12;
const MAX_RETRY_RECORDS = 25;
const MAX_BLOCK_RANGES_PER_RUN = 20;

const positiveEnvInteger = (name, fallback) => {
  const rawValue = process.env[name];
  if (rawValue == null || rawValue === "") return fallback;
  if (!/^[0-9]+$/.test(rawValue)) {
    throw new Error(`${name} must be a positive integer`);
  }
  const value = Number(rawValue);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive safe integer`);
  }
  return value;
};

const supportedScanConfigs = () =>
  Object.entries(CHAINS)
    .map(([chainId, config]) => ({ chainId: Number(chainId), ...config }))
    .filter((config) => config.bountyContract);

const acquireCheckpoint = async (config) => {
  const key = {
    chainId: config.chainId,
    bountyContract: config.bountyContract.toLowerCase(),
  };
  let checkpoint;
  try {
    checkpoint = await DistributionScanCheckpoint.findOneAndUpdate(
      key,
      {
        $setOnInsert: {
          ...key,
          nextBlock: String(config.deploymentBlock),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    checkpoint = await DistributionScanCheckpoint.findOne(key);
    if (!checkpoint) throw error;
  }

  const leaseOwner = randomUUID();
  const now = new Date();
  const leased = await DistributionScanCheckpoint.findOneAndUpdate(
    {
      _id: checkpoint._id,
      $or: [
        { leaseExpiresAt: null },
        { leaseExpiresAt: { $lte: now } },
      ],
    },
    {
      $set: {
        leaseOwner,
        leaseExpiresAt: new Date(now.getTime() + LEASE_MS),
      },
    },
    { new: true },
  );
  return leased ? { checkpoint: leased, leaseOwner } : null;
};

const applyLog = async (config, publicClient, log) => {
  const blockchainId = String(log.args?.bountyId ?? "");
  if (!/^[0-9]+$/.test(blockchainId)) {
    logSecurityEvent({
      event: "transaction_verification_failed",
      severity: "warn",
      outcome: "failure",
      errorCode: "INVALID_BOUNTY_ID",
      chainId: config.chainId,
      transactionId: log.transactionHash,
    });
    return;
  }
  const numericBlockchainId = Number(blockchainId);
  if (!Number.isSafeInteger(numericBlockchainId)) {
    logSecurityEvent({
      event: "transaction_verification_failed",
      severity: "warn",
      outcome: "failure",
      errorCode: "BOUNTY_ID_OUT_OF_RANGE",
      chainId: config.chainId,
      resourceId: blockchainId,
      transactionId: log.transactionHash,
    });
    return;
  }

  const bounty = await Bounty.findOne({
    network: String(config.chainId),
    blockchainId: numericBlockchainId,
    isOnChain: true,
  });
  if (!bounty) {
    await recordSecurityAudit({
      event: "transaction_verification_failed",
      severity: "warn",
      outcome: "failure",
      errorCode: "EVENT_BOUNTY_MISMATCH",
      chainId: config.chainId,
      resourceId: blockchainId,
      transactionId: log.transactionHash,
    });
    return;
  }
  if (
    bounty.bountyContract &&
    bounty.bountyContract.toLowerCase() !== config.bountyContract.toLowerCase()
  ) {
    await recordSecurityAudit({
      event: "transaction_verification_failed",
      severity: "warn",
      outcome: "failure",
      errorCode: "EVENT_EMITTER_MISMATCH",
      resourceId: String(bounty._id),
      chainId: config.chainId,
    });
    return;
  }

  let verified;
  try {
    verified = await verifyRewardsAssignedEvent({
      publicClient,
      transactionHash: log.transactionHash,
      contractAddress: config.bountyContract,
      blockchainId,
      expectedLogIndex: Number(log.logIndex),
      expectedBlockHash: log.blockHash,
    });
  } catch (error) {
    await recordSecurityAudit({
      event:
        error.code === "RPC_UNAVAILABLE"
          ? "rpc_unavailable"
          : "transaction_verification_failed",
      severity: "warn",
      outcome: "failure",
      errorCode: getSafeErrorCode(error, "EVENT_VERIFICATION_FAILED"),
      resourceId: String(bounty._id),
      transactionId: log.transactionHash,
      chainId: config.chainId,
    });
    throw error;
  }

  const result = await synchronizeDistribution({
    bounty,
    publicClient,
    force: false,
    identity: {
      bountyId: bounty._id,
      blockchainId,
      chainId: config.chainId,
      bountyContract: config.bountyContract.toLowerCase(),
      transactionHash: log.transactionHash.toLowerCase(),
    },
    event: verified.event,
  });
  if (result.status !== "synced") {
    logSecurityEvent({
      event: "distribution_sync_pending",
      severity: "info",
      outcome: "attempt",
      chainId: config.chainId,
      resourceId: String(bounty._id),
      transactionId: log.transactionHash,
    });
  }
};

const scanChain = async (config) => {
  const client = getPublicClient(config.chainId);
  const actualChainId = await client.getChainId();
  if (actualChainId !== config.chainId) {
    throw new Error(
      `RPC chain mismatch for ${config.chainId}: endpoint reports ${actualChainId}`,
    );
  }

  const lease = await acquireCheckpoint(config);
  if (!lease) return;

  try {
    const head = await client.getBlockNumber();
    const safeBlock =
      head - BigInt(config.confirmationDepth) > 0n
        ? head - BigInt(config.confirmationDepth)
        : 0n;
    const deploymentBlock = BigInt(config.deploymentBlock);
    const checkpointBlock = BigInt(lease.checkpoint.nextBlock);
    const overlap = BigInt(
      positiveEnvInteger(
        "DISTRIBUTION_SYNC_OVERLAP_BLOCKS",
        DEFAULT_OVERLAP_BLOCKS,
      ),
    );
    let fromBlock =
      checkpointBlock > deploymentBlock + overlap
        ? checkpointBlock - overlap
        : deploymentBlock;
    const range = BigInt(
      positiveEnvInteger(
        "DISTRIBUTION_SYNC_BLOCK_RANGE",
        DEFAULT_BLOCK_RANGE,
      ),
    );
    const eventAbi = BOUNTY_ABI.find(
      (item) => item.type === "event" && item.name === "RewardsAssigned",
    );
    if (!eventAbi) throw new Error("RewardsAssigned event is missing from ABI");

    let scannedRanges = 0;
    while (
      fromBlock <= safeBlock &&
      scannedRanges < MAX_BLOCK_RANGES_PER_RUN
    ) {
      const renewedLease = await DistributionScanCheckpoint.updateOne(
        { _id: lease.checkpoint._id, leaseOwner: lease.leaseOwner },
        { $set: { leaseExpiresAt: new Date(Date.now() + LEASE_MS) } },
      );
      if (!renewedLease.matchedCount) {
        throw new Error(`Lost scan lease for chain ${config.chainId}`);
      }

      const toBlock =
        fromBlock + range - 1n < safeBlock
          ? fromBlock + range - 1n
          : safeBlock;
      const logs = await client.getLogs({
        address: config.bountyContract,
        event: eventAbi,
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        await applyLog(config, client, log);
      }

      const nextBlock = toBlock + 1n;
      const updated = await DistributionScanCheckpoint.updateOne(
        {
          _id: lease.checkpoint._id,
          leaseOwner: lease.leaseOwner,
        },
        {
          $set: {
            lastScannedBlock: toBlock.toString(),
            nextBlock: nextBlock.toString(),
            leaseExpiresAt: new Date(Date.now() + LEASE_MS),
          },
        },
      );
      if (!updated.matchedCount) {
        throw new Error(`Lost scan lease for chain ${config.chainId}`);
      }
      fromBlock = nextBlock;
      scannedRanges += 1;
    }
  } finally {
    await DistributionScanCheckpoint.updateOne(
      { _id: lease.checkpoint._id, leaseOwner: lease.leaseOwner },
      { $set: { leaseOwner: null, leaseExpiresAt: null } },
    );
  }
};

const retryPendingSyncs = async () => {
  const now = new Date();
  const pending = await DistributionSync.find({
    $or: [
      {
        status: { $in: ["pending", "failed"] },
        $or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: now } }],
      },
      {
        status: "processing",
        leaseExpiresAt: { $lte: now },
      },
      {
        status: "processing",
        leaseExpiresAt: null,
      },
    ],
  })
    .sort({ updatedAt: 1 })
    .limit(MAX_RETRY_RECORDS)
    .lean();

  for (const record of pending) {
    try {
      const config = CHAINS[record.chainId];
      if (
        !config?.bountyContract ||
        config.bountyContract.toLowerCase() !== record.bountyContract
      ) {
        throw new Error(`No trusted bounty deployment for chain ${record.chainId}`);
      }
      const bounty = await Bounty.findById(record.bountyId);
      if (!bounty) throw new Error(`Bounty ${record.bountyId} no longer exists`);

      const publicClient = getPublicClient(record.chainId);
      const actualChainId = await publicClient.getChainId();
      if (actualChainId !== record.chainId) {
        throw new Error(`RPC chain mismatch for ${record.chainId}`);
      }
      const verified = await verifyRewardsAssignedEvent({
        publicClient,
        transactionHash: record.transactionHash,
        contractAddress: record.bountyContract,
        blockchainId: record.blockchainId,
        expectedLogIndex: record.logIndex,
        expectedBlockHash: record.blockHash,
      });
      await synchronizeDistribution({
        bounty,
        publicClient,
        force: false,
        identity: {
          bountyId: bounty._id,
          blockchainId: record.blockchainId,
          chainId: record.chainId,
          bountyContract: record.bountyContract,
          transactionHash: record.transactionHash,
        },
        event: verified.event,
      });
    } catch (error) {
      const nextAttempt = record.attempts + 1;
      const retryAt = new Date(
        Date.now() +
          Math.min(
            60_000 * 2 ** Math.max(0, nextAttempt - 1),
            60 * 60 * 1000,
          ),
      );
      await DistributionSync.updateOne(
        {
          _id: record._id,
          attempts: record.attempts,
          $or: [
            { status: { $in: ["pending", "failed"] } },
            { status: "processing", leaseExpiresAt: { $lte: now } },
            { status: "processing", leaseExpiresAt: null },
          ],
        },
        {
          $set: {
            status: "failed",
            lastError: getSafeErrorCode(error, "DISTRIBUTION_SYNC_FAILED"),
            nextRetryAt: retryAt,
            leaseOwner: null,
            leaseExpiresAt: null,
          },
          $inc: { attempts: 1 },
        },
      );
      await recordSecurityAudit({
        event: "distribution_sync_failed",
        severity: "error",
        outcome: "failure",
        errorCode: getSafeErrorCode(error, "DISTRIBUTION_SYNC_FAILED"),
        resourceId: String(record.bountyId),
        transactionId: record.transactionHash,
        chainId: Number(record.chainId),
      });
    }
  }
};

let runInProgress = false;

const runReconciliation = async () => {
  if (runInProgress) return;
  runInProgress = true;
  let failures = 0;
  logSecurityEvent({
    event: "distribution_reconciliation_run_started",
    severity: "info",
    outcome: "attempt",
  });
  try {
    for (const config of supportedScanConfigs()) {
      try {
        await scanChain(config);
      } catch (error) {
        failures += 1;
        await recordSecurityAudit({
          event:
            error.code === "RPC_UNAVAILABLE"
              ? "rpc_unavailable"
              : "reconciliation_failed",
          severity: "error",
          outcome: "failure",
          errorCode: getSafeErrorCode(error, "RECONCILIATION_FAILED"),
          chainId: config.chainId,
        });
      }
    }
    await retryPendingSyncs();
  } catch (error) {
    failures += 1;
    await recordSecurityAudit({
      event: "reconciliation_failed",
      severity: "error",
      outcome: "failure",
      errorCode: getSafeErrorCode(error, "RECONCILIATION_FAILED"),
    });
    throw error;
  } finally {
    runInProgress = false;
    logSecurityEvent({
      event: "distribution_reconciliation_run_completed",
      severity: failures ? "error" : "info",
      outcome: failures ? "failure" : "success",
      count: failures,
    });
  }
};

const startRewardDistributionReconcileJob = () => {
  if (process.env.DISTRIBUTION_SYNC_ENABLED === "false") {
    logSecurityEvent({
      event: "distribution_reconciliation_disabled",
      severity: "warn",
      outcome: "blocked",
    });
    return;
  }

  cron.schedule("*/2 * * * *", () => {
    runReconciliation().catch((error) => {
      recordSecurityAudit({
        event: "reconciliation_failed",
        severity: "error",
        outcome: "failure",
        errorCode: getSafeErrorCode(error, "RECONCILIATION_FAILED"),
      });
    });
  });
  runReconciliation().catch((error) => {
    recordSecurityAudit({
      event: "reconciliation_failed",
      severity: "error",
      outcome: "failure",
      errorCode: getSafeErrorCode(error, "RECONCILIATION_FAILED"),
    });
  });
  logSecurityEvent({
    event: "distribution_reconciliation_scheduled",
    severity: "info",
    outcome: "success",
  });
};

module.exports = {
  runReconciliation,
  startRewardDistributionReconcileJob,
};
