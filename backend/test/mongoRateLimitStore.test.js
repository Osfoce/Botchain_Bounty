const test = require("node:test");
const assert = require("node:assert/strict");
const MongoRateLimitStore = require("../middleware/mongoRateLimitStore");
const ApiRateLimit = require("../modules/apiRateLimit.module");

const createModel = () => {
  const records = new Map();
  const clone = (record) => (record ? { ...record } : null);
  const matchesActive = (record, filter) =>
    record &&
    record.key === filter.key &&
    (!filter.expiresAt?.$gt || record.expiresAt > filter.expiresAt.$gt);
  const query = (resolve) => ({ lean: async () => clone(await resolve()) });

  return {
    records,
    findOneAndUpdate(filter, update) {
      return query(() => {
        const record = records.get(filter.key);
        const active = matchesActive(record, filter);
        const expired =
          record &&
          filter.$or?.some(
            (condition) =>
              (condition.expiresAt?.$lte &&
                record.expiresAt <= condition.expiresAt.$lte) ||
              (condition.expiresAt?.$exists === false &&
                record.expiresAt === undefined),
          );
        if (!active && !expired) return null;

        if (update.$inc) {
          record.hits += update.$inc.hits;
        }
        if (update.$set) Object.assign(record, update.$set);
        return record;
      });
    },
    async create(record) {
      if (records.has(record.key)) {
        const error = new Error("duplicate key");
        error.code = 11000;
        throw error;
      }
      records.set(record.key, { ...record });
      return clone(record);
    },
    async updateOne(filter, update) {
      const record = records.get(filter.key);
      if (
        record &&
        record.expiresAt > filter.expiresAt.$gt &&
        record.hits > filter.hits.$gt
      ) {
        record.hits += update.$inc.hits;
      }
    },
    async deleteOne(filter) {
      records.delete(filter.key);
    },
    findOne(filter) {
      return query(() => {
        const record = records.get(filter.key);
        return matchesActive(record, filter) ? record : null;
      });
    },
  };
};

test("rate-limit collection declares unique keys and TTL expiry", () => {
  const indexes = ApiRateLimit.schema.indexes();

  assert.equal(ApiRateLimit.collection.name, "apiRateLimits");
  assert.ok(indexes.some(([fields, options]) => fields.key === 1 && options.unique));
  assert.ok(
    indexes.some(
      ([fields, options]) =>
        fields.expiresAt === 1 && options.expireAfterSeconds === 0,
    ),
  );
});

test("Mongo rate-limit store increments, decrements, reads, and resets shared counters", async () => {
  const model = createModel();
  const store = new MongoRateLimitStore({
    windowMs: 60_000,
    prefix: "test",
    model,
  });

  assert.equal((await store.increment("client")).totalHits, 1);
  assert.equal((await store.increment("client")).totalHits, 2);
  assert.equal((await store.get("client")).totalHits, 2);
  await store.decrement("client");
  assert.equal((await store.get("client")).totalHits, 1);
  await store.resetKey("client");
  assert.equal(await store.get("client"), undefined);
});

test("separate store instances share the same Mongo-backed counter", async () => {
  const model = createModel();
  const firstInstance = new MongoRateLimitStore({
    windowMs: 60_000,
    prefix: "shared",
    model,
  });
  const secondInstance = new MongoRateLimitStore({
    windowMs: 60_000,
    prefix: "shared",
    model,
  });

  const [first, second] = await Promise.all([
    firstInstance.increment("client"),
    secondInstance.increment("client"),
  ]);

  assert.deepEqual(
    [first.totalHits, second.totalHits].sort((a, b) => a - b),
    [1, 2],
  );
  assert.equal((await firstInstance.get("client")).totalHits, 2);
});

test("Mongo rate-limit store starts a fresh window after expiration", async () => {
  const model = createModel();
  const store = new MongoRateLimitStore({
    windowMs: 60_000,
    prefix: "test",
    model,
  });

  await store.increment("client");
  model.records.get(store.storageKey("client")).expiresAt = new Date(Date.now() - 1);
  const freshWindow = await store.increment("client");

  assert.equal(freshWindow.totalHits, 1);
  assert.ok(freshWindow.resetTime > new Date());
});

test("Mongo rate-limit store marks database failures for a stable 503 response", async () => {
  const model = {
    findOneAndUpdate() {
      throw new Error("internal database details");
    },
  };
  const store = new MongoRateLimitStore({
    windowMs: 60_000,
    prefix: "test",
    model,
  });

  await assert.rejects(store.increment("client"), {
    code: "RATE_LIMIT_STORE_UNAVAILABLE",
  });
});
