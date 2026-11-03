const {
  fail,
  parseContractEvents,
  verifyConfirmedTransaction,
} = require("./verifiedTransaction.service");

const isAddress = (address) =>
  typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address);

const verifyRewardsAssignedEvent = async ({
  publicClient,
  transactionHash,
  contractAddress,
  chainId,
  confirmationDepth,
  blockchainId,
  expectedLogIndex,
  expectedBlockHash,
}) => {
  const { receipt } = await verifyConfirmedTransaction({
    publicClient,
    transactionHash,
    contractAddress,
    expectedChainId: chainId,
    confirmationDepth,
  });
  const events = parseContractEvents({
    receipt,
    eventName: "RewardsAssigned",
    contractAddress,
  });

  const matchingEvents = events.filter((event) => {
    try {
      return BigInt(event.args.bountyId) === BigInt(blockchainId);
    } catch {
      return false;
    }
  });
  if (!matchingEvents.length) {
    fail("EVENT_BOUNTY_MISMATCH", "RewardsAssigned event belongs to another bounty");
  }
  if (matchingEvents.length !== 1) {
    fail("EVENT_MISMATCH", "Expected one RewardsAssigned event for this bounty");
  }

  const matchedEvent = matchingEvents[0];
  const logIndex = Number(matchedEvent.logIndex);
  const winners = matchedEvent.args.winners;
  if (
    !isAddress(matchedEvent.address) ||
    matchedEvent.address.toLowerCase() !== contractAddress.toLowerCase() ||
    !Number.isSafeInteger(logIndex) ||
    logIndex < 0 ||
    !Array.isArray(winners) ||
    winners.length === 0 ||
    winners.some((winner) => !isAddress(winner)) ||
    (expectedLogIndex != null && logIndex !== expectedLogIndex) ||
    (expectedBlockHash &&
      matchedEvent.blockHash?.toLowerCase() !== expectedBlockHash.toLowerCase())
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
