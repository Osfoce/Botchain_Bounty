const test = require("node:test");
const assert = require("node:assert/strict");
const { encodeAbiParameters, encodeEventTopics } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");
const chainSettings = require("../config/chains");
const Bounty = require("../modules/bounty.module");
const distributionSyncService = require("../services/distributionSync.service");
const { distributeRewards } = require("../controller/reward.controller");

const chainId = 5042;
const chainConfig = chainSettings.CHAINS[chainId];
const contractAddress = chainConfig.bountyContract;
const bountyId = "507f1f77bcf86cd799439011";
const creator = "0x1111111111111111111111111111111111111111";
const winner = "0x2222222222222222222222222222222222222222";
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

const createLog = (address = contractAddress) => ({
  address,
  topics: encodeEventTopics({
    abi: BOUNTY_ABI,
    eventName: "RewardsAssigned",
    args: { bountyId: 123n },
  }),
  data: encodeAbiParameters([{ type: "address[]" }], [[winner]]),
  blockHash,
  logIndex: 2,
});

const createClient = ({ address = contractAddress } = {}) => ({
  getChainId: async () => chainId,
  getTransaction: async () => ({
    hash: transactionHash,
    to: contractAddress,
    from: creator,
    chainId,
  }),
  getTransactionReceipt: async () => ({
    status: "success",
    transactionHash,
    blockNumber: 100n,
    blockHash,
    logs: [createLog(address)],
  }),
  getBlockNumber: async () => 130n,
  getBlock: async () => ({ hash: blockHash }),
});

const setup = (t, { eventAddress = contractAddress } = {}) => {
  const originals = {
    bountyFindById: Bounty.findById,
    getPublicClient: chainSettings.getPublicClient,
    synchronizeDistribution: distributionSyncService.synchronizeDistribution,
  };
  let syncCalls = 0;
  Bounty.findById = async () => ({
    _id: bountyId,
    network: String(chainId),
    blockchainId: 123,
    isOnChain: true,
    bountyContract: contractAddress,
    rewardsAssignedOnChain: false,
    distributionTxHash: null,
  });
  chainSettings.getPublicClient = () => createClient({ address: eventAddress });
  distributionSyncService.synchronizeDistribution = async () => {
    syncCalls += 1;
    return {
      status: "synced",
      alreadySynced: false,
      winners: [{ winnerAddress: winner, amountWei: "100", amountFormatted: "0.0000000000000001" }],
    };
  };
  t.after(() => {
    Bounty.findById = originals.bountyFindById;
    chainSettings.getPublicClient = originals.getPublicClient;
    distributionSyncService.synchronizeDistribution = originals.synchronizeDistribution;
  });
  return { syncCalls: () => syncCalls };
};

const request = (overrides = {}) => ({
  params: { id: bountyId },
  body: {
    txHash: transactionHash,
    blockchainId: "123",
    chainId,
    ...overrides,
  },
});

test("distribution sync is called only after verified RewardsAssigned event", async (t) => {
  const state = setup(t);
  const res = response();

  await distributeRewards(request(), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "synced");
  assert.equal(state.syncCalls(), 1);
});

test("a RewardsAssigned event from another contract cannot synchronize rewards", async (t) => {
  const state = setup(t, {
    eventAddress: "0x3333333333333333333333333333333333333333",
  });
  const res = response();

  await distributeRewards(request(), res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "EVENT_EMITTER_MISMATCH");
  assert.equal(state.syncCalls(), 0);
});

test("a client-supplied chain cannot override the stored bounty network", async (t) => {
  const state = setup(t);
  const res = response();

  await distributeRewards(request({ chainId: 677 }), res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "CHAIN_CONFIGURATION_MISMATCH");
  assert.equal(state.syncCalls(), 0);
});
