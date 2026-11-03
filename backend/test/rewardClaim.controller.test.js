const test = require("node:test");
const assert = require("node:assert/strict");
const { encodeAbiParameters, encodeEventTopics, parseEther } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");
const chainSettings = require("../config/chains");
const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const { claimReward } = require("../controller/reward.controller");
const claimSyncService = require("../services/claimSync.service");

const chainId = 5042;
const chainConfig = chainSettings.CHAINS[chainId];
const winner = "0x2222222222222222222222222222222222222222";
const bountyId = "507f1f77bcf86cd799439011";
const transactionHash = `0x${"a".repeat(64)}`;
const blockHash = `0x${"b".repeat(64)}`;

const response = () => ({
  statusCode: 200,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const createPublicClient = () => ({
  getChainId: async () => chainId,
  getTransaction: async () => ({
    hash: transactionHash,
    to: chainConfig.bountyContract,
    from: winner,
    chainId,
  }),
  getTransactionReceipt: async () => ({
    status: "success",
    transactionHash,
    blockNumber: 100n,
    blockHash,
    logs: [
      {
        address: chainConfig.bountyContract,
        topics: encodeEventTopics({
          abi: BOUNTY_ABI,
          eventName: "RewardClaimed",
          args: { bountyId: 123n, winner },
        }),
        data: encodeAbiParameters([{ type: "uint256" }], [parseEther("10")]),
        logIndex: 2,
        blockHash,
      },
    ],
  }),
  getBlockNumber: async () => 130n,
  getBlock: async () => ({ hash: blockHash }),
  readContract: async () => true,
});

const createQuery = (result) => ({
  select() {
    return this;
  },
  lean: async () => result,
  then(resolve, reject) {
    return Promise.resolve(result).then(resolve, reject);
  },
});

const setup = (
  t,
  {
    syncError = null,
    bountyContract = chainConfig.bountyContract,
    rewardStatus = "assigned",
    claimTxHash = null,
  } = {},
) => {
  const originals = {
    bountyFindById: Bounty.findById,
    rewardFindOne: Reward.findOne,
    getPublicClient: chainSettings.getPublicClient,
    synchronizeClaim: claimSyncService.synchronizeClaim,
  };
  const reward = {
    _id: "reward-id",
    bountyId,
    bountyTitle: "Verified bounty",
    blockchainId: 123,
    chainId: String(chainId),
    bountyContract: chainConfig.bountyContract,
    winnerAddress: winner,
    amount: parseEther("10").toString(),
    amountFormatted: "10",
    status: rewardStatus,
    claimTxHash,
    claimLogIndex: rewardStatus === "claimed" ? 2 : null,
    claimBlockHash: rewardStatus === "claimed" ? blockHash : null,
  };
  Bounty.findById = () =>
    createQuery({
      rewardsAssignedOnChain: true,
      isOnChain: true,
      network: String(chainId),
      blockchainId: 123,
      bountyContract,
    });
  Reward.findOne = () => Promise.resolve(reward);
  chainSettings.getPublicClient = () => createPublicClient();
  let syncCalls = 0;
  let syncArgs;
  claimSyncService.synchronizeClaim = async (args) => {
    syncCalls += 1;
    syncArgs = args;
    if (syncError) throw syncError;
    return { status: "synced", alreadySynced: false };
  };
  t.after(() => {
    Bounty.findById = originals.bountyFindById;
    Reward.findOne = originals.rewardFindOne;
    chainSettings.getPublicClient = originals.getPublicClient;
    claimSyncService.synchronizeClaim = originals.synchronizeClaim;
  });
  return {
    syncCalls: () => syncCalls,
    syncArgs: () => syncArgs,
  };
};

const request = () => ({
  auth: { walletAddress: winner },
  params: { id: bountyId },
  body: { txHash: transactionHash },
});

test("claim endpoint stores canonical event identity only after verification", async (t) => {
  const state = setup(t);
  const res = response();

  await claimReward(request(), res);

  assert.equal(res.statusCode, 200);
  assert.equal(state.syncCalls(), 1);
  assert.equal(state.syncArgs().identity.transactionHash, transactionHash);
  assert.equal(state.syncArgs().event.logIndex, 2);
  assert.equal(state.syncArgs().event.blockNumber, 100n);
  assert.equal(state.syncArgs().event.blockHash, blockHash);
});

test("claim endpoint refuses to reuse an event already linked to another reward", async (t) => {
  const state = setup(t, {
    syncError: Object.assign(new Error("Claim event already applied"), {
      code: "EVENT_ALREADY_APPLIED",
    }),
  });
  const res = response();

  await claimReward(request(), res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "EVENT_ALREADY_APPLIED");
  assert.equal(state.syncCalls(), 1);
});

test("claim retry with the same verified event resumes synchronization", async (t) => {
  const state = setup(t, {
    rewardStatus: "claimed",
    claimTxHash: transactionHash,
  });
  const res = response();

  await claimReward(request(), res);

  assert.equal(res.statusCode, 200);
  assert.equal(state.syncCalls(), 1);
});

test("claim endpoint rejects a stored contract that differs from chain configuration", async (t) => {
  const state = setup(t, {
    bountyContract: "0x3333333333333333333333333333333333333333",
  });
  const res = response();

  await claimReward(request(), res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "CHAIN_CONFIGURATION_MISMATCH");
  assert.equal(state.syncCalls(), 0);
});
