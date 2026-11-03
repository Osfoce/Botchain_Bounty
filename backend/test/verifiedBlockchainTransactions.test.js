const test = require("node:test");
const assert = require("node:assert/strict");
const { encodeAbiParameters, encodeEventTopics, parseEther } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");
const { CHAINS } = require("../config/chains");
const { verifyBountyCreation } = require("../services/verifiedBountyCreation.service");
const { verifyRewardClaimEvent } = require("../services/verifiedRewardClaim.service");

const chainId = 5042;
const chainConfig = CHAINS[chainId];
const contractAddress = chainConfig.bountyContract;
const creator = "0x1111111111111111111111111111111111111111";
const winner = "0x2222222222222222222222222222222222222222";
const transactionHash = `0x${"a".repeat(64)}`;
const blockHash = `0x${"b".repeat(64)}`;

const creationLog = ({
  address = contractAddress,
  bountyId = 123n,
  eventCreator = creator,
  reward = parseEther("10"),
  fee = parseEther("0.7"),
  payoutType = 0,
} = {}) => ({
  address,
  topics: encodeEventTopics({
    abi: BOUNTY_ABI,
    eventName: "BountyCreated",
    args: { bountyId, creator: eventCreator },
  }),
  data: encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }, { type: "uint8" }],
    [reward, fee, payoutType],
  ),
  logIndex: 1,
  blockHash,
});

const claimLog = ({
  address = contractAddress,
  bountyId = 123n,
  eventWinner = winner,
  amount = parseEther("10"),
} = {}) => ({
  address,
  topics: encodeEventTopics({
    abi: BOUNTY_ABI,
    eventName: "RewardClaimed",
    args: { bountyId, winner: eventWinner },
  }),
  data: encodeAbiParameters([{ type: "uint256" }], [amount]),
  logIndex: 2,
  blockHash,
});

const createClient = ({
  logs = [creationLog()],
  status = "success",
  actualChainId = chainId,
  transactionTo = contractAddress,
  transactionFrom = creator,
  head = 130n,
  readContract,
} = {}) => {
  const receipt = {
    status,
    transactionHash,
    blockNumber: 100n,
    blockHash,
    logs,
  };
  return {
    getChainId: async () => actualChainId,
    getTransaction: async () => ({
      hash: transactionHash,
      to: transactionTo,
      from: transactionFrom,
      chainId: actualChainId,
    }),
    getTransactionReceipt: async () => receipt,
    getBlockNumber: async () => head,
    getBlock: async () => ({ hash: blockHash }),
    readContract:
      readContract ||
      (async ({ functionName }) => {
        if (functionName === "getBountyInfo") {
          return [creator, [], parseEther("10"), parseEther("0.7"), false, false, 0];
        }
        return true;
      }),
  };
};

const verifyCreation = (publicClient, options = {}) =>
  verifyBountyCreation({
    publicClient,
    transactionHash,
    chainId,
    chainConfig,
    creator,
    reward: "10",
    token: "USDC",
    payoutType: "SINGLE",
    ...options,
  });

const verifyClaim = (publicClient, options = {}) =>
  verifyRewardClaimEvent({
    publicClient,
    transactionHash,
    contractAddress,
    chainId,
    confirmationDepth: chainConfig.confirmationDepth,
    blockchainId: "123",
    winnerAddress: winner,
    amount: parseEther("10").toString(),
    ...options,
  });

test("accepts a confirmed bounty creation matching trusted contract state", async () => {
  const verified = await verifyCreation(createClient());
  assert.deepEqual(verified, {
    blockchainId: 123,
    bountyContract: contractAddress,
    txHash: transactionHash,
    rewardWei: parseEther("10").toString(),
  });
});

test("rejects unverified or mismatched bounty creation transactions", async (t) => {
  const cases = [
    ["wrong chain", createClient({ actualChainId: 677 }), {}, "CHAIN_CONFIGURATION_MISMATCH"],
    ["wrong destination", createClient({ transactionTo: winner }), {}, "WRONG_TRANSACTION_DESTINATION"],
    ["reverted receipt", createClient({ status: "reverted" }), {}, "TRANSACTION_REVERTED"],
    ["missing event", createClient({ logs: [] }), {}, "EXPECTED_EVENT_NOT_FOUND"],
    [
      "wrong event emitter",
      createClient({ logs: [creationLog({ address: winner })] }),
      {},
      "EVENT_EMITTER_MISMATCH",
    ],
    [
      "creator mismatch",
      createClient({ logs: [creationLog({ eventCreator: winner })] }),
      {},
      "EVENT_WALLET_MISMATCH",
    ],
    ["bounty ID mismatch", createClient(), { expectedBlockchainId: 124 }, "EVENT_BOUNTY_MISMATCH"],
    [
      "reward mismatch",
      createClient({ logs: [creationLog({ reward: parseEther("9") })] }),
      {},
      "EVENT_AMOUNT_MISMATCH",
    ],
    [
      "state mismatch",
      createClient({
        readContract: async () => [
          winner,
          [],
          parseEther("10"),
          parseEther("0.7"),
          false,
          false,
          0,
        ],
      }),
      {},
      "EVENT_MISMATCH",
    ],
    [
      "insufficient confirmations",
      createClient({ head: 105n }),
      {},
      "TRANSACTION_NOT_CONFIRMED",
    ],
  ];

  for (const [name, publicClient, options, code] of cases) {
    await t.test(name, async () => {
      await assert.rejects(verifyCreation(publicClient, options), { code });
    });
  }
});

test("accepts a confirmed claim event matching the authenticated reward", async () => {
  const publicClient = createClient({
    logs: [claimLog()],
    transactionFrom: winner,
    readContract: async () => true,
  });
  const verified = await verifyClaim(publicClient);

  assert.equal(verified.event.bountyId, "123");
  assert.equal(verified.event.winnerAddress, winner);
  assert.equal(verified.event.amount, parseEther("10").toString());
  assert.equal(verified.event.logIndex, 2);
});

test("rejects unrelated or mismatched claim transactions", async (t) => {
  const cases = [
    ["wrong destination", createClient({ logs: [claimLog()], transactionFrom: winner, transactionTo: creator }), {}, "WRONG_TRANSACTION_DESTINATION"],
    ["wrong sender", createClient({ logs: [claimLog()], transactionFrom: creator }), {}, "EVENT_WALLET_MISMATCH"],
    ["missing event", createClient({ logs: [], transactionFrom: winner }), {}, "EXPECTED_EVENT_NOT_FOUND"],
    [
      "wrong event emitter",
      createClient({ logs: [claimLog({ address: creator })], transactionFrom: winner }),
      {},
      "EVENT_EMITTER_MISMATCH",
    ],
    [
      "wrong bounty",
      createClient({ logs: [claimLog({ bountyId: 124n })], transactionFrom: winner }),
      {},
      "EVENT_BOUNTY_MISMATCH",
    ],
    [
      "wrong claimant",
      createClient({ logs: [claimLog({ eventWinner: creator })], transactionFrom: winner }),
      {},
      "EVENT_WALLET_MISMATCH",
    ],
    [
      "wrong amount",
      createClient({ logs: [claimLog({ amount: parseEther("9") })], transactionFrom: winner }),
      {},
      "EVENT_AMOUNT_MISMATCH",
    ],
    [
      "contract has not recorded claim",
      createClient({
        logs: [claimLog()],
        transactionFrom: winner,
        readContract: async () => false,
      }),
      {},
      "EVENT_MISMATCH",
    ],
  ];

  for (const [name, publicClient, options, code] of cases) {
    await t.test(name, async () => {
      await assert.rejects(verifyClaim(publicClient, options), { code });
    });
  }
});
