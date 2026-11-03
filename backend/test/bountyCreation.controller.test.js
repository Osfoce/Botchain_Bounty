const test = require("node:test");
const assert = require("node:assert/strict");
const { encodeAbiParameters, encodeEventTopics, parseEther } = require("viem");
const Bounty = require("../modules/bounty.module");
const chainSettings = require("../config/chains");
const { BOUNTY_ABI } = require("../config/abi");
const { createBounty } = require("../controller/bounty.controller");

const chainId = 5042;
const chainConfig = chainSettings.CHAINS[chainId];
const creator = "0x1111111111111111111111111111111111111111";
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
    from: creator,
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
          eventName: "BountyCreated",
          args: { bountyId: 123n, creator },
        }),
        data: encodeAbiParameters(
          [{ type: "uint256" }, { type: "uint256" }, { type: "uint8" }],
          [parseEther("10"), parseEther("0.7"), 0],
        ),
        logIndex: 1,
        blockHash,
      },
    ],
  }),
  getBlockNumber: async () => 130n,
  getBlock: async () => ({ hash: blockHash }),
  readContract: async () => [
    creator,
    [],
    parseEther("10"),
    parseEther("0.7"),
    false,
    false,
    0,
  ],
});

const createRequest = (overrides = {}) => ({
  auth: { walletAddress: creator },
  body: {
    title: "Verified bounty",
    description: "Bounty details",
    category: "Engineering",
    tags: [],
    startDate: "2026-01-01",
    deadline: "2026-12-31",
    originLink: "https://example.test/work",
    network: chainId,
    reward: 10,
    token: "USDC",
    winnersAllowed: 1,
    payoutType: "SINGLE",
    percentages: [],
    blockchainId: "123",
    txHash: transactionHash,
    isOnChain: true,
    bountyContract: chainConfig.bountyContract,
    ...overrides,
  },
});

const mockCreationDependencies = (t, { existingBounty = null } = {}) => {
  const originals = {
    create: Bounty.create,
    findOne: Bounty.findOne,
    getPublicClient: chainSettings.getPublicClient,
  };
  let created;
  Bounty.create = async (data) => {
    created = { id: "mongo-id", ...data };
    return created;
  };
  Bounty.findOne = async () => existingBounty;
  chainSettings.getPublicClient = () => createPublicClient();
  t.after(() => {
    Bounty.create = originals.create;
    Bounty.findOne = originals.findOne;
    chainSettings.getPublicClient = originals.getPublicClient;
  });
  return {
    getCreated: () => created,
    setExisting: (value) => {
      Bounty.findOne = async () => value;
    },
  };
};

test("persists only a bounty link verified against trusted chain configuration", async (t) => {
  const dependencies = mockCreationDependencies(t);
  const res = response();

  await createBounty(createRequest(), res);

  assert.equal(res.statusCode, 201);
  assert.equal(dependencies.getCreated().creator, creator);
  assert.equal(dependencies.getCreated().isOnChain, true);
  assert.equal(dependencies.getCreated().blockchainId, 123);
  assert.equal(
    dependencies.getCreated().bountyContract,
    chainConfig.bountyContract,
  );
  assert.equal(dependencies.getCreated().txHash, transactionHash);
  assert.equal(
    dependencies.getCreated().rewardWei,
    parseEther("10").toString(),
  );
});

test("stores precise base units alongside the legacy bounty reward field", async (t) => {
  const dependencies = mockCreationDependencies(t);
  const res = response();

  await createBounty(
    createRequest({
      isOnChain: false,
      blockchainId: null,
      txHash: null,
      bountyContract: null,
      reward: "9007199254740993.000000000000000001",
    }),
    res,
  );

  assert.equal(res.statusCode, 201);
  assert.equal(
    dependencies.getCreated().rewardWei,
    "9007199254740993000000000000000001",
  );
});

test("rejects mismatched client bounty ID without writing a record", async (t) => {
  const dependencies = mockCreationDependencies(t);
  const res = response();

  await createBounty(createRequest({ blockchainId: "124" }), res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "EVENT_BOUNTY_MISMATCH");
  assert.equal(dependencies.getCreated(), undefined);
});

test("keeps a transaction unknown to the RPC retryable and does not persist it", async (t) => {
  const originals = {
    create: Bounty.create,
    findOne: Bounty.findOne,
    getPublicClient: chainSettings.getPublicClient,
  };
  Bounty.create = async () => {
    assert.fail("Unconfirmed transaction must not be persisted");
  };
  Bounty.findOne = async () => null;
  chainSettings.getPublicClient = () => ({
    ...createPublicClient(),
    getTransaction: async () => {
      const error = new Error("TransactionNotFoundError");
      error.name = "TransactionNotFoundError";
      throw error;
    },
  });
  t.after(() => {
    Bounty.create = originals.create;
    Bounty.findOne = originals.findOne;
    chainSettings.getPublicClient = originals.getPublicClient;
  });
  const res = response();

  await createBounty(createRequest(), res);

  assert.equal(res.statusCode, 202);
  assert.equal(res.body.code, "TRANSACTION_NOT_FOUND");
  assert.equal(res.body.retryable, true);
});

test("rejects a client-supplied contract that differs from trusted configuration", async (t) => {
  let rpcRequests = 0;
  const originals = {
    create: Bounty.create,
    getPublicClient: chainSettings.getPublicClient,
  };
  Bounty.create = async () => {
    assert.fail("Unverified bounty must not be persisted");
  };
  chainSettings.getPublicClient = () => {
    rpcRequests += 1;
    return createPublicClient();
  };
  t.after(() => {
    Bounty.create = originals.create;
    chainSettings.getPublicClient = originals.getPublicClient;
  });
  const res = response();

  await createBounty(
    createRequest({ bountyContract: "0x3333333333333333333333333333333333333333" }),
    res,
  );

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "CHAIN_CONFIGURATION_MISMATCH");
  assert.equal(rpcRequests, 0);
});

test("retries for an already-linked verified creation return the existing bounty", async (t) => {
  const existing = {
    id: "mongo-id",
    creator,
    network: String(chainId),
    blockchainId: 123,
    bountyContract: chainConfig.bountyContract,
    title: "Verified bounty",
  };
  const dependencies = mockCreationDependencies(t, { existingBounty: existing });
  const res = response();

  await createBounty(createRequest(), res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.bounty._id, existing.id);
  assert.equal(dependencies.getCreated(), undefined);
});
