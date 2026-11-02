const TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export const getDistributionSyncStorageKey = (chainId, bountyId) =>
  `happy-bounty:distribution-sync:${chainId}:${bountyId}`;

export const isValidDistributionSyncRecord = (record) =>
  record !== null &&
  typeof record === "object" &&
  typeof record.bountyId === "string" &&
  record.bountyId.length > 0 &&
  typeof record.blockchainId === "string" &&
  /^[0-9]+$/.test(record.blockchainId) &&
  Number.isSafeInteger(record.chainId) &&
  record.chainId > 0 &&
  typeof record.bountyContract === "string" &&
  ADDRESS_PATTERN.test(record.bountyContract) &&
  typeof record.txHash === "string" &&
  TX_HASH_PATTERN.test(record.txHash) &&
  ["pending_confirmation", "pending_sync"].includes(record.status) &&
  typeof record.createdAt === "string" &&
  Number.isFinite(Date.parse(record.createdAt));

export const readDistributionSyncRecord = (storage, key) => {
  try {
    const stored = storage.getItem(key);
    if (!stored) return null;

    const record = JSON.parse(stored);
    if (!isValidDistributionSyncRecord(record)) {
      storage.removeItem(key);
      console.warn("Discarded invalid pending distribution sync record");
      return null;
    }
    return record;
  } catch (error) {
    console.warn("Could not read pending distribution sync record:", error);
    return null;
  }
};

export const saveDistributionSyncRecord = (storage, record) => {
  if (!isValidDistributionSyncRecord(record)) {
    throw new Error("Invalid pending distribution sync record");
  }

  const key = getDistributionSyncStorageKey(record.chainId, record.bountyId);
  const existing = readDistributionSyncRecord(storage, key);
  if (
    existing &&
    existing.txHash.toLowerCase() !== record.txHash.toLowerCase()
  ) {
    throw new Error(
      "A different unresolved distribution transaction is already saved",
    );
  }

  if (!storage) throw new Error("Browser storage is unavailable");
  storage.setItem(key, JSON.stringify(record));
  return key;
};

export const clearDistributionSyncRecord = (storage, record) => {
  try {
    const key = getDistributionSyncStorageKey(record.chainId, record.bountyId);
    const existing = readDistributionSyncRecord(storage, key);
    if (
      existing &&
      existing.txHash.toLowerCase() === record.txHash.toLowerCase()
    ) {
      storage.removeItem(key);
    }
  } catch (error) {
    console.warn("Could not clear pending distribution sync record:", error);
  }
};
