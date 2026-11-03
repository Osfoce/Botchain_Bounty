const { parseEventLogs } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");

const isTransactionHash = (value) =>
  typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value);

const sameAddress = (left, right) =>
  typeof left === "string" &&
  typeof right === "string" &&
  left.toLowerCase() === right.toLowerCase();

const fail = (code, message) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const verifyConfirmedTransaction = async ({
  publicClient,
  transactionHash,
  contractAddress,
  expectedChainId,
  expectedFrom,
  confirmationDepth,
}) => {
  if (!isTransactionHash(transactionHash)) {
    fail("INVALID_TX_HASH", "Invalid transaction hash");
  }

  let actualChainId;
  try {
    actualChainId = await publicClient.getChainId();
  } catch {
    fail("RPC_UNAVAILABLE", "Could not verify the configured blockchain RPC");
  }
  if (actualChainId !== expectedChainId) {
    fail("CHAIN_CONFIGURATION_MISMATCH", "Configured RPC reports the wrong chain");
  }

  let transaction;
  try {
    transaction = await publicClient.getTransaction({ hash: transactionHash });
  } catch (error) {
    if (/notfound|not found/i.test(error.name || error.message || "")) {
      fail("TRANSACTION_NOT_FOUND", "Transaction was not found on the configured chain");
    }
    fail("RPC_UNAVAILABLE", "Could not verify the transaction on the configured chain");
  }
  if (
    !transaction?.hash ||
    transaction.hash.toLowerCase() !== transactionHash.toLowerCase()
  ) {
    fail("TRANSACTION_NOT_FOUND", "Transaction was not found on the configured chain");
  }
  if (!sameAddress(transaction.to, contractAddress)) {
    fail("WRONG_TRANSACTION_DESTINATION", "Transaction was not sent to the configured bounty contract");
  }
  if (expectedFrom && !sameAddress(transaction.from, expectedFrom)) {
    fail("EVENT_WALLET_MISMATCH", "Transaction sender does not match the authenticated wallet");
  }
  if (
    transaction.chainId != null &&
    Number(transaction.chainId) !== expectedChainId
  ) {
    fail("CHAIN_CONFIGURATION_MISMATCH", "Transaction belongs to a different chain");
  }

  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: transactionHash });
  } catch {
    fail("TRANSACTION_NOT_CONFIRMED", "Transaction is still awaiting confirmation");
  }
  if (receipt.status !== "success") {
    fail("TRANSACTION_REVERTED", "Transaction reverted on-chain");
  }
  if (
    !receipt.transactionHash ||
    receipt.transactionHash.toLowerCase() !== transactionHash.toLowerCase()
  ) {
    fail("TRANSACTION_NOT_FOUND", "Receipt does not match the supplied transaction");
  }
  if (
    (transaction.blockHash &&
      transaction.blockHash.toLowerCase() !== receipt.blockHash?.toLowerCase()) ||
    (transaction.blockNumber != null &&
      transaction.blockNumber !== receipt.blockNumber)
  ) {
    fail("TRANSACTION_NOT_CONFIRMED", "Transaction and receipt block identities do not match");
  }
  if (!receipt.blockNumber || !receipt.blockHash) {
    fail("TRANSACTION_NOT_CONFIRMED", "Transaction is not included in a confirmed block");
  }

  let head;
  let canonicalBlock;
  try {
    [head, canonicalBlock] = await Promise.all([
      publicClient.getBlockNumber(),
      publicClient.getBlock({ blockNumber: receipt.blockNumber }),
    ]);
  } catch {
    fail("RPC_UNAVAILABLE", "Could not verify transaction finality");
  }

  const safeBlock =
    head > BigInt(confirmationDepth)
      ? head - BigInt(confirmationDepth)
      : 0n;
  if (receipt.blockNumber > safeBlock) {
    fail("TRANSACTION_NOT_CONFIRMED", "Transaction has not reached the required confirmation depth");
  }
  if (
    !canonicalBlock?.hash ||
    canonicalBlock.hash.toLowerCase() !== receipt.blockHash.toLowerCase()
  ) {
    fail("TRANSACTION_NOT_CONFIRMED", "Transaction block is not canonical");
  }

  return { transaction, receipt };
};

const parseContractEvents = ({ receipt, eventName, contractAddress }) => {
  let events;
  try {
    events = parseEventLogs({
      abi: BOUNTY_ABI,
      logs: receipt.logs,
      eventName,
      strict: false,
    });
  } catch {
    fail("EXPECTED_EVENT_NOT_FOUND", `Expected ${eventName} event was not found`);
  }

  if (!events?.length) {
    fail("EXPECTED_EVENT_NOT_FOUND", `Expected ${eventName} event was not found`);
  }
  const contractEvents = events.filter((event) =>
    sameAddress(event.address, contractAddress),
  );
  if (!contractEvents.length) {
    fail("EVENT_EMITTER_MISMATCH", `${eventName} was emitted by an unexpected contract`);
  }
  return contractEvents;
};

module.exports = {
  fail,
  isTransactionHash,
  sameAddress,
  verifyConfirmedTransaction,
  parseContractEvents,
};
