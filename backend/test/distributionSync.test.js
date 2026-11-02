const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../modules/user.module");
const DistributionSync = require("../modules/distributionSync.module");
const DistributionScanCheckpoint = require("../modules/distributionScanCheckpoint.module");
const Bounty = require("../modules/bounty.module");
const { CHAINS } = require("../config/chains");
const {
  assertSameDistribution,
  incrementWinnerCompletionOnce,
} = require("../services/distributionSync.service");

test("distribution sync has unique event and logical-distribution indexes", () => {
  const uniqueIndexes = DistributionSync.schema
    .indexes()
    .filter(([, options]) => options.unique)
    .map(([fields]) => Object.keys(fields).join(","));

  assert.deepEqual(uniqueIndexes, [
    "chainId,bountyContract,transactionHash,logIndex",
    "chainId,bountyContract,blockchainId",
  ]);
});

test("distribution scan checkpoints are unique per chain and contract", () => {
  const uniqueIndexes = DistributionScanCheckpoint.schema
    .indexes()
    .filter(([, options]) => options.unique)
    .map(([fields]) => Object.keys(fields).join(","));

  assert.deepEqual(uniqueIndexes, ["chainId,bountyContract"]);
});

test("Arc and BOT testnets are enabled with trusted bounty contracts", () => {
  const expectedContract = "0x498482e334269a10d0621D3AC5e726734B01DDCe";
  assert.equal(CHAINS[5042002].bountyContract, expectedContract);
  assert.equal(CHAINS[968].bountyContract, expectedContract);
  assert.equal(CHAINS[5042002].chain.id, 5042002);
  assert.equal(CHAINS[968].chain.id, 968);
  assert.ok(Bounty.schema.path("network").enumValues.includes("5042002"));
  assert.ok(Bounty.schema.path("network").enumValues.includes("968"));
});

test("winner completion is incremented once for a distribution on retries", async (t) => {
  const originalUpdateOne = User.updateOne;
  const userState = new Map();
  User.updateOne = async (filter, update, options = {}) => {
    const wallet = filter.walletAddress;
    let user = userState.get(wallet);

    if (!user && options.upsert) {
      user = { tasksCompleted: 0, distributionKeys: new Set() };
      userState.set(wallet, user);
    }

    if (!user) return { matchedCount: 0 };
    if (
      filter["stats.completedDistributionKeys"]?.$ne &&
      user.distributionKeys.has(
        filter["stats.completedDistributionKeys"].$ne,
      )
    ) {
      return { matchedCount: 0 };
    }
    if (update.$inc?.["stats.tasksCompleted"]) {
      user.tasksCompleted += update.$inc["stats.tasksCompleted"];
      user.distributionKeys.add(
        update.$addToSet["stats.completedDistributionKeys"],
      );
    }
    return { matchedCount: 1 };
  };
  t.after(() => {
    User.updateOne = originalUpdateOne;
  });

  await incrementWinnerCompletionOnce(
    "0x0000000000000000000000000000000000000001",
    "677:contract:tx:1",
  );
  await incrementWinnerCompletionOnce(
    "0x0000000000000000000000000000000000000001",
    "677:contract:tx:1",
  );

  assert.equal(
    userState.get("0x0000000000000000000000000000000000000001")
      .tasksCompleted,
    1,
  );
});

test("same bounty distribution is accepted as a retry and different tx is rejected", () => {
  const recorded = {
    network: "677",
    bountyContract: "0x498482e334269a10d0621D3AC5e726734B01DDCe",
    distributionTxHash: `0x${"a".repeat(64)}`,
  };
  const identity = {
    chainId: 677,
    bountyContract: recorded.bountyContract.toLowerCase(),
    transactionHash: recorded.distributionTxHash,
  };

  assert.doesNotThrow(() => assertSameDistribution(recorded, identity));
  assert.throws(
    () =>
      assertSameDistribution(recorded, {
        ...identity,
        transactionHash: `0x${"b".repeat(64)}`,
      }),
    { code: "CONFLICTING_DISTRIBUTION" },
  );
});
