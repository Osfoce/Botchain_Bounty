import test from "node:test";
import assert from "node:assert/strict";
import { retryUntilVerified } from "./transactionSync.js";

test("retries pending confirmations and returns the verified response", async () => {
  let calls = 0;
  const synchronize = async () => {
    calls += 1;
    return calls === 1
      ? { status: 202, data: { status: "pending_confirmation" } }
      : { status: 201, data: { status: "synced" } };
  };

  const result = await retryUntilVerified(synchronize, {
    intervalMs: 0,
    maxAttempts: 2,
  });

  assert.equal(calls, 2);
  assert.equal(result.status, 201);
});

test("retries temporary RPC errors and preserves non-retryable failures", async () => {
  let calls = 0;
  const synchronize = async () => {
    calls += 1;
    if (calls === 1) {
      throw { response: { status: 503, data: { retryable: true } } };
    }
    return { status: 200, data: { status: "synced" } };
  };

  const result = await retryUntilVerified(synchronize, {
    intervalMs: 0,
    maxAttempts: 2,
  });
  assert.equal(result.status, 200);

  const rejected = new Error("Transaction reverted");
  await assert.rejects(
    retryUntilVerified(() => Promise.reject(rejected), {
      intervalMs: 0,
      maxAttempts: 2,
    }),
    (error) => error === rejected,
  );
});

test("returns an explicit pending error after its retry budget", async () => {
  let calls = 0;
  const synchronize = async () => {
    calls += 1;
    return { status: 202, data: { status: "pending_confirmation" } };
  };

  await assert.rejects(
    retryUntilVerified(synchronize, { intervalMs: 0, maxAttempts: 2 }),
    (error) => error.code === "TRANSACTION_SYNC_PENDING",
  );
  assert.equal(calls, 2);
});
