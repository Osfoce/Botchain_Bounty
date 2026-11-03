const test = require("node:test");
const assert = require("node:assert/strict");
const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const User = require("../modules/user.module");
const Submission = require("../modules/submission.module");
const DistributionSync = require("../modules/distributionSync.module");
const { synchronizeDistribution } = require("../services/distributionSync.service");

const bountyId = "507f1f77bcf86cd799439011";
const chainId = 5042;
const contract = "0x498482e334269a10d0621D3AC5e726734B01DDCe".toLowerCase();
const transactionHash = `0x${"a".repeat(64)}`;
const winner = "0x2222222222222222222222222222222222222222";
const identity = {
  bountyId,
  blockchainId: "123",
  chainId,
  bountyContract: contract,
  transactionHash,
};
const event = {
  logIndex: 2,
  blockNumber: 100n,
  blockHash: `0x${"b".repeat(64)}`,
  winners: [winner],
};

const createHarness = (t, { failAfterReward = false, failAfterBounty = false } = {}) => {
  const originals = {
    bountyUpdateOne: Bounty.updateOne,
    rewardFindOne: Reward.findOne,
    rewardUpdateOne: Reward.updateOne,
    userUpdateOne: User.updateOne,
    submissionUpdateMany: Submission.updateMany,
    syncFindOne: DistributionSync.findOne,
    syncFindOneAndUpdate: DistributionSync.findOneAndUpdate,
    syncUpdateOne: DistributionSync.updateOne,
    syncFindById: DistributionSync.findById,
  };
  const bounty = {
    _id: bountyId,
    title: "Recovery bounty",
    network: String(chainId),
    bountyContract: contract,
    distributionTxHash: null,
    distributedAt: null,
  };
  let syncRecord = null;
  const rewards = new Map();
  const users = new Map();
  let shouldFailAfterReward = failAfterReward;
  let shouldFailAfterBounty = failAfterBounty;

  Bounty.updateOne = async (_filter, update) => {
    Object.assign(bounty, update.$set);
    if (shouldFailAfterBounty) {
      shouldFailAfterBounty = false;
      throw new Error("Injected failure after bounty projection");
    }
    return { matchedCount: 1 };
  };
  Reward.findOne = async (filter) =>
    rewards.get(`${filter.bountyId}:${filter.winnerAddress}`) || null;
  Reward.updateOne = async (filter, update) => {
    const key = `${filter.bountyId}:${filter.winnerAddress}`;
    if (!rewards.has(key)) {
      rewards.set(key, { ...update.$setOnInsert });
    }
    return { upsertedCount: rewards.has(key) ? 1 : 0 };
  };
  User.updateOne = async (filter, update) => {
    let user = users.get(filter.walletAddress);
    if (update.$setOnInsert) {
      if (!user) users.set(filter.walletAddress, (user = { completed: 0, keys: new Set() }));
      return { matchedCount: 1 };
    }
    if (!user || user.keys.has(filter["stats.completedDistributionKeys"].$ne)) {
      return { matchedCount: 0 };
    }
    user.completed += update.$inc["stats.tasksCompleted"];
    user.keys.add(update.$addToSet["stats.completedDistributionKeys"]);
    return { matchedCount: 1 };
  };
  Submission.updateMany = async () => {
    if (shouldFailAfterReward) {
      shouldFailAfterReward = false;
      throw new Error("Injected failure after reward upsert");
    }
    return { matchedCount: 1 };
  };
  DistributionSync.findOne = async () => syncRecord;
  DistributionSync.findOneAndUpdate = async (filter, update, options) => {
    if (options?.upsert) {
      if (!syncRecord) {
        syncRecord = {
          _id: "distribution-sync-id",
          ...update.$setOnInsert,
          attempts: 0,
          status: "pending",
        };
      }
      return { ...syncRecord };
    }
    if (
      syncRecord.status === "processing" &&
      syncRecord.leaseExpiresAt > new Date()
    ) {
      return null;
    }
    Object.assign(syncRecord, update.$set, {
      attempts: syncRecord.attempts + (update.$inc?.attempts || 0),
    });
    return { ...syncRecord };
  };
  DistributionSync.updateOne = async (filter, update) => {
    if (filter.leaseOwner && filter.leaseOwner !== syncRecord.leaseOwner) {
      return { matchedCount: 0 };
    }
    Object.assign(syncRecord, update.$set);
    return { matchedCount: 1 };
  };
  DistributionSync.findById = async () => ({ ...syncRecord });

  t.after(() => {
    Bounty.updateOne = originals.bountyUpdateOne;
    Reward.findOne = originals.rewardFindOne;
    Reward.updateOne = originals.rewardUpdateOne;
    User.updateOne = originals.userUpdateOne;
    Submission.updateMany = originals.submissionUpdateMany;
    DistributionSync.findOne = originals.syncFindOne;
    DistributionSync.findOneAndUpdate = originals.syncFindOneAndUpdate;
    DistributionSync.updateOne = originals.syncUpdateOne;
    DistributionSync.findById = originals.syncFindById;
  });

  return { bounty, rewards, users, getSyncRecord: () => syncRecord };
};

const synchronize = (harness, publicClient = { readContract: async () => 100n }) =>
  synchronizeDistribution({
    bounty: harness.bounty,
    publicClient,
    identity,
    event,
  });

test("distribution retry completes after a failure following reward upsert", async (t) => {
  const harness = createHarness(t, { failAfterReward: true });

  await assert.rejects(synchronize(harness), /Injected failure after reward upsert/);
  assert.equal(harness.rewards.size, 1);
  assert.equal(harness.getSyncRecord().status, "failed");

  assert.equal((await synchronize(harness)).status, "synced");
  assert.equal(harness.rewards.size, 1);
  assert.equal(harness.users.get(winner).completed, 1);
});

test("repeating a verified distribution event returns one synchronized result", async (t) => {
  const harness = createHarness(t);

  assert.equal((await synchronize(harness)).status, "synced");
  const retry = await synchronize(harness);

  assert.equal(retry.status, "synced");
  assert.equal(retry.alreadySynced, true);
  assert.equal(harness.rewards.size, 1);
  assert.equal(harness.users.get(winner).completed, 1);
});

test("concurrent distribution retries acquire one lease and apply one set of effects", async (t) => {
  const harness = createHarness(t);
  let releaseRead;
  let enteredRead;
  const blockedRead = new Promise((resolve) => {
    releaseRead = resolve;
  });
  const readStarted = new Promise((resolve) => {
    enteredRead = resolve;
  });
  const client = {
    readContract: async () => {
      enteredRead();
      await blockedRead;
      return 100n;
    },
  };

  const first = synchronize(harness, client);
  await readStarted;
  const second = await synchronize(harness);
  assert.equal(second.status, "pending");
  releaseRead();

  assert.equal((await first).status, "synced");
  assert.equal(harness.rewards.size, 1);
  assert.equal(harness.users.get(winner).completed, 1);
});

test("distribution retry after bounty update does not increment winner statistics twice", async (t) => {
  const harness = createHarness(t, { failAfterBounty: true });

  await assert.rejects(synchronize(harness), /Injected failure after bounty projection/);
  assert.equal(harness.bounty.rewardsAssignedOnChain, true);
  assert.equal(harness.users.get(winner).completed, 1);
  assert.equal(harness.getSyncRecord().status, "failed");

  assert.equal((await synchronize(harness)).status, "synced");
  assert.equal(harness.users.get(winner).completed, 1);
  assert.equal(harness.getSyncRecord().status, "synced");
});
