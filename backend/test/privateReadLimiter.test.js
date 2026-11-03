const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { createPrivateReadLimiter } = require("../middleware/privateReadLimiter");

class MemoryRateLimitStore {
  constructor(windowMs) {
    this.windowMs = windowMs;
    this.entries = new Map();
  }

  async increment(key) {
    const now = Date.now();
    let entry = this.entries.get(key);
    if (!entry || entry.resetTime <= now) {
      entry = { totalHits: 0, resetTime: now + this.windowMs };
      this.entries.set(key, entry);
    }
    entry.totalHits += 1;
    return { ...entry, resetTime: new Date(entry.resetTime) };
  }

  async decrement(key) {
    const entry = this.entries.get(key);
    if (entry) entry.totalHits = Math.max(0, entry.totalHits - 1);
  }

  async resetKey(key) {
    this.entries.delete(key);
  }
}

const startApp = async (t, limiter) => {
  const app = express();
  app.get(
    "/private",
    (req, _res, next) => {
      req.auth = { walletAddress: req.get("x-wallet") };
      next();
    },
    limiter,
    (_req, res) => res.status(200).json({ ok: true }),
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/private`;
};

const makeLimiter = (options = {}) =>
  createPrivateReadLimiter({
    limit: 1,
    ipLimit: 10,
    windowMs: 60_000,
    storeFactory: () => new MemoryRateLimitStore(60_000),
    ...options,
  });

test("private read limiter returns a stable 429 after the wallet limit", async (t) => {
  const url = await startApp(t, makeLimiter());
  const firstResponse = await fetch(url, {
    headers: { "x-wallet": "0x1111111111111111111111111111111111111111" },
  });
  const secondResponse = await fetch(url, {
    headers: { "x-wallet": "0x1111111111111111111111111111111111111111" },
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 429);
  assert.deepEqual(await secondResponse.json(), {
    code: "RATE_LIMITED",
    error: "Too many requests. Try again later.",
  });
});

test("private reads distinguish wallets behind the same IP address", async (t) => {
  const url = await startApp(t, makeLimiter());
  const firstResponse = await fetch(url, {
    headers: { "x-wallet": "0x1111111111111111111111111111111111111111" },
  });
  const secondResponse = await fetch(url, {
    headers: { "x-wallet": "0x2222222222222222222222222222222222222222" },
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
});
