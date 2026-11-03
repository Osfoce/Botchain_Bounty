const mongoose = require("mongoose");
const { formatEther } = require("viem");

const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const User = require("../modules/user.module");
const { CHAINS, getPublicClient } = require("../config/chains");
const DistributionSync = require("../modules/distributionSync.module");
const { synchronizeDistribution } = require("../services/distributionSync.service");
const {
  verifyRewardsAssignedEvent,
} = require("../services/verifiedDistributionEvent.service");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isAddress = (a) => typeof a === "string" && /^0x[a-fA-F0-9]{40}$/.test(a);

// ─────────────────────────────────────────────────────────────
// POST /task/:id/distribute
// Sync winners + amounts from the on-chain RewardsAssigned event
// ─────────────────────────────────────────────────────────────
const distributeRewards = async (req, res) => {
  const { id } = req.params;
  const { txHash, blockchainId, chainId } = req.body;

  if (!isValidId(id)) {
    return res
      .status(400)
      .json({ code: "INVALID_BOUNTY_ID", error: "Invalid bounty ID" });
  }

  const chainIdNum = Number(chainId);
  if (!Number.isSafeInteger(chainIdNum) || chainIdNum <= 0) {
    return res.status(400).json({ code: "INVALID_CHAIN_ID", error: "Invalid chainId" });
  }
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash || "")) {
    return res.status(400).json({ code: "INVALID_TX_HASH", error: "Invalid transaction hash" });
  }
  if (
    blockchainId == null ||
    !/^[0-9]+$/.test(String(blockchainId)) ||
    BigInt(blockchainId) <= 0n
  ) {
    return res.status(400).json({
      code: "INVALID_BLOCKCHAIN_ID",
      error: "Invalid on-chain bounty ID",
    });
  }

  try {
    const bounty = await Bounty.findById(id);
    if (!bounty) {
      return res.status(404).json({ code: "BOUNTY_NOT_FOUND", error: "Bounty not found" });
    }

    if (Number(bounty.network) !== chainIdNum) {
      return res.status(409).json({
        code: "EVENT_MISMATCH",
        error: "The requested chain does not match the bounty network",
      });
    }

    if (String(bounty.blockchainId) !== String(blockchainId)) {
      return res.status(409).json({
        code: "EVENT_MISMATCH",
        error: "The on-chain bounty ID does not match the stored bounty",
      });
    }

    const chainConfig = CHAINS[chainIdNum];
    const expectedContract = chainConfig?.bountyContract;
    if (!expectedContract || !isAddress(expectedContract)) {
      return res.status(400).json({
        code: "UNSUPPORTED_CHAIN",
        error: `No bounty contract is configured for chain ${chainIdNum}`,
      });
    }

    const contractAddress = expectedContract.toLowerCase();
    if (
      bounty.bountyContract &&
      !isAddress(bounty.bountyContract)
    ) {
      return res.status(409).json({
        code: "EVENT_MISMATCH",
        error: "The bounty has an invalid configured contract address",
      });
    }
    if (
      bounty.bountyContract &&
      bounty.bountyContract.toLowerCase() !== contractAddress
    ) {
      return res.status(409).json({
        code: "EVENT_MISMATCH",
        error: "The bounty contract does not match the trusted chain configuration",
      });
    }

    const normalizedTxHash = txHash.toLowerCase();
    if (
      bounty.rewardsAssignedOnChain &&
      !bounty.distributionTxHash
    ) {
      return res.status(409).json({
        code: "CONFLICTING_DISTRIBUTION",
        error: "A distribution is already recorded without a transaction identity",
      });
    }
    if (
      bounty.distributionTxHash &&
      bounty.distributionTxHash.toLowerCase() !== normalizedTxHash
    ) {
      return res.status(409).json({
        code: "CONFLICTING_DISTRIBUTION",
        error: "A different transaction is already recorded for this bounty",
      });
    }

    if (bounty.rewardsAssignedOnChain) {
      const completedSync = await DistributionSync.findOne({
        bountyId: bounty._id,
        blockchainId: String(blockchainId),
        chainId: chainIdNum,
        bountyContract: contractAddress,
        transactionHash: normalizedTxHash,
        status: "synced",
      }).lean();
      if (completedSync) {
        const rewards = await Reward.find({ bountyId: bounty._id }).lean();
        return res.status(200).json({
          status: "synced",
          alreadySynced: true,
          txHash: normalizedTxHash,
          chainId: chainIdNum,
          winners: rewards.map((reward) => ({
            winnerAddress: reward.winnerAddress,
            amountWei: reward.amount,
            amountFormatted: reward.amountFormatted,
          })),
        });
      }
    }

    const publicClient = getPublicClient(chainIdNum);
    let rpcChainId;
    try {
      rpcChainId = await publicClient.getChainId();
    } catch (error) {
      console.warn("Could not verify configured RPC chain:", error.message);
      return res.status(503).json({
        code: "RPC_UNAVAILABLE",
        error: "Could not verify the configured blockchain RPC",
        retryable: true,
        txHash: normalizedTxHash,
        chainId: chainIdNum,
      });
    }
    if (rpcChainId !== chainIdNum) {
      console.error(
        `RPC chain mismatch: configured ${chainIdNum}, endpoint reports ${rpcChainId}`,
      );
      return res.status(503).json({
        code: "RPC_CHAIN_MISMATCH",
        error: "The configured RPC endpoint reports a different chain",
        retryable: false,
        txHash: normalizedTxHash,
        chainId: chainIdNum,
      });
    }

    let verified;
    try {
      verified = await verifyRewardsAssignedEvent({
        publicClient,
        transactionHash: normalizedTxHash,
        contractAddress,
        blockchainId,
      });
    } catch (error) {
      if (error.code === "TRANSACTION_NOT_CONFIRMED") {
        return res.status(503).json({
          status: "pending_confirmation",
          code: error.code,
          error: error.message,
          retryable: true,
          txHash: normalizedTxHash,
          chainId: chainIdNum,
        });
      }
      if (
        error.code === "TRANSACTION_REVERTED" ||
        error.code === "EVENT_NOT_FOUND"
      ) {
        return res.status(400).json({
          code: error.code,
          error: error.message,
          txHash: normalizedTxHash,
          chainId: chainIdNum,
        });
      }
      if (error.code === "EVENT_MISMATCH") {
        return res.status(409).json({
          code: error.code,
          error: error.message,
          txHash: normalizedTxHash,
          chainId: chainIdNum,
        });
      }
      throw error;
    }

    const result = await synchronizeDistribution({
      bounty,
      publicClient,
      identity: {
        bountyId: bounty._id,
        blockchainId: String(blockchainId),
        chainId: chainIdNum,
        bountyContract: contractAddress,
        transactionHash: normalizedTxHash,
      },
      event: verified.event,
    });

    if (result.status === "pending") {
      return res.status(202).json({
        status: "pending",
        code: "SYNC_PENDING",
        retryable: true,
        txHash: normalizedTxHash,
        chainId: chainIdNum,
      });
    }

    const winnerDetails = result.winners || (await Promise.all(
      verified.event.winners.map(async (winner) => {
        const reward = await Reward.findOne({
          bountyId: bounty._id,
          winnerAddress: winner,
        }).lean();
        return {
          winnerAddress: winner,
          amountWei: reward?.amount,
          amountFormatted: reward?.amountFormatted,
        };
      }),
    ));

    return res.status(200).json({
      status: "synced",
      alreadySynced: result.alreadySynced,
      txHash: normalizedTxHash,
      chainId: chainIdNum,
      winners: winnerDetails,
    });
  } catch (err) {
    if (err.code === "CONFLICTING_DISTRIBUTION") {
      return res.status(409).json({
        code: err.code,
        error: err.message,
      });
    }
    console.error("Distribution synchronization failed:", err);
    return res.status(503).json({
      status: "failed",
      code: "SYNC_FAILED",
      error: "Distribution was confirmed on-chain but application synchronization failed",
      retryable: true,
      txHash: typeof txHash === "string" ? txHash.toLowerCase() : undefined,
      chainId: Number.isSafeInteger(Number(chainId)) ? Number(chainId) : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /task/:id/winners
// ─────────────────────────────────────────────────────────────
const getWinners = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }

  try {
    const bounty = await Bounty.findById(id).lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const rewards = bounty.rewardsAssignedOnChain
      ? await Reward.find({ bountyId: id }).lean()
      : [];

    const assigned = rewards
      .filter((r) => r.status === "assigned")
      .map((r) => ({ address: r.winnerAddress, amount: r.amountFormatted }));

    const claimed = rewards
      .filter((r) => r.status === "claimed")
      .map((r) => ({
        address: r.winnerAddress,
        amount: r.amountFormatted,
        claimedAt: r.claimedAt,
        txHash: r.claimTxHash,
      }));

    return res.status(200).json({
      winners: assigned,
      claimed,
      distributedAt: bounty.winners?.assignedAt || null,
      isDistributed: Boolean(bounty.rewardsAssignedOnChain),
      payoutType: bounty.payoutType || null,
    });
  } catch (err) {
    console.error("Failed to fetch winners:", err);
    return res.status(500).json({ error: "Failed to fetch winners" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /task/:id/claimable/:userAddress
// Live read from the contract (source of truth)
// ─────────────────────────────────────────────────────────────
const getClaimable = async (req, res) => {
  const { id, userAddress } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }
  if (!isAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid user address" });
  }

  try {
    const bounty = await Bounty.findById(id).lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    if (!bounty.rewardsAssignedOnChain) {
      return res.status(200).json({
        claimable: 0,
        message: "Reward distribution synchronization is pending",
      });
    }

    const reward = await Reward.findOne({
      bountyId: id,
      winnerAddress: userAddress.toLowerCase(),
    }).lean();

    if (!reward) {
      return res.status(200).json({ claimable: 0, message: "Not a winner" });
    }
    if (reward.status === "claimed") {
      return res.status(200).json({ claimable: 0, message: "Already claimed" });
    }

    // 🔥 Live contract read = authoritative claimable amount
    const publicClient = getPublicClient(Number(reward.chainId));
    const onChainAmount = await publicClient.readContract({
      address: reward.bountyContract,
      abi: BOUNTY_ABI,
      functionName: "claimableRewards",
      args: [BigInt(reward.blockchainId), userAddress],
    });

    return res.status(200).json({
      claimable: onChainAmount.toString(),
      claimableFormatted: formatEther(onChainAmount),
      message: "Reward available to claim",
    });
  } catch (err) {
    console.error("Failed to get claimable amount:", err);
    return res.status(500).json({ error: "Failed to get claimable amount" });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /task/:id/claim
// Verify claim tx on-chain, then flip reward status
// ─────────────────────────────────────────────────────────────
const claimReward = async (req, res) => {
  const { id } = req.params;
  const { winnerAddress, txHash } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }
  if (!isAddress(winnerAddress)) {
    return res.status(400).json({ error: "Invalid winner address" });
  }
  if (!txHash) {
    return res.status(400).json({ error: "txHash is required" });
  }

  try {
    const bounty = await Bounty.findById(id).select("rewardsAssignedOnChain");
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    if (!bounty.rewardsAssignedOnChain) {
      return res.status(409).json({
        code: "SYNC_PENDING",
        error: "Reward distribution synchronization is pending",
      });
    }

    const reward = await Reward.findOne({
      bountyId: id,
      winnerAddress: winnerAddress.toLowerCase(),
    });

    if (!reward) {
      return res.status(404).json({ error: "You are not a winner" });
    }
    if (reward.status === "claimed") {
      return res.status(400).json({ error: "Reward already claimed" });
    }

    // 🔥 Verify the claim tx on-chain before mutating state
    const publicClient = getPublicClient(Number(reward.chainId));
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    if (receipt.status !== "success") {
      return res.status(400).json({ error: "Claim transaction failed" });
    }

    // Optional but recommended: parse RewardsClaimed / similar event
    // and confirm it matches this bounty + winner + amount.

    // Atomic flip assigned → claimed
    const updated = await Reward.findOneAndUpdate(
      { _id: reward._id, status: "assigned" },
      {
        $set: {
          status: "claimed",
          claimedAt: new Date(),
          claimTxHash: txHash,
        },
      },
      { new: true },
    );

    if (!updated) {
      // Someone else flipped it in between
      return res.status(400).json({ error: "Reward already claimed" });
    }
    // 🔥 NEW: check whether every reward for this bounty has been claimed
    const remaining = await Reward.countDocuments({
      bountyId: id,
      status: "assigned",
    });

    if (remaining === 0) {
      await Bounty.updateOne(
        { _id: id, lifecycleStatus: { $ne: "completed" } },
        { $set: { lifecycleStatus: "completed" } },
      );
    }

    // Mirror into user's claimed history
    // await User.updateOne(
    //   { walletAddress: winnerAddress.toLowerCase() },
    //   {
    //     $push: {
    //       claimedRewards: {
    //         bountyId: id,
    //         bountyTitle: updated.bountyTitle,
    //         amountWei: updated.amount,
    //         amountFormatted: updated.amountFormatted,
    //         claimedAt: updated.claimedAt,
    //         txHash,
    //       },
    //     },
    //     $inc: { "stats.tasksCompleted": 1 },
    //   },
    //   { upsert: true },
    // );

    // Mirror into user's claimed history and increment total earnings
    // NOTE: amountFormatted is a decimal string from formatEther.
    // Number() is lossy for amounts below 1e-15 native-token units. Rewards
    // are at least 0.01 native-token units, so this is safe. If sub-cent rewards are
    // ever supported, store amounts as strings and sum on read.
    const numericAmount = Number(updated.amountFormatted || "0");

    await User.updateOne(
      { walletAddress: winnerAddress.toLowerCase() },
      {
        $push: {
          claimedRewards: {
            bountyId: id,
            bountyTitle: updated.bountyTitle || "Untitled bounty",
            amountWei: updated.amount, // ← was: amount
            amountFormatted: updated.amountFormatted, // ← added
            claimedAt: updated.claimedAt,
            txHash,
          },
        },
        $inc: {
          totalEarnings: numericAmount, // ← dashboard reads this
          // "stats.tasksCompleted": 1,
        },
        $set: { lastLogin: new Date() },
      },
      { upsert: true },
    );

    return res.status(200).json({
      message: "Reward claimed successfully",
      amount: updated.amountFormatted,
      claimedAt: updated.claimedAt,
    });
  } catch (err) {
    console.error("Failed to claim reward:", err);
    return res.status(500).json({ error: "Failed to claim reward" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /task/:id/has-claimed/:userAddress
// ─────────────────────────────────────────────────────────────
const hasClaimed = async (req, res) => {
  const { id, userAddress } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }
  if (!isAddress(userAddress)) {
    return res.status(400).json({ error: "Invalid user address" });
  }

  try {
    const reward = await Reward.findOne({
      bountyId: id,
      winnerAddress: userAddress.toLowerCase(),
    })
      .select("status")
      .lean();

    return res.status(200).json({ hasClaimed: reward?.status === "claimed" });
  } catch (err) {
    console.error("Failed to check claim status:", err);
    return res.status(500).json({ error: "Failed to check claim status" });
  }
};

module.exports = {
  distributeRewards,
  getWinners,
  getClaimable,
  claimReward,
  hasClaimed,
};
