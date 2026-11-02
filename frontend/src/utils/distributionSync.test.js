import test from "node:test";
import assert from "node:assert/strict";
import {
  clearDistributionSyncRecord,
  getDistributionSyncStorageKey,
  isValidDistributionSyncRecord,
  readDistributionSyncRecord,
  saveDistributionSyncRecord,
} from "./distributionSync.js";

const record = {
  bountyId: "bounty-1",
  blockchainId: "42",
  chainId: 677,
  bountyContract: "0x498482e334269a10d0621D3AC5e726734B01DDCe",
  txHash: `0x${"a".repeat(64)}`,
  status: "pending_sync",
  createdAt: new Date().toISOString(),
};

const createStorage = () => {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
};

test("validates and stores pending distribution recovery data", () => {
  const storage = createStorage();
  const key = saveDistributionSyncRecord(storage, record);

  assert.equal(key, getDistributionSyncStorageKey(677, "bounty-1"));
  assert.deepEqual(readDistributionSyncRecord(storage, key), record);
  assert.equal(isValidDistributionSyncRecord(record), true);
});

test("refuses to overwrite a different unresolved transaction", () => {
  const storage = createStorage();
  saveDistributionSyncRecord(storage, record);

  assert.throws(
    () =>
      saveDistributionSyncRecord(storage, {
        ...record,
        txHash: `0x${"b".repeat(64)}`,
      }),
    /different unresolved distribution/,
  );
});

test("only clears the matching transaction recovery record", () => {
  const storage = createStorage();
  saveDistributionSyncRecord(storage, record);

  clearDistributionSyncRecord(storage, {
    ...record,
    txHash: `0x${"b".repeat(64)}`,
  });
  assert.deepEqual(
    readDistributionSyncRecord(
      storage,
      getDistributionSyncStorageKey(677, "bounty-1"),
    ),
    record,
  );

  clearDistributionSyncRecord(storage, record);
  assert.equal(
    readDistributionSyncRecord(
      storage,
      getDistributionSyncStorageKey(677, "bounty-1"),
    ),
    null,
  );
});
