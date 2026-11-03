const test = require("node:test");
const assert = require("node:assert/strict");
const { encodeAbiParameters, encodeEventTopics } = require("viem");
const { BOUNTY_ABI } = require("../config/abi");
const {
  verifyRewardsAssignedEvent,
} = require("../services/verifiedDistributionEvent.service");

const contractAddress = "0x498482e334269a10d0621D3AC5e726734B01DDCe";
const transactionHash = `0x${"a".repeat(64)}`;
const blockHash = `0x${"b".repeat(64)}`;
const winners = ["0x0000000000000000000000000000000000000001"];
const chainId = 5042;

const createReceipt = () => ({
  status: "success",
  transactionHash,
  blockNumber: 100n,
  blockHash,
  logs: [
    {
      address: contractAddress,
      topics: encodeEventTopics({
        abi: BOUNTY_ABI,
        eventName: "RewardsAssigned",
        args: { bountyId: 123n },
      }),
      data: encodeAbiParameters([{ type: "address[]" }], [winners]),
      blockNumber: 100n,
      blockHash,
      transactionHash,
      logIndex: 2,
    },
  ],
});

const createPublicClient = (receipt = createReceipt()) => ({
  getChainId: async () => chainId,
  getTransaction: async () => ({
    hash: transactionHash,
    to: contractAddress,
    from: "0x0000000000000000000000000000000000000002",
    chainId,
  }),
  getTransactionReceipt: async () => receipt,
  getBlockNumber: async () => 120n,
  getBlock: async () => ({ hash: blockHash }),
});

test("verifies and normalizes a confirmed RewardsAssigned event", async () => {
  const result = await verifyRewardsAssignedEvent({
    publicClient: createPublicClient(),
    transactionHash,
    contractAddress,
    chainId,
    confirmationDepth: 2,
    blockchainId: "123",
    expectedLogIndex: 2,
    expectedBlockHash: blockHash,
  });

  assert.deepEqual(result.event, {
    logIndex: 2,
    blockNumber: 100n,
    blockHash,
    winners,
  });
});

test("rejects an event whose log index or canonical block hash differs", async (t) => {
  const receipt = createReceipt();
  const publicClient = createPublicClient(receipt);

  await t.test("log index mismatch", async () => {
    await assert.rejects(
      verifyRewardsAssignedEvent({
        publicClient,
        transactionHash,
        contractAddress,
        chainId,
        confirmationDepth: 2,
        blockchainId: "123",
        expectedLogIndex: 3,
      }),
      { code: "EVENT_MISMATCH" },
    );
  });

  await t.test("block hash mismatch", async () => {
    await assert.rejects(
      verifyRewardsAssignedEvent({
        publicClient,
        transactionHash,
        contractAddress,
        chainId,
        confirmationDepth: 2,
        blockchainId: "123",
        expectedBlockHash: `0x${"c".repeat(64)}`,
      }),
      { code: "EVENT_MISMATCH" },
    );
  });
});
