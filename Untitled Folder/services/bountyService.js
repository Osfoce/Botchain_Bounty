import { parseEther, formatEther } from "viem";
import { BOUNTY_ABI } from "../utils/abi";
import { getBountyContract as resolveBountyContract } from "../utils/chains.address";
import { getPayoutType } from "../utils/enums";

/**
 * Get contract address dynamically
 */
export const getBountyContract = (chainId) => {
  return resolveBountyContract(chainId);
};

/* -------------------------------------------------------------------------- */
/*                              CREATE BOUNTY                                 */
/* -------------------------------------------------------------------------- */

/**
 * Prepare `createBounty` transaction config for wagmi.
 *
 * The contract accepts the selected network's native token (18 decimals).
 * msg.value must equal `reward + fee`, where fee = reward * 700 / 10000.
 *
 * @param {Object} params
 * @param {Object} params.bountyData  - { reward, winnersAllowed, payoutType }
 * @param {string} params.account     - caller address
 * @param {number} params.chainId
 * @returns wagmi `useWriteContract` config
 */
export const prepareCreateBountyTx = ({ bountyData, account, chainId }) => {
  const address = getBountyContract(chainId);

  // const tokenType = resolveTokenType(bountyData.token, chainId);
  const payoutType = getPayoutType({
    winnersAllowed: bountyData.winnersAllowed,
    payoutType: bountyData.payoutType,
  });
  // console.log(`Payout type: ${payoutType} (0 for single, 1 for multiple)`);
  // Contract fee is 7% (700 basis points). Keep in sync with FEE_PERCENT().
  const rewardWei = parseEther(bountyData.reward.toString());
  const feeWei = (rewardWei * 700n) / 10000n;
  const totalWei = rewardWei + feeWei;
  return {
    address,
    abi: BOUNTY_ABI,
    functionName: "createBounty",
    args: [rewardWei, payoutType],
    account,
    value: totalWei,
  };
};

/* -------------------------------------------------------------------------- */
/*                              CLAIM REWARD                                  */
/* -------------------------------------------------------------------------- */

export const prepareClaimTx = ({ bountyId, account, chainId }) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "claimReward",
    args: [BigInt(bountyId)],
    account,
  };
};

/**
 * Read claimable reward (for viem OR wagmi)
 */
export const getClaimableConfig = ({ bountyId, user, chainId }) => {
  // console.log(
  //   `Getting claimable rewards for bountyId: ${bountyId}, user: ${user}, chainId: ${chainId}`,
  // );
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "claimableRewards",
    args: [BigInt(bountyId), user],
  };
};

// claimed ststus onchain
export const getClaimedConfig = ({ bountyId, user, chainId }) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "claimed",
    args: [BigInt(bountyId), user],
  };
};

/* -------------------------------------------------------------------------- */
/*                            ASSIGN WINNERS                                  */
/* -------------------------------------------------------------------------- */
export const prepareAssignSingleWinnerTx = ({
  bountyId,
  winner,
  account,
  chainId,
}) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "assignSingleWinner",
    args: [BigInt(bountyId), winner],
    account,
  };
};

// Assign multiple winner
export const prepareAssignMultipleWinnersTx = ({
  bountyId,
  winners,
  percentages,
  account,
  chainId,
}) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "assignMultipleWinners",
    args: [BigInt(bountyId), winners, percentages.map((p) => BigInt(p))],
    account,
  };
};

/* -------------------------------------------------------------------------- */
/*                              SUBMISSIONS                                   */
/* -------------------------------------------------------------------------- */
export const prepareSubmitTx = ({ bountyId, link, account, chainId }) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "submit",
    args: [BigInt(bountyId), link],
    account,
  };
};

/* -------------------------------------------------------------------------- */
/*                              READS                                         */
/* -------------------------------------------------------------------------- */
export const getBountyCounterConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "bountyCounter",
  args: [],
});

// Get full bounty info (read)
export const getBountyInfoConfig = ({ bountyId, chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "getBountyInfo",
  args: [BigInt(bountyId)],
});

// Get all available bounty IDs
export const getAvailableBountiesConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "availableBounties",
  args: [],
});

// Get bounties by creator
export const getBountiesByCreatorConfig = ({ creator, chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "bountiesByCreator",
  args: [creator],
});

// Get user submissions
export const getUserSubmissionsConfig = ({ user, chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "userSubmissions",
  args: [user],
});

// Get all bounty IDs (historical)
// change name to "getAllBountyIdAtIndexConfig"
export const getAllBountyIdsConfig = ({ index, chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "allBountyIds",
  args: [BigInt(index)],
});

// Get total fees
export const getTotalFeesConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "totalFees",
  args: [],
});

/* -------------------------------------------------------------------------- */
/*                              CONSTANTS                                     */
/* -------------------------------------------------------------------------- */

export const getFeePercentConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "FEE_PERCENT",
  args: [],
});

export const getBasisPointsConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "BASIS_POINTS",
  args: [],
});

export const getMaxWinnersConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "MAX_WINNERS",
  args: [],
});

export const getOwnerConfig = ({ chainId }) => ({
  address: getBountyContract(chainId),
  abi: BOUNTY_ABI,
  functionName: "owner",
  args: [],
});

/* -------------------------------------------------------------------------- */
/*                              OWNERSHIP                                     */
/* -------------------------------------------------------------------------- */
export const prepareTransferOwnershipTx = ({ newOwner, account, chainId }) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "transferOwnership",
    args: [newOwner],
    account,
  };
};

/* -------------------------------------------------------------------------- */
/*                              FEE WITHDRAWAL                                */
/* -------------------------------------------------------------------------- */

// fees withdrawal
export const prepareWithdrawTx = ({ recipient, account, chainId }) => {
  return {
    address: getBountyContract(chainId),
    abi: BOUNTY_ABI,
    functionName: "withdraw",
    args: [recipient],
    account,
  };
};

/* -------------------------------------------------------------------------- */
/*                              FORMATTING                                    */
/* -------------------------------------------------------------------------- */

/**
 * Format an 18-decimal native token value into a human-readable string.
 */
export const formatReward = (value) => {
  if (value === undefined || value === null) return "0";
  return formatEther(value);
};
