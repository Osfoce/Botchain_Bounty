const test = require("node:test");
const assert = require("node:assert/strict");
const { ensureFinancialIndexes } = require("../scripts/ensureFinancialIndexes");

test("duplicate financial records block index creation without deleting records", async () => {
  let createdIndexes = 0;
  const model = {
    collection: { name: "claimSyncs" },
    aggregate: async (pipeline) => {
      assert.equal(pipeline.some((stage) => stage.$group), true);
      return [{ _id: { rewardId: "reward-id" }, count: 2, recordIds: ["a", "b"] }];
    },
    createIndexes: async () => {
      createdIndexes += 1;
    },
  };

  const result = await ensureFinancialIndexes({
    definitions: [{ model, name: "single claim per reward", fields: { rewardId: "$rewardId" } }],
    models: [model],
  });

  assert.equal(result.created, false);
  assert.equal(result.duplicateReports[0].duplicates[0].count, 2);
  assert.equal(createdIndexes, 0);
});

test("indexes are created only after all duplicate scans are clean", async () => {
  let createdIndexes = 0;
  const model = {
    collection: { name: "claimSyncs" },
    aggregate: async () => [],
    createIndexes: async () => {
      createdIndexes += 1;
    },
  };

  const result = await ensureFinancialIndexes({
    definitions: [{ model, name: "single claim per reward", fields: { rewardId: "$rewardId" } }],
    models: [model],
  });

  assert.equal(result.created, true);
  assert.equal(createdIndexes, 1);
});
