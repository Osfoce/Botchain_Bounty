const mongoose = require("mongoose");
const { formatRewardAmount } = require("../services/financialAmounts.service");

const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const chainSettings = require("../config/chains");
const { CHAINS } = chainSettings;
const DistributionSync = require("../modules/distributionSync.module");
const distributionSyncService = require("../services/distributionSync.service");
const claimSyncService = require("../services/claimSync.service");
const {
  verifyRewardsAssignedEvent,
} = require("../services/verifiedDistributionEvent.service");
const { verifyRewardClaimEvent } = require("../services/verifiedRewardClaim.service");
const { logRequestError } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isAddress = (a) => typeof a === "string" && /^0x[a-fA-F0-9]{40}$/.test(a);
const auditRewardEvent = (
  req,
  event,
  { outcome = "failure", errorCode, ...context } = {},
) =>
  recordSecurityAudit({
    req,
    event,
    severity: outcome === "success" ? "info" : "warn",
    outcome,
    walletAddress: req.auth?.walletAddress,
    errorCode,
    ...context,
  });

// ─────────────────────────────────────────────────────────────
// POST /task/:id/distribute
// Sync winners + amounts from the on-chain RewardsAssigned event
// ─────────────────────────────────────────────────────────────
const distributeRewards = async (req, res) => {
  const { id } = req.params;
  const { txHash, blockchainId, chainId } = req.body;

  if (!isValidId(id)) {
    return res
      .status(400)
      .json({ code: "INVALID_BOUNTY_ID", error: "Invalid bounty ID" });
  }

  const chainIdNum = Number(chainId);
  if (!Number.isSafeInteger(chainIdNum) || chainIdNum <= 0) {
    return res.status(400).json({ code: "INVALID_CHAIN_ID", error: "Invalid chainId" });
  }
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash || "")) {
    return res.status(400).json({ code: "INVALID_TX_HASH", error: "Invalid transaction hash" });
  }
  if (
    blockchainId == null ||
    !/^[0-9]+$/.test(String(blockchainId)) ||
    BigInt(blockchainId) <= 0n ||
    BigInt(blockchainId) > BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    return res.status(400).json({
      code: "INVALID_BLOCKCHAIN_ID",
      error: "Invalid on-chain bounty ID",
    });
  }

  try {
    const bounty = await Bounty.findById(id);
    if (!bounty) {
      return res.status(404).json({ code: "BOUNTY_NOT_FOUND", error: "Bounty not found" });
    }

    if (Number(bounty.network) !== chainIdNum) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "The requested chain does not match the bounty network",
      });
    }

    if (
      !bounty.isOnChain ||
      bounty.blockchainId == null ||
      !/^[0-9]+$/.test(String(bounty.blockchainId)) ||
      BigInt(bounty.blockchainId) <= 0n
    ) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "Bounty does not have a verified on-chain identity",
      });
    }

    if (String(bounty.blockchainId) !== String(blockchainId)) {
      return res.status(409).json({
        code: "EVENT_BOUNTY_MISMATCH",
        error: "The on-chain bounty ID does not match the stored bounty",
      });
    }

    const chainConfigForBounty = CHAINS[chainIdNum];
    const expectedContract = chainConfigForBounty?.bountyContract;
    if (!expectedContract || !isAddress(expectedContract)) {
      return res.status(400).json({
        code: "UNSUPPORTED_CHAIN",
        error: `No bounty contract is configured for chain ${chainIdNum}`,
      });
    }

    const contractAddress = expectedContract.toLowerCase();
    if (!isAddress(bounty.bountyContract)) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "Bounty contract does not match trusted chain configuration",
      });
    }
    if (bounty.bountyContract.toLowerCase() !== contractAddress) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "The bounty contract does not match the trusted chain configuration",
      });
    }

    const normalizedTxHash = txHash.toLowerCase();
    if (
      bounty.rewardsAssignedOnChain &&
      !bounty.distributionTxHash
    ) {
      return res.status(409).json({
        code: "CONFLICTING_DISTRIBUTION",
        error: "A distribution is already recorded without a transaction identity",
      });
    }
    if (
      bounty.distributionTxHash &&
      bounty.distributionTxHash.toLowerCase() !== normalizedTxHash
    ) {
      return res.status(409).json({
        code: "CONFLICTING_DISTRIBUTION",
        error: "A different transaction is already recorded for this bounty",
      });
    }

    if (bounty.rewardsAssignedOnChain) {
      const completedSync = await DistributionSync.findOne({
        bountyId: bounty._id,
        blockchainId: String(blockchainId),
        chainId: chainIdNum,
        bountyContract: contractAddress,
        transactionHash: normalizedTxHash,
        status: "synced",
      }).lean();
      if (completedSync) {
        const rewards = await Reward.find({ bountyId: bounty._id }).lean();
        return res.status(200).json({
          status: "synced",
          alreadySynced: true,
          txHash: normalizedTxHash,
          chainId: chainIdNum,
          winners: rewards.map((reward) => ({
            winnerAddress: reward.winnerAddress,
            amountWei: reward.amount,
            amountFormatted: reward.amountFormatted,
          })),
        });
      }
    }

    const publicClient = chainSettings.getPublicClient(chainIdNum);
    let rpcChainId;
    try {
      rpcChainId = await publicClient.getChainId();
    } catch (error) {
      logRequestError(req, "reward_rpc_chain_check_failed", error, "warn");
      await auditRewardEvent(req, "rpc_unavailable", {
        errorCode: "RPC_UNAVAILABLE",
        resourceId: id,
        transactionId: normalizedTxHash,
        chainId: chainIdNum,
      });
      return res.status(503).json({
        code: "RPC_UNAVAILABLE",
        error: "Could not verify the configured blockchain RPC",
        retryable: true,
        txHash: normalizedTxHash,
        chainId: chainIdNum,
      });
    }
    if (rpcChainId !== chainIdNum) {
      logRequestError(req, "reward_rpc_chain_mismatch", {
        name: "Error",
        code: "RPC_CHAIN_MISMATCH",
      });
      await auditRewardEvent(req, "transaction_verification_failed", {
        errorCode: "RPC_CHAIN_MISMATCH",
        resourceId: id,
        transactionId: normalizedTxHash,
        chainId: chainIdNum,
      });
      return res.status(503).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "The configured RPC endpoint reports a different chain",
        retryable: false,
        txHash: normalizedTxHash,
        chainId: chainIdNum,
      });
    }

    let verified;
    try {
      verified = await verifyRewardsAssignedEvent({
        publicClient,
        transactionHash: normalizedTxHash,
        contractAddress,
        chainId: chainIdNum,
        confirmationDepth: chainConfigForBounty.confirmationDepth,
        blockchainId,
      });
    } catch (error) {
      if (
        !["TRANSACTION_NOT_FOUND", "TRANSACTION_NOT_CONFIRMED"].includes(
          error.code,
        )
      ) {
        await auditRewardEvent(
          req,
          error.code === "RPC_UNAVAILABLE"
            ? "rpc_unavailable"
            : "transaction_verification_failed",
          {
          errorCode: error.code,
          resourceId: id,
          transactionId: normalizedTxHash,
          chainId: chainIdNum,
          },
        );
      }
      const statusByCode = {
        TRANSACTION_NOT_FOUND: 202,
        TRANSACTION_NOT_CONFIRMED: 202,
        TRANSACTION_REVERTED: 400,
        WRONG_TRANSACTION_DESTINATION: 409,
        EXPECTED_EVENT_NOT_FOUND: 400,
        EVENT_EMITTER_MISMATCH: 409,
        EVENT_BOUNTY_MISMATCH: 409,
        EVENT_MISMATCH: 409,
        CHAIN_CONFIGURATION_MISMATCH: 409,
        RPC_UNAVAILABLE: 503,
      };
      const status = statusByCode[error.code];
      if (status) {
        return res.status(status).json({
          ...(status === 202 ? { status: "pending_confirmation" } : {}),
          code: error.code,
          error: error.message,
          retryable: status === 202 || status === 503,
          txHash: normalizedTxHash,
          chainId: chainIdNum,
        });
      }
      throw error;
    }

    const result = await distributionSyncService.synchronizeDistribution({
      bounty,
      publicClient,
      identity: {
        bountyId: bounty._id,
        blockchainId: String(blockchainId),
        chainId: chainIdNum,
        bountyContract: contractAddress,
        transactionHash: normalizedTxHash,
      },
      event: verified.event,
    });

    if (result.status === "pending") {
      return res.status(202).json({
        status: "pending",
        code: "SYNC_PENDING",
        retryable: true,
        txHash: normalizedTxHash,
        chainId: chainIdNum,
      });
    }

    await auditRewardEvent(req, "distribution_sync_succeeded", {
      outcome: "success",
      resourceId: id,
      transactionId: normalizedTxHash,
      chainId: chainIdNum,
    });
    const winnerDetails = result.winners || (await Promise.all(
      verified.event.winners.map(async (winner) => {
        const reward = await Reward.findOne({
          bountyId: bounty._id,
          winnerAddress: winner,
        }).lean();
        return {
          winnerAddress: winner,
          amountWei: reward?.amount,
          amountFormatted: reward?.amountFormatted,
        };
      }),
    ));

    return res.status(200).json({
      status: "synced",
      alreadySynced: result.alreadySynced,
      txHash: normalizedTxHash,
      chainId: chainIdNum,
      winners: winnerDetails,
    });
  } catch (err) {
    if (err.code === "CONFLICTING_DISTRIBUTION") {
      await auditRewardEvent(req, "distribution_sync_failed", {
        errorCode: "CONFLICTING_DISTRIBUTION",
        resourceId: id,
        transactionId: typeof txHash === "string" ? txHash : undefined,
        chainId: chainIdNum,
      });
      return res.status(409).json({
        code: err.code,
        error: err.message,
      });
    }
    logRequestError(req, "reward_distribution_sync_failed", err);
    await auditRewardEvent(req, "distribution_sync_failed", {
      errorCode: err.code || "SYNC_FAILED",
      resourceId: id,
      transactionId: typeof txHash === "string" ? txHash : undefined,
      chainId: chainIdNum,
    });
    return res.status(503).json({
      status: "failed",
      code: "SYNC_FAILED",
      error: "Distribution was confirmed on-chain but application synchronization failed",
      retryable: true,
      txHash: typeof txHash === "string" ? txHash.toLowerCase() : undefined,
      chainId: Number.isSafeInteger(Number(chainId)) ? Number(chainId) : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /task/:id/winners
// ─────────────────────────────────────────────────────────────
const getWinners = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }

  try {
    const bounty = await Bounty.findById(id).lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const rewards = bounty.rewardsAssignedOnChain
      ? await Reward.find({ bountyId: id }).lean()
      : [];

    const assigned = rewards
      .filter((r) => r.status === "assigned")
      .map((r) => ({ address: r.winnerAddress, amount: r.amountFormatted }));

    const claimed = rewards
      .filter((r) => r.status === "claimed")
      .map((r) => ({
        address: r.winnerAddress,
        amount: r.amountFormatted,
        claimedAt: r.claimedAt,
        txHash: r.claimTxHash,
      }));

    return res.status(200).json({
      winners: assigned,
      claimed,
      distributedAt: bounty.winners?.assignedAt || null,
      isDistributed: Boolean(bounty.rewardsAssignedOnChain),
      payoutType: bounty.payoutType || null,
    });
  } catch (err) {
    logRequestError(req, "reward_winners_read_failed", err);
    return res
      .status(500)
      .json({ code: "INTERNAL_ERROR", error: "Failed to fetch winners" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /task/:id/claimable/:userAddress
// Live read from the contract (source of truth)
// ─────────────────────────────────────────────────────────────
const getClaimable = async (req, res) => {
  const { id, userAddress } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }
  if (!isAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid user address" });
  }

  try {
    const bounty = await Bounty.findById(id).lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    const chainId = Number(bounty.network);
    const configuredChain = CHAINS[chainId];
    if (
      !bounty.isOnChain ||
      !configuredChain ||
      !Number.isSafeInteger(Number(bounty.blockchainId)) ||
      Number(bounty.blockchainId) <= 0 ||
      !isAddress(bounty.bountyContract) ||
      bounty.bountyContract.toLowerCase() !== configuredChain.bountyContract.toLowerCase()
    ) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "Bounty does not match trusted chain configuration",
      });
    }
    if (!bounty.rewardsAssignedOnChain) {
      return res.status(200).json({
        claimable: 0,
        message: "Reward distribution synchronization is pending",
      });
    }

    const reward = await Reward.findOne({
      bountyId: id,
      winnerAddress: userAddress.toLowerCase(),
    }).lean();

    if (!reward) {
      return res.status(200).json({ claimable: 0, message: "Not a winner" });
    }
    if (
      Number(reward.chainId) !== chainId ||
      !isAddress(reward.bountyContract) ||
      reward.bountyContract?.toLowerCase() !== configuredChain.bountyContract.toLowerCase() ||
      String(reward.blockchainId) !== String(bounty.blockchainId)
    ) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "Reward does not match trusted chain configuration",
      });
    }
    if (reward.status === "claimed") {
      return res.status(200).json({ claimable: 0, message: "Already claimed" });
    }

    // 🔥 Live contract read = authoritative claimable amount
    const publicClient = chainSettings.getPublicClient(chainId);
    const onChainAmount = await publicClient.readContract({
      address: configuredChain.bountyContract,
      abi: BOUNTY_ABI,
      functionName: "claimableRewards",
      args: [BigInt(bounty.blockchainId), userAddress],
    });

    return res.status(200).json({
      claimable: onChainAmount.toString(),
      claimableFormatted: formatRewardAmount(onChainAmount.toString(), chainId),
      message: "Reward available to claim",
    });
  } catch (err) {
    logRequestError(req, "reward_claimable_read_failed", err);
    return res
      .status(500)
      .json({ code: "INTERNAL_ERROR", error: "Failed to get claimable amount" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /task/:id/claim
// Verify claim tx on-chain, then flip reward status
// ─────────────────────────────────────────────────────────────
const claimReward = async (req, res) => {
  const { id } = req.params;
  const { txHash } = req.body;
  const winnerAddress = req.auth.walletAddress;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }
  if (!isAddress(winnerAddress)) {
    return res.status(400).json({ error: "Invalid winner address" });
  }
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash || "")) {
    return res.status(400).json({ code: "INVALID_TX_HASH", error: "Invalid transaction hash" });
  }

  let chainId;
  try {
    const bounty = await Bounty.findById(id).select(
      "rewardsAssignedOnChain isOnChain network blockchainId bountyContract",
    );
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    if (!bounty.rewardsAssignedOnChain) {
      return res.status(409).json({
        code: "SYNC_PENDING",
        error: "Reward distribution synchronization is pending",
      });
    }

    const reward = await Reward.findOne({
      bountyId: id,
      winnerAddress: winnerAddress.toLowerCase(),
    });

    if (!reward) {
      return res.status(404).json({ error: "You are not a winner" });
    }
    chainId = Number(bounty.network);
    const configuredChain = CHAINS[chainId];
    if (
      !bounty.isOnChain ||
      !configuredChain ||
      !Number.isSafeInteger(Number(bounty.blockchainId)) ||
      Number(bounty.blockchainId) <= 0 ||
      !isAddress(bounty.bountyContract) ||
      bounty.bountyContract.toLowerCase() !== configuredChain.bountyContract.toLowerCase() ||
      Number(reward.chainId) !== chainId ||
      !isAddress(reward.bountyContract) ||
      reward.bountyContract.toLowerCase() !== configuredChain.bountyContract.toLowerCase() ||
      String(reward.blockchainId) !== String(bounty.blockchainId)
    ) {
      return res.status(409).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        error: "Reward does not match the bounty's trusted chain configuration",
      });
    }
    if (!/^[0-9]+$/.test(String(reward.amount))) {
      return res.status(409).json({
        code: "EVENT_AMOUNT_MISMATCH",
        error: "Stored reward amount is not a valid token base-unit value",
      });
    }

    const normalizedTxHash = txHash.toLowerCase();
    if (
      reward.status === "claimed" &&
      (!reward.claimTxHash || reward.claimTxHash.toLowerCase() !== normalizedTxHash)
    ) {
      return res.status(409).json({
        code: "CONFLICTING_CLAIM",
        error: "Reward is already linked to a different claim event",
      });
    }

    const publicClient = chainSettings.getPublicClient(chainId);
    let verified;
    try {
      verified = await verifyRewardClaimEvent({
        publicClient,
        transactionHash: normalizedTxHash,
        contractAddress: configuredChain.bountyContract,
        chainId,
        confirmationDepth: configuredChain.confirmationDepth,
        blockchainId: bounty.blockchainId,
        winnerAddress,
        amount: reward.amount,
      });
    } catch (error) {
      if (
        !["TRANSACTION_NOT_FOUND", "TRANSACTION_NOT_CONFIRMED"].includes(
          error.code,
        )
      ) {
        await auditRewardEvent(
          req,
          error.code === "RPC_UNAVAILABLE"
            ? "rpc_unavailable"
            : "transaction_verification_failed",
          {
            errorCode: error.code,
            resourceId: id,
            transactionId: normalizedTxHash,
            chainId,
          },
        );
      }
      const statusByCode = {
        TRANSACTION_NOT_FOUND: 202,
        TRANSACTION_NOT_CONFIRMED: 202,
        TRANSACTION_REVERTED: 400,
        WRONG_TRANSACTION_DESTINATION: 409,
        EVENT_WALLET_MISMATCH: 409,
        EVENT_BOUNTY_MISMATCH: 409,
        EVENT_AMOUNT_MISMATCH: 409,
        EXPECTED_EVENT_NOT_FOUND: 400,
        EVENT_EMITTER_MISMATCH: 409,
        EVENT_MISMATCH: 409,
        CHAIN_CONFIGURATION_MISMATCH: 409,
        RPC_UNAVAILABLE: 503,
      };
      const status = statusByCode[error.code] || 503;
      if (status === 503) {
        logRequestError(
          req,
          "reward_claim_verification_unavailable",
          error,
          "warn",
        );
      }
      return res.status(status).json({
        code: error.code || "RPC_UNAVAILABLE",
        error: error.message || "Could not verify reward claim",
        retryable: status === 202 || status === 503,
      });
    }

    if (
      reward.status === "claimed" &&
      (reward.claimLogIndex !== verified.event.logIndex ||
        reward.claimBlockHash?.toLowerCase() !== verified.event.blockHash.toLowerCase())
    ) {
      return res.status(409).json({
        code: "CONFLICTING_CLAIM",
        error: "Reward is already linked to a different claim event",
      });
    }

    const result = await claimSyncService.synchronizeClaim({
      reward,
      bounty,
      identity: {
        bountyId: bounty._id,
        chainId,
        bountyContract: configuredChain.bountyContract.toLowerCase(),
        transactionHash: normalizedTxHash,
        winnerAddress: winnerAddress.toLowerCase(),
      },
      event: verified.event,
    });
    if (result.status !== "synced") {
      return res.status(202).json({
        status: "pending",
        code: "CLAIM_SYNC_PENDING",
        retryable: true,
        txHash: normalizedTxHash,
      });
    }

    await auditRewardEvent(req, "claim_sync_succeeded", {
      outcome: "success",
      resourceId: id,
      transactionId: normalizedTxHash,
      chainId,
    });
    return res.status(200).json({
      message: "Reward claimed successfully",
      amount: reward.amountFormatted,
      alreadySynced: result.alreadySynced,
    });
  } catch (err) {
    if (["CONFLICTING_CLAIM", "EVENT_ALREADY_APPLIED"].includes(err.code)) {
      await auditRewardEvent(req, "claim_sync_failed", {
        errorCode: err.code,
        resourceId: id,
        transactionId: typeof txHash === "string" ? txHash : undefined,
        chainId,
      });
      return res.status(409).json({ code: err.code, error: err.message });
    }
    logRequestError(req, "reward_claim_sync_failed", err);
    await auditRewardEvent(req, "claim_sync_failed", {
      errorCode: err.code || "CLAIM_SYNC_FAILED",
      resourceId: id,
      transactionId: typeof txHash === "string" ? txHash : undefined,
      chainId,
    });
    return res.status(503).json({
      code: "CLAIM_SYNC_FAILED",
      error: "Claim was verified but application synchronization is pending",
      retryable: true,
      txHash: typeof txHash === "string" ? txHash.toLowerCase() : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /task/:id/has-claimed/:userAddress
// ─────────────────────────────────────────────────────────────
const hasClaimed = async (req, res) => {
  const { id, userAddress } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }
  if (!isAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid user address" });
  }

  try {
    const reward = await Reward.findOne({
      bountyId: id,
      winnerAddress: userAddress.toLowerCase(),
    })
      .select("status")
      .lean();

    return res.status(200).json({ hasClaimed: reward?.status === "claimed" });
  } catch (err) {
    logRequestError(req, "reward_claim_status_read_failed", err);
    return res
      .status(500)
      .json({ code: "INTERNAL_ERROR", error: "Failed to check claim status" });
  }
};

module.exports = {
  distributeRewards,
  getWinners,
  getClaimable,
  claimReward,
  hasClaimed,
};
