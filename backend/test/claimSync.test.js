const test = require("node:test");
const assert = require("node:assert/strict");
const ClaimSync = require("../modules/claimSync.module");
const Reward = require("../modules/reward.module");
const User = require("../modules/user.module");
const Bounty = require("../modules/bounty.module");
const { synchronizeClaim } = require("../services/claimSync.service");

const wallet = "0x2222222222222222222222222222222222222222";
const bountyId = "507f1f77bcf86cd799439011";
const txHash = `0x${"a".repeat(64)}`;
const contract = "0x498482e334269a10d0621D3AC5e726734B01DDCe".toLowerCase();
const event = {
  logIndex: 2,
  blockNumber: 100n,
  blockHash: `0x${"b".repeat(64)}`,
  amount: "1000000000000000001",
};
const identity = {
  bountyId,
  chainId: 5042,
  bountyContract: contract,
  transactionHash: txHash,
  winnerAddress: wallet,
};

const createHarness = (
  t,
  {
    failFirstUserEffect = false,
    failFirstBountyUpdate = false,
    holdUserEffect = false,
  } = {},
) => {
  const originals = {
    claimSyncFindOneAndUpdate: ClaimSync.findOneAndUpdate,
    claimSyncUpdateOne: ClaimSync.updateOne,
    claimSyncFindById: ClaimSync.findById,
    rewardFindOneAndUpdate: Reward.findOneAndUpdate,
    rewardFindById: Reward.findById,
    rewardCountDocuments: Reward.countDocuments,
    userUpdateOne: User.updateOne,
    userFindOne: User.findOne,
    bountyUpdateOne: Bounty.updateOne,
  };
  const record = {
    _id: "claim-sync-id",
    rewardId: "reward-id",
    bountyId,
    winnerAddress: wallet,
    chainId: identity.chainId,
    bountyContract: contract,
    transactionHash: txHash,
    logIndex: event.logIndex,
    blockNumber: event.blockNumber.toString(),
    blockHash: event.blockHash,
    amount: event.amount,
    status: "pending",
    attempts: 0,
    leaseOwner: null,
  };
  const reward = {
    _id: "reward-id",
    bountyId,
    bountyTitle: "Verified reward",
    winnerAddress: wallet,
    amount: event.amount,
    amountFormatted: "1.000000000000000001",
    status: "assigned",
  };
  const user = { claimedRewards: [] };
  let failEffect = failFirstUserEffect;
  let failBountyUpdate = failFirstBountyUpdate;
  let releaseEffect;
  let effectEntered;
  const effectHeld = new Promise((resolve) => {
    releaseEffect = resolve;
  });
  const entered = new Promise((resolve) => {
    effectEntered = resolve;
  });

  ClaimSync.findOneAndUpdate = async (_filter, update, options) => {
    if (options?.upsert) return { ...record };
    if (record.status === "processing" && record.leaseExpiresAt > new Date()) {
      return null;
    }
    if (record.status === "synced") return null;
    Object.assign(record, update.$set, {
      attempts: record.attempts + (update.$inc?.attempts || 0),
    });
    return { ...record };
  };
  ClaimSync.updateOne = async (filter, update) => {
    if (filter.leaseOwner && filter.leaseOwner !== record.leaseOwner) {
      return { matchedCount: 0 };
    }
    Object.assign(record, update.$set);
    return { matchedCount: 1 };
  };
  ClaimSync.findById = async () => ({ ...record });

  Reward.findOneAndUpdate = async (_filter, update) => {
    if (reward.status !== "assigned") return null;
    Object.assign(reward, update.$set);
    return { ...reward };
  };
  Reward.findById = () => ({
    lean: async () => ({ ...reward }),
  });
  Reward.countDocuments = async () => 0;
  Bounty.updateOne = async () => {
    if (failBountyUpdate) {
      failBountyUpdate = false;
      throw new Error("Injected bounty projection failure");
    }
    return { matchedCount: 1 };
  };

  User.updateOne = async (_filter, update) => {
    if (update.$setOnInsert) return { matchedCount: 1 };
    effectEntered();
    if (holdUserEffect) await effectHeld;
    if (failEffect) {
      failEffect = false;
      throw new Error("Injected user projection failure");
    }
    const key = update.$push.claimedRewards.claimEventKey;
    if (user.claimedRewards.some((entry) => entry.claimEventKey === key)) {
      return { matchedCount: 0 };
    }
    user.claimedRewards.push(update.$push.claimedRewards);
    return { matchedCount: 1 };
  };
  User.findOne = () => ({
    select() {
      return this;
    },
    lean: async () => ({ _id: "user-id" }),
  });

  t.after(() => {
    ClaimSync.findOneAndUpdate = originals.claimSyncFindOneAndUpdate;
    ClaimSync.updateOne = originals.claimSyncUpdateOne;
    ClaimSync.findById = originals.claimSyncFindById;
    Reward.findOneAndUpdate = originals.rewardFindOneAndUpdate;
    Reward.findById = originals.rewardFindById;
    Reward.countDocuments = originals.rewardCountDocuments;
    User.updateOne = originals.userUpdateOne;
    User.findOne = originals.userFindOne;
    Bounty.updateOne = originals.bountyUpdateOne;
  });

  return {
    record,
    reward,
    user,
    entered,
    releaseEffect,
  };
};

test("claim event and reward identity indexes are unique", () => {
  const claimIndexes = ClaimSync.schema
    .indexes()
    .filter(([, options]) => options.unique)
    .map(([fields]) => Object.keys(fields).join(","));
  const rewardClaimIndex = Reward.schema
    .indexes()
    .find(([fields, options]) => options.unique && options.partialFilterExpression);

  assert.deepEqual(claimIndexes, [
    "chainId,bountyContract,transactionHash,logIndex",
    "rewardId",
  ]);
  assert.deepEqual(Object.keys(rewardClaimIndex[0]), [
    "chainId",
    "bountyContract",
    "claimTxHash",
    "claimLogIndex",
  ]);
});

test("failed claim projection resumes without duplicate earnings records", async (t) => {
  const harness = createHarness(t, { failFirstUserEffect: true });

  await assert.rejects(
    synchronizeClaim({
      reward: harness.reward,
      bounty: { _id: bountyId },
      identity,
      event,
    }),
    /Injected user projection failure/,
  );
  assert.equal(harness.record.status, "failed");
  assert.equal(harness.reward.status, "claimed");
  const originalClaimedAt = harness.reward.claimedAt;

  const result = await synchronizeClaim({
    reward: harness.reward,
    bounty: { _id: bountyId },
    identity,
    event,
  });

  assert.equal(result.status, "synced");
  assert.equal(harness.record.status, "synced");
  assert.equal(harness.user.claimedRewards.length, 1);
  assert.equal(harness.reward.claimedAt, originalClaimedAt);
  assert.equal(harness.user.claimedRewards[0].amountWei, event.amount);
  assert.equal(harness.user.claimedRewards[0].accountingVersion, "base-units-v1");
  assert.equal(harness.user.claimedRewards[0].token, "USDC");
  assert.equal(harness.user.claimedRewards[0].tokenDecimals, 18);
});

test("concurrent duplicate claim requests apply the user effect once", async (t) => {
  const harness = createHarness(t, { holdUserEffect: true });
  const args = {
    reward: harness.reward,
    bounty: { _id: bountyId },
    identity,
    event,
  };

  const first = synchronizeClaim(args);
  await harness.entered;
  const second = await synchronizeClaim(args);
  assert.equal(second.status, "pending");
  harness.releaseEffect();
  assert.equal((await first).status, "synced");
  assert.equal(harness.user.claimedRewards.length, 1);
});

test("claim retry after the user ledger write does not credit earnings twice", async (t) => {
  const harness = createHarness(t, { failFirstBountyUpdate: true });
  const args = {
    reward: harness.reward,
    bounty: { _id: bountyId },
    identity,
    event,
  };

  await assert.rejects(synchronizeClaim(args), /Injected bounty projection failure/);
  assert.equal(harness.record.status, "failed");
  assert.equal(harness.user.claimedRewards.length, 1);

  assert.equal((await synchronizeClaim(args)).status, "synced");
  assert.equal(harness.record.status, "synced");
  assert.equal(harness.user.claimedRewards.length, 1);
});
