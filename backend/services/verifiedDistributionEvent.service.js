const { parseEventLogs } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");

const isAddress = (address) =>
  typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address);

const fail = (code, message) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const verifyRewardsAssignedEvent = async ({
  publicClient,
  transactionHash,
  contractAddress,
  blockchainId,
  expectedLogIndex,
  expectedBlockHash,
}) => {
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: transactionHash });
  } catch {
    fail("TRANSACTION_NOT_CONFIRMED", "Transaction receipt is not available yet");
  }

  if (receipt.status !== "success") {
    fail("TRANSACTION_REVERTED", "Transaction failed on-chain");
  }
  if (
    !receipt.transactionHash ||
    receipt.transactionHash.toLowerCase() !== transactionHash.toLowerCase()
  ) {
    fail("EVENT_MISMATCH", "RPC returned a receipt for a different transaction");
  }
  if (
    expectedBlockHash &&
    (!receipt.blockHash ||
      receipt.blockHash.toLowerCase() !== expectedBlockHash.toLowerCase())
  ) {
    fail("EVENT_MISMATCH", "The event block is no longer canonical");
  }

  const normalizedContract = contractAddress.toLowerCase();
  const contractLogs = receipt.logs.filter(
    (log) =>
      typeof log.address === "string" &&
      log.address.toLowerCase() === normalizedContract,
  );
  let events = [];
  try {
    events = parseEventLogs({
      abi: BOUNTY_ABI,
      logs: contractLogs,
      eventName: "RewardsAssigned",
    });
  } catch {
    fail("EVENT_NOT_FOUND", "RewardsAssigned event could not be decoded");
  }

  if (!events.length) {
    fail("EVENT_NOT_FOUND", "RewardsAssigned event not found");
  }

  const matchingEvents = events.filter((event) => {
    try {
      return BigInt(event.args.bountyId) === BigInt(blockchainId);
    } catch {
      return false;
    }
  });
  if (matchingEvents.length !== 1) {
    fail("EVENT_MISMATCH", "Expected one RewardsAssigned event for this bounty");
  }

  const matchedEvent = matchingEvents[0];
  const logIndex = Number(matchedEvent.logIndex);
  const winners = matchedEvent.args.winners;
  if (
    matchedEvent.address?.toLowerCase() !== normalizedContract ||
    !Number.isSafeInteger(logIndex) ||
    logIndex < 0 ||
    !receipt.blockNumber ||
    (expectedLogIndex != null && logIndex !== expectedLogIndex) ||
    !Array.isArray(winners) ||
    winners.length === 0 ||
    winners.some((winner) => !isAddress(winner))
  ) {
    fail("EVENT_MISMATCH", "RewardsAssigned event has invalid identity or winners");
  }

  const normalizedWinners = winners.map((winner) => winner.toLowerCase());
  if (new Set(normalizedWinners).size !== normalizedWinners.length) {
    fail("EVENT_MISMATCH", "RewardsAssigned event contains duplicate winners");
  }

  return {
    receipt,
    event: {
      logIndex,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      winners: normalizedWinners,
    },
  };
};

module.exports = { verifyRewardsAssignedEvent };
