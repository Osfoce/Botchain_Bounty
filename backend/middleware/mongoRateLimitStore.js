const { createHash } = require("node:crypto");
const ApiRateLimit = require("../modules/apiRateLimit.module");

class MongoRateLimitStore {
  constructor({ windowMs, prefix, model = ApiRateLimit }) {
    this.windowMs = windowMs;
    this.prefix = prefix;
    this.model = model;
  }

  async increment(key) {
    try {
      return await this.incrementStoredKey(key);
    } catch (error) {
      if (error?.code === "RATE_LIMIT_STORE_UNAVAILABLE") throw error;
      throw this.storeError(error);
    }
  }

  async incrementStoredKey(key) {
    const now = new Date();
    const storedKey = this.storageKey(key);
    const activeWindow = await this.model
      .findOneAndUpdate(
        { key: storedKey, expiresAt: { $gt: now } },
        { $inc: { hits: 1 } },
        { returnDocument: "after" },
      )
      .lean();

    if (activeWindow) {
      return this.toRateLimitInfo(activeWindow);
    }

    const expiresAt = new Date(now.getTime() + this.windowMs);
    const expiredWindow = await this.model
      .findOneAndUpdate(
        {
          key: storedKey,
          $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $exists: false } }],
        },
        { $set: { hits: 1, expiresAt } },
        { returnDocument: "after" },
      )
      .lean();
    if (expiredWindow) {
      return this.toRateLimitInfo(expiredWindow);
    }

    try {
      const created = await this.model.create({
        key: storedKey,
        hits: 1,
        expiresAt,
      });
      return this.toRateLimitInfo(created);
    } catch (error) {
      if (error?.code !== 11000) throw error;

      const racedWindow = await this.model
        .findOneAndUpdate(
          { key: storedKey, expiresAt: { $gt: new Date() } },
          { $inc: { hits: 1 } },
          { returnDocument: "after" },
        )
        .lean();
      if (racedWindow) {
        return this.toRateLimitInfo(racedWindow);
      }
      throw error;
    }
  }

  async decrement(key) {
    try {
      const now = new Date();
      await this.model.updateOne(
        {
          key: this.storageKey(key),
          expiresAt: { $gt: now },
          hits: { $gt: 0 },
        },
        { $inc: { hits: -1 } },
      );
    } catch (error) {
      throw this.storeError(error);
    }
  }

  async resetKey(key) {
    try {
      await this.model.deleteOne({ key: this.storageKey(key) });
    } catch (error) {
      throw this.storeError(error);
    }
  }

  async get(key) {
    try {
      const record = await this.model
        .findOne({
          key: this.storageKey(key),
          expiresAt: { $gt: new Date() },
        })
        .lean();
      return record ? this.toRateLimitInfo(record) : undefined;
    } catch (error) {
      throw this.storeError(error);
    }
  }

  toRateLimitInfo(record) {
    return {
      totalHits: record.hits,
      resetTime: new Date(record.expiresAt),
    };
  }

  storageKey(key) {
    const digest = createHash("sha256").update(String(key)).digest("hex");
    return `${this.prefix}:${digest}`;
  }

  storeError(error) {
    const wrapped = new Error("Shared rate-limit storage is unavailable");
    wrapped.code = "RATE_LIMIT_STORE_UNAVAILABLE";
    wrapped.cause = error;
    return wrapped;
  }
}

module.exports = MongoRateLimitStore;
