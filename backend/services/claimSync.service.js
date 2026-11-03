const { randomUUID } = require("crypto");
const Bounty = require("../modules/bounty.module");
const ClaimSync = require("../modules/claimSync.module");
const Reward = require("../modules/reward.module");
const User = require("../modules/user.module");
const { getSafeErrorCode } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("./securityAudit.service");

const CLAIM_LEASE_MS = 2 * 60 * 1000;

const fail = (code, message) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const claimEventKey = (identity, event) =>
  [
    identity.chainId,
    identity.bountyContract.toLowerCase(),
    identity.transactionHash.toLowerCase(),
    event.logIndex,
  ].join(":");

const assertRecordIdentity = (record, identity, event, rewardId) => {
  if (String(record.rewardId) !== String(rewardId)) {
    fail("EVENT_ALREADY_APPLIED", "Claim event is already linked to another reward");
  }
  if (
    record.chainId !== identity.chainId ||
    record.bountyContract !== identity.bountyContract.toLowerCase() ||
    record.transactionHash !== identity.transactionHash.toLowerCase() ||
    record.logIndex !== event.logIndex ||
    String(record.bountyId) !== String(identity.bountyId) ||
    record.winnerAddress !== identity.winnerAddress.toLowerCase() ||
    String(record.amount) !== String(event.amount) ||
    String(record.blockNumber) !== event.blockNumber.toString() ||
    record.blockHash !== event.blockHash.toLowerCase()
  ) {
    fail("CONFLICTING_CLAIM", "A different claim event is already recorded for this reward");
  }
};

const upsertClaimRecord = async ({ reward, bounty, identity, event }) => {
  if (
    String(reward.bountyId) !== String(bounty._id) ||
    reward.winnerAddress?.toLowerCase() !== identity.winnerAddress.toLowerCase() ||
    !/^[0-9]+$/.test(String(reward.amount)) ||
    String(reward.amount) !== String(event.amount)
  ) {
    fail("CLAIM_REWARD_MISMATCH", "Verified claim does not match the stored reward");
  }

  const filter = {
    chainId: identity.chainId,
    bountyContract: identity.bountyContract.toLowerCase(),
    transactionHash: identity.transactionHash.toLowerCase(),
    logIndex: event.logIndex,
  };
  const values = {
    rewardId: reward._id,
    bountyId: bounty._id,
    winnerAddress: identity.winnerAddress.toLowerCase(),
    ...filter,
    blockNumber: event.blockNumber.toString(),
    blockHash: event.blockHash.toLowerCase(),
    amount: event.amount,
    status: "pending",
  };

  try {
    const record = await ClaimSync.findOneAndUpdate(
      filter,
      { $setOnInsert: values },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    assertRecordIdentity(record, identity, event, reward._id);
    return record;
  } catch (error) {
    if (error.code !== 11000) throw error;
    const [byEvent, byReward] = await Promise.all([
      ClaimSync.findOne(filter),
      ClaimSync.findOne({ rewardId: reward._id }),
    ]);
    if (byEvent) assertRecordIdentity(byEvent, identity, event, reward._id);
    if (byReward) assertRecordIdentity(byReward, identity, event, reward._id);
    if (byEvent || byReward) return byEvent || byReward;
    throw error;
  }
};

const acquireLease = async (record, { force }) => {
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
  const leased = await ClaimSync.findOneAndUpdate(
    {
      _id: record._id,
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
        leaseExpiresAt: new Date(now.getTime() + CLAIM_LEASE_MS),
        lastError: null,
        nextRetryAt: null,
      },
      $inc: { attempts: 1 },
    },
    { new: true },
  );
  return leased ? { record: leased, leaseOwner } : null;
};

const ensureUser = async (walletAddress) => {
  try {
    await User.updateOne(
      { walletAddress },
      { $setOnInsert: { walletAddress } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    const existing = await User.findOne({ walletAddress }).select("_id").lean();
    if (!existing) throw error;
  }
};

const applyClaimRecord = async (record, { force = true } = {}) => {
  if (record.status === "synced") {
    return { status: "synced", alreadySynced: true };
  }

  const lease = await acquireLease(record, { force });
  if (!lease) return { status: "pending", alreadySynced: false };

  const eventKey = claimEventKey(record, record);
  try {
    let rewardUpdate = await Reward.findOneAndUpdate(
      {
        _id: record.rewardId,
        bountyId: record.bountyId,
        winnerAddress: record.winnerAddress,
        amount: record.amount,
        status: "assigned",
      },
      {
        $set: {
          status: "claimed",
          claimedAt: new Date(),
          claimTxHash: record.transactionHash,
          claimLogIndex: record.logIndex,
          claimBlockNumber: record.blockNumber,
          claimBlockHash: record.blockHash,
        },
      },
      { new: true },
    );
    if (!rewardUpdate) {
      const currentReward = await Reward.findById(record.rewardId).lean();
      if (
        !currentReward ||
        currentReward.status !== "claimed" ||
        currentReward.claimTxHash !== record.transactionHash ||
        currentReward.claimLogIndex !== record.logIndex ||
        currentReward.claimBlockNumber !== record.blockNumber ||
        currentReward.claimBlockHash?.toLowerCase() !== record.blockHash ||
        String(currentReward.amount) !== record.amount ||
        String(currentReward.bountyId) !== String(record.bountyId) ||
        currentReward.winnerAddress?.toLowerCase() !== record.winnerAddress
      ) {
        fail("CONFLICTING_CLAIM", "Reward is already linked to a different claim event");
      }
      rewardUpdate = currentReward;
    }

    await ensureUser(record.winnerAddress);
    const userUpdate = await User.updateOne(
      {
        walletAddress: record.winnerAddress,
        "claimedRewards.claimEventKey": { $ne: eventKey },
      },
      {
        $push: {
          claimedRewards: {
            bountyId: String(record.bountyId),
            bountyTitle: rewardUpdate.bountyTitle || "Untitled bounty",
            chainId: record.chainId,
            amountWei: record.amount,
            amountFormatted: rewardUpdate.amountFormatted,
            claimedAt: rewardUpdate.claimedAt,
            txHash: record.transactionHash,
            claimEventKey: eventKey,
            accountingVersion: "base-units-v1",
          },
        },
        $set: { lastLogin: new Date() },
      },
    );
    if (!userUpdate.matchedCount) {
      const existingEffect = await User.findOne({
        walletAddress: record.winnerAddress,
        "claimedRewards.claimEventKey": eventKey,
      })
        .select("_id")
        .lean();
      if (!existingEffect) {
        throw new Error("Could not apply the claim to the winner's earnings ledger");
      }
    }

    const remaining = await Reward.countDocuments({
      bountyId: record.bountyId,
      status: "assigned",
    });
    if (remaining === 0) {
      await Bounty.updateOne(
        { _id: record.bountyId, lifecycleStatus: { $ne: "completed" } },
        { $set: { lifecycleStatus: "completed" } },
      );
    }

    const synced = await ClaimSync.updateOne(
      { _id: record._id, leaseOwner: lease.leaseOwner },
      {
        $set: {
          status: "synced",
          syncedAt: new Date(),
          leaseOwner: null,
          leaseExpiresAt: null,
          lastError: null,
          nextRetryAt: null,
        },
      },
    );
    if (!synced.matchedCount) {
      const current = await ClaimSync.findById(record._id);
      if (current?.status !== "synced") {
        return { status: "pending", alreadySynced: false };
      }
    }
    return { status: "synced", alreadySynced: false };
  } catch (error) {
    await ClaimSync.updateOne(
      { _id: record._id, leaseOwner: lease.leaseOwner },
      {
        $set: {
          status: "failed",
          lastError: getSafeErrorCode(error, "CLAIM_SYNC_FAILED"),
          leaseOwner: null,
          leaseExpiresAt: null,
          nextRetryAt: new Date(
            Date.now() +
              Math.min(
                60_000 * 2 ** Math.max(0, lease.record.attempts - 1),
                60 * 60 * 1000,
              ),
          ),
        },
      },
    );
    throw error;
  }
};

const synchronizeClaim = async ({ reward, bounty, identity, event }) => {
  const record = await upsertClaimRecord({ reward, bounty, identity, event });
  return applyClaimRecord(record);
};

const reconcilePendingClaims = async () => {
  const now = new Date();
  const records = await ClaimSync.find({
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
    .limit(25)
    .lean();

  for (const record of records) {
    try {
      await applyClaimRecord(record, { force: false });
    } catch (error) {
      await recordSecurityAudit({
        event: "claim_sync_failed",
        severity: "error",
        outcome: "failure",
        errorCode: getSafeErrorCode(error, "CLAIM_SYNC_FAILED"),
        resourceId: String(record.bountyId),
        transactionId: record.transactionHash,
        chainId: Number(record.chainId),
      });
    }
  }
};

module.exports = {
  applyClaimRecord,
  claimEventKey,
  reconcilePendingClaims,
  synchronizeClaim,
  upsertClaimRecord,
};
