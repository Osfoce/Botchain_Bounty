const { parseUnits } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");
const { fail, parseContractEvents, verifyConfirmedTransaction } = require("./verifiedTransaction.service");

const PAYOUT_TYPES = {
  SINGLE: 0n,
  MULTI_EQUAL: 1n,
  MULTI_PERCENTAGE: 2n,
};

const verifyBountyCreation = async ({
  publicClient,
  transactionHash,
  chainId,
  chainConfig,
  creator,
  reward,
  token,
  payoutType,
  expectedBlockchainId,
}) => {
  const contractAddress = chainConfig?.bountyContract;
  if (
    !contractAddress ||
    typeof chainConfig.chain?.nativeCurrency?.symbol !== "string"
  ) {
    fail("UNSUPPORTED_CHAIN", "Bounty contract is not configured for this chain");
  }
  if (
    typeof token !== "string" ||
    token.toUpperCase() !== chainConfig.chain.nativeCurrency.symbol.toUpperCase()
  ) {
    fail("CHAIN_CONFIGURATION_MISMATCH", "Token does not match the configured chain native currency");
  }
  if (!Object.hasOwn(PAYOUT_TYPES, payoutType)) {
    fail("EVENT_MISMATCH", "Unsupported payout type");
  }

  let expectedReward;
  try {
    expectedReward = parseUnits(
      String(reward),
      chainConfig.chain.nativeCurrency.decimals,
    );
  } catch {
    fail("EVENT_AMOUNT_MISMATCH", "Reward cannot be represented in native-token base units");
  }
  if (expectedReward <= 0n) {
    fail("EVENT_AMOUNT_MISMATCH", "Reward must be greater than zero");
  }

  const { receipt } = await verifyConfirmedTransaction({
    publicClient,
    transactionHash,
    contractAddress,
    expectedChainId: chainId,
    expectedFrom: creator,
    confirmationDepth: chainConfig.confirmationDepth,
  });
  const events = parseContractEvents({
    receipt,
    eventName: "BountyCreated",
    contractAddress,
  });
  const bountyEvents = events.filter((event) => {
    try {
      return BigInt(event.args.bountyId) > 0n;
    } catch {
      return false;
    }
  });
  if (bountyEvents.length !== 1) {
    fail("EVENT_BOUNTY_MISMATCH", "Expected one BountyCreated event");
  }

  const event = bountyEvents[0];
  const blockchainId = BigInt(event.args.bountyId);
  if (blockchainId > BigInt(Number.MAX_SAFE_INTEGER)) {
    fail("EVENT_BOUNTY_MISMATCH", "On-chain bounty ID exceeds the supported range");
  }
  if (
    expectedBlockchainId != null &&
    blockchainId !== BigInt(expectedBlockchainId)
  ) {
    fail("EVENT_BOUNTY_MISMATCH", "On-chain bounty ID does not match submitted metadata");
  }
  if (!event.args.creator || event.args.creator.toLowerCase() !== creator.toLowerCase()) {
    fail("EVENT_WALLET_MISMATCH", "Bounty creator does not match the authenticated wallet");
  }
  if (
    BigInt(event.args.reward) !== expectedReward ||
    BigInt(event.args.payoutType) !== PAYOUT_TYPES[payoutType]
  ) {
    fail("EVENT_AMOUNT_MISMATCH", "Bounty event does not match the submitted reward or payout type");
  }

  let state;
  try {
    state = await publicClient.readContract({
      address: contractAddress,
      abi: BOUNTY_ABI,
      functionName: "getBountyInfo",
      args: [blockchainId],
      blockNumber: receipt.blockNumber,
    });
  } catch {
    fail("RPC_UNAVAILABLE", "Could not verify the created bounty state");
  }
  const [stateCreator, winners, stateReward, stateFee, rewardsAssigned, isClaimed, statePayoutType] =
    state;
  if (
    !stateCreator ||
    stateCreator.toLowerCase() !== creator.toLowerCase() ||
    BigInt(stateReward) !== expectedReward ||
    BigInt(stateFee) !== BigInt(event.args.fee) ||
    BigInt(statePayoutType) !== PAYOUT_TYPES[payoutType] ||
    !Array.isArray(winners) ||
    winners.length !== 0 ||
    rewardsAssigned ||
    isClaimed
  ) {
    fail("EVENT_MISMATCH", "Created bounty state does not match the verified event");
  }

  return {
    blockchainId: Number(blockchainId),
    bountyContract: contractAddress,
    txHash: transactionHash.toLowerCase(),
    rewardWei: expectedReward.toString(),
  };
};

module.exports = { verifyBountyCreation };
