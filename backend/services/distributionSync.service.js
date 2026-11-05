const { randomUUID } = require("crypto");

const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const User = require("../modules/user.module");
const Submission = require("../modules/submission.module");
const DistributionSync = require("../modules/distributionSync.module");
const { BOUNTY_ABI } = require("../config/abi");
const { CHAINS } = require("../config/chains");
const {
  formatRewardAmount,
  getTokenDecimals,
} = require("./financialAmounts.service");
const { getSafeErrorCode, logRequestError } = require("../utils/requestLogger");

const LEASE_MS = 2 * 60 * 1000;

const sameValue = (left, right) =>
  String(left ?? "").toLowerCase() === String(right ?? "").toLowerCase();

const assertSameDistribution = (existing, identity) => {
  if (
    Number(existing.chainId ?? existing.network) !== identity.chainId ||
    !sameValue(existing.bountyContract, identity.bountyContract) ||
    !sameValue(existing.distributionTxHash, identity.transactionHash)
  ) {
    const error = new Error(
      "A different transaction is already recorded for this distribution",
    );
    error.code = "CONFLICTING_DISTRIBUTION";
    throw error;
  }
};

const ensureSyncBlockIdentity = async (syncRecord, event) => {
  if (syncRecord.blockHash) return syncRecord;

  const blockHash = event.blockHash.toLowerCase();
  await DistributionSync.updateOne(
    {
      _id: syncRecord._id,
      $or: [{ blockHash: null }, { blockHash: { $exists: false } }],
    },
    {
      $set: {
        blockHash,
        blockNumber: event.blockNumber.toString(),
      },
    },
  );
  syncRecord.blockHash = blockHash;
  return syncRecord;
};

const upsertSyncRecord = async (identity, event) => {
  const logicalKey = {
    chainId: identity.chainId,
    bountyContract: identity.bountyContract,
    blockchainId: identity.blockchainId,
  };
  const priorDistribution = await DistributionSync.findOne(logicalKey);

  if (
    priorDistribution &&
    !sameValue(priorDistribution.transactionHash, identity.transactionHash)
  ) {
    const error = new Error(
      "A different transaction is already recorded for this bounty",
    );
    error.code = "CONFLICTING_DISTRIBUTION";
    throw error;
  }
  if (
    priorDistribution &&
    priorDistribution.logIndex !== event.logIndex
  ) {
    const error = new Error(
      "A different RewardsAssigned event is already recorded for this bounty",
    );
    error.code = "CONFLICTING_DISTRIBUTION";
    throw error;
  }

  try {
    const syncRecord = await DistributionSync.findOneAndUpdate(
      {
        chainId: identity.chainId,
        bountyContract: identity.bountyContract,
        transactionHash: identity.transactionHash,
        logIndex: event.logIndex,
      },
      {
        $setOnInsert: {
          bountyId: identity.bountyId,
          blockchainId: identity.blockchainId,
          chainId: identity.chainId,
          bountyContract: identity.bountyContract,
          transactionHash: identity.transactionHash,
          logIndex: event.logIndex,
          blockNumber: event.blockNumber.toString(),
          blockHash: event.blockHash.toLowerCase(),
          winnerAddresses: event.winners,
          status: "pending",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return ensureSyncBlockIdentity(syncRecord, event);
  } catch (error) {
    if (error.code !== 11000) throw error;

    const conflictingDistribution = await DistributionSync.findOne(logicalKey);
    if (
      conflictingDistribution &&
      !sameValue(
        conflictingDistribution.transactionHash,
        identity.transactionHash,
      )
    ) {
      const conflict = new Error(
        "A different transaction is already recorded for this bounty",
      );
      conflict.code = "CONFLICTING_DISTRIBUTION";
      throw conflict;
    }

    const syncRecord = await DistributionSync.findOne({
      chainId: identity.chainId,
      bountyContract: identity.bountyContract,
      transactionHash: identity.transactionHash,
      logIndex: event.logIndex,
    });
    if (!syncRecord) throw error;
    return ensureSyncBlockIdentity(syncRecord, event);
  }
};

const claimSyncLease = async (syncRecord, { force }) => {
  const now = new Date();
  const leaseOwner = randomUUID();
  const eligibleStatuses = force
    ? [{ status: { $in: ["pending", "failed"] } }]
    : [
      {
        status: { $in: ["pending", "failed"] },
        $or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: now } }],
      },
    ];
  const claimed = await DistributionSync.findOneAndUpdate(
    {
      _id: syncRecord._id,
      $or: [
        ...eligibleStatuses,
        {
          status: "processing",
          leaseExpiresAt: { $lte: now },
        },
        {
          status: "processing",
          leaseExpiresAt: null,
        },
      ],
    },
    {
      $set: {
        status: "processing",
        leaseOwner,
        leaseExpiresAt: new Date(now.getTime() + LEASE_MS),
        lastError: null,
        nextRetryAt: null,
      },
      $inc: { attempts: 1 },
    },
    { new: true },
  );
  return claimed ? { syncRecord: claimed, leaseOwner } : null;
};

const persistWinnerReward = async ({
  bounty,
  identity,
  winner,
  amountWei,
}) => {
  const token =
    bounty.token || CHAINS[identity.chainId]?.chain?.nativeCurrency?.symbol;
  if (!token) {
    throw new Error(
      `Reward token is not configured for chain ${identity.chainId}`,
    );
  }
  const tokenDecimals = getTokenDecimals(identity.chainId);

  const existing = await Reward.findOne({
    bountyId: bounty._id,
    winnerAddress: winner,
  });

  if (existing) {
    if (
      String(existing.blockchainId) !== identity.blockchainId ||
      Number(existing.chainId) !== identity.chainId ||
      !sameValue(existing.bountyContract, identity.bountyContract) ||
      !sameValue(existing.distributionTxHash, identity.transactionHash)
    ) {
      const error = new Error(
        `A reward for ${winner} already belongs to a different distribution`,
      );
      error.code = "CONFLICTING_DISTRIBUTION";
      throw error;
    }
    return existing;
  }

  try {
    await Reward.updateOne(
      { bountyId: bounty._id, winnerAddress: winner },
      {
        $setOnInsert: {
          bountyId: bounty._id,
          blockchainId: Number(identity.blockchainId),
          chainId: identity.chainId,
          token,
          tokenDecimals,
          bountyContract: identity.bountyContract,
          bountyTitle: bounty.title,
          winnerAddress: winner,
          amount: amountWei.toString(),
          amountFormatted: formatRewardAmount(amountWei.toString(), identity.chainId),
          status: "assigned",
          distributionTxHash: identity.transactionHash,
          assignedAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const persisted = await Reward.findOne({
    bountyId: bounty._id,
    winnerAddress: winner,
  });
  if (!persisted) {
    throw new Error(`Failed to persist reward for winner ${winner}`);
  }
  if (
    String(persisted.blockchainId) !== identity.blockchainId ||
    Number(persisted.chainId) !== identity.chainId ||
    !sameValue(persisted.bountyContract, identity.bountyContract) ||
    !sameValue(persisted.distributionTxHash, identity.transactionHash)
  ) {
    const error = new Error(
      `A reward for ${winner} already belongs to a different distribution`,
    );
    error.code = "CONFLICTING_DISTRIBUTION";
    throw error;
  }
  return persisted;
};

const incrementWinnerCompletionOnce = async (winner, distributionKey) => {
  try {
    await User.updateOne(
      { walletAddress: winner },
      { $setOnInsert: { walletAddress: winner } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    const user = await User.findOne({ walletAddress: winner }).select("_id").lean();
    if (!user) throw error;
  }

  await User.updateOne(
    {
      walletAddress: winner,
      "stats.completedDistributionKeys": { $ne: distributionKey },
    },
    {
      $inc: { "stats.tasksCompleted": 1 },
      $addToSet: { "stats.completedDistributionKeys": distributionKey },
    },
  );
};

const synchronizeDistribution = async ({
  bounty,
  publicClient,
  identity,
  event,
  force = true,
}) => {
  if (bounty.distributionTxHash) {
    assertSameDistribution(bounty, identity);
  }

  const syncRecord = await upsertSyncRecord(identity, event);
  if (syncRecord.status === "synced") {
    return { status: "synced", alreadySynced: true, syncRecord };
  }

  const lease = await claimSyncLease(syncRecord, { force });
  if (!lease) {
    return { status: "pending", alreadySynced: false, syncRecord };
  }

  try {
    const winnerDetails = [];
    for (const winner of event.winners) {
      const existing = await Reward.findOne({
        bountyId: bounty._id,
        winnerAddress: winner,
      });
      let amountWei;

      if (existing) {
        if (
          String(existing.blockchainId) !== identity.blockchainId ||
          Number(existing.chainId) !== identity.chainId ||
          !sameValue(existing.bountyContract, identity.bountyContract) ||
          !sameValue(existing.distributionTxHash, identity.transactionHash)
        ) {
          const error = new Error(
            `A reward for ${winner} already belongs to a different distribution`,
          );
          error.code = "CONFLICTING_DISTRIBUTION";
          throw error;
        }
        amountWei = BigInt(existing.amount);
      } else {
        amountWei = await publicClient.readContract({
          address: identity.bountyContract,
          abi: BOUNTY_ABI,
          functionName: "claimableRewards",
          args: [BigInt(identity.blockchainId), winner],
          blockNumber: event.blockNumber,
        });
      }

      const reward = await persistWinnerReward({
        bounty,
        identity,
        winner,
        amountWei,
      });
      winnerDetails.push({
        winnerAddress: winner,
        amountWei: reward.amount,
        amountFormatted: reward.amountFormatted,
      });
    }

    const winners = event.winners;
    await Submission.updateMany(
      { bountyId: bounty._id, user: { $in: winners } },
      { $set: { status: "accepted" } },
    );
    await Submission.updateMany(
      { bountyId: bounty._id, user: { $nin: winners } },
      { $set: { status: "rejected" } },
    );

    const distributionKey = [
      identity.chainId,
      identity.bountyContract,
      identity.transactionHash,
      event.logIndex,
    ].join(":");
    for (const winner of winners) {
      await incrementWinnerCompletionOnce(winner, distributionKey);
    }

    const bountyUpdate = await Bounty.updateOne(
      {
        _id: bounty._id,
        $or: [
          { distributionTxHash: bounty.distributionTxHash ?? null },
          { distributionTxHash: identity.transactionHash },
        ],
      },
      {
        $set: {
          rewardsAssignedOnChain: true,
          bountyContract: identity.bountyContract,
          distributionTxHash: identity.transactionHash,
          distributedAt: bounty.distributedAt || new Date(),
          assignedCount: winners.length,
          "winners.assigned": winners,
        },
      },
    );
    if (!bountyUpdate.matchedCount) {
      const error = new Error(
        "A different transaction is already recorded for this bounty",
      );
      error.code = "CONFLICTING_DISTRIBUTION";
      throw error;
    }

    const markedSynced = await DistributionSync.updateOne(
      { _id: lease.syncRecord._id, leaseOwner: lease.leaseOwner },
      {
        $set: {
          status: "synced",
          winnerAddresses: winners,
          syncedAt: new Date(),
          leaseOwner: null,
          leaseExpiresAt: null,
          lastError: null,
          nextRetryAt: null,
        },
      },
    );
    if (!markedSynced.matchedCount) {
      const current = await DistributionSync.findById(lease.syncRecord._id);
      if (current?.status !== "synced") {
        return { status: "pending", alreadySynced: false, syncRecord: current };
      }
    }

    return {
      status: "synced",
      alreadySynced: false,
      syncRecord: lease.syncRecord,
      winners: winnerDetails,
    };
  } catch (error) {
    try {
      await DistributionSync.updateOne(
        { _id: lease.syncRecord._id, leaseOwner: lease.leaseOwner },
        {
          $set: {
            status: "failed",
            lastError: getSafeErrorCode(error, "DISTRIBUTION_SYNC_FAILED"),
            leaseOwner: null,
            leaseExpiresAt: null,
            nextRetryAt: new Date(
              Date.now() +
                Math.min(
                  60_000 * 2 ** Math.max(0, lease.syncRecord.attempts - 1),
                  60 * 60 * 1000,
                ),
            ),
          },
        },
      );
    } catch (statusError) {
      logRequestError(
        null,
        "distribution_sync_failure_persist_failed",
        statusError,
        "error",
        {
          resourceId: String(identity.bountyId),
          transactionId: identity.transactionHash,
          chainId: identity.chainId,
        },
      );
    }
    throw error;
  }
};

module.exports = {
  assertSameDistribution,
  incrementWinnerCompletionOnce,
  persistWinnerReward,
  synchronizeDistribution,
};
