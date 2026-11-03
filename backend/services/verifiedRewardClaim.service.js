const { BOUNTY_ABI } = require("../config/abi");
const {
  fail,
  parseContractEvents,
  verifyConfirmedTransaction,
} = require("./verifiedTransaction.service");

const verifyRewardClaimEvent = async ({
  publicClient,
  transactionHash,
  contractAddress,
  chainId,
  confirmationDepth,
  blockchainId,
  winnerAddress,
  amount,
}) => {
  const { receipt } = await verifyConfirmedTransaction({
    publicClient,
    transactionHash,
    contractAddress,
    expectedChainId: chainId,
    expectedFrom: winnerAddress,
    confirmationDepth,
  });
  const events = parseContractEvents({
    receipt,
    eventName: "RewardClaimed",
    contractAddress,
  });
  const bountyEvents = events.filter((event) => {
    try {
      return BigInt(event.args.bountyId) === BigInt(blockchainId);
    } catch {
      return false;
    }
  });
  if (!bountyEvents.length) {
    fail("EVENT_BOUNTY_MISMATCH", "RewardClaimed event belongs to another bounty");
  }
  const matchingEvents = bountyEvents.filter((event) =>
    event.args.winner?.toLowerCase() === winnerAddress.toLowerCase(),
  );
  if (!matchingEvents.length) {
    fail("EVENT_WALLET_MISMATCH", "RewardClaimed event belongs to another wallet");
  }
  if (matchingEvents.length !== 1) {
    fail("EVENT_MISMATCH", "Expected one RewardClaimed event for this reward");
  }

  const event = matchingEvents[0];
  if (BigInt(event.args.amount) !== BigInt(amount)) {
    fail("EVENT_AMOUNT_MISMATCH", "Claimed amount does not match the recorded reward");
  }
  const logIndex = Number(event.logIndex);
  if (!Number.isSafeInteger(logIndex) || logIndex < 0) {
    fail("EVENT_MISMATCH", "RewardClaimed event has an invalid log index");
  }

  let claimed;
  try {
    claimed = await publicClient.readContract({
      address: contractAddress,
      abi: BOUNTY_ABI,
      functionName: "claimed",
      args: [BigInt(blockchainId), winnerAddress],
    });
  } catch {
    fail("RPC_UNAVAILABLE", "Could not verify the on-chain claim state");
  }
  if (!claimed) {
    fail("EVENT_MISMATCH", "The contract does not report this reward as claimed");
  }

  return {
    receipt,
    event: {
      logIndex,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      bountyId: BigInt(event.args.bountyId).toString(),
      winnerAddress: event.args.winner.toLowerCase(),
      amount: BigInt(event.args.amount).toString(),
    },
  };
};

module.exports = { verifyRewardClaimEvent };
