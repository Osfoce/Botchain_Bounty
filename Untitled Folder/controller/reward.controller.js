const mongoose = require("mongoose");
const { formatEther, parseEventLogs } = require("viem");

const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const User = require("../modules/user.module");
const Submission = require("../modules/submission.module");
const { getPublicClient } = require("../config/chains");
const { BOUNTY_ABI } = require("../config/abi");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isAddress = (a) => typeof a === "string" && /^0x[a-fA-F0-9]{40}$/.test(a);

// ─────────────────────────────────────────────────────────────
// POST /task/:id/distribute
// Sync winners + amounts from the on-chain RewardsAssigned event
// ─────────────────────────────────────────────────────────────
const distributeRewards = async (req, res) => {
  const { id } = req.params;
  const { txHash, blockchainId, chainId, bountyContract } = req.body;
  console.log("DISTRIBUTE DEBUG:", {
    id,
    txHash,
    blockchainId,
    chainId,
    bountyContract,
    types: {
      txHash: typeof txHash,
      blockchainId: typeof blockchainId,
      chainId: typeof chainId,
      bountyContract: typeof bountyContract,
    },
    falsy: {
      txHash: !txHash,
      blockchainId: !blockchainId,
      chainId: !chainId,
      bountyContract: !bountyContract,
    },
  });

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid bounty ID" });
  }

  // Normalize chainId — accept both number and string
  const chainIdNum = Number(chainId);
  if (!Number.isFinite(chainIdNum) || chainIdNum <= 0) {
    return res.status(400).json({ error: "Invalid chainId" });
  }

  if (!txHash || !blockchainId) {
    return res.status(400).json({ error: "Missing txHash or blockchainId" });
  }

  try {
    const bounty = await Bounty.findById(id);
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const contractAddress = bounty.bountyContract || bountyContract;

    if (!contractAddress) {
      return res.status(400).json({
        error: "No contract address linked to this bounty",
      });
    }

    // Guard: don't re-distribute the same bounty.
    if (bounty.rewardsAssignedOnChain) {
      return res.status(400).json({ error: "Rewards already distributed" });
    }

    // 🔥 STEP 1: receipt
    const publicClient = getPublicClient(chainIdNum);
    if (!publicClient) {
      return res
        .status(400)
        .json({ error: `No RPC client configured for chain ${chainIdNum}` });
    }
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    if (receipt.status !== "success") {
      throw new Error("Transaction failed on-chain");
    }

    // 🔥 STEP 2: parse RewardsAssigned event
    const events = parseEventLogs({
      abi: BOUNTY_ABI,
      logs: receipt.logs,
      eventName: "RewardsAssigned",
    });

    if (!events.length) {
      throw new Error("RewardsAssigned event not found");
    }

    const winners = events[0].args.winners;

    // 🔥 STEP 3: read authoritative amounts from the contract
    const winnerDetails = await Promise.all(
      winners.map(async (winner) => {
        const amountWei = await publicClient.readContract({
          address: contractAddress,
          abi: BOUNTY_ABI,
          functionName: "claimableRewards",
          args: [BigInt(blockchainId), winner],
        });

        return {
          winnerAddress: winner.toLowerCase(),
          amountWei: amountWei.toString(), // keep as string
          amountFormatted: formatEther(amountWei), // human-readable
        };
      }),
    );

    // 🔥 STEP 4: persist rewards (one doc per winner)
    const rewardDocs = winnerDetails.map((w) => ({
      bountyId: bounty._id,
      blockchainId,
      chainId: chainIdNum,
      bountyContract,
      bountyTitle: bounty.title,
      winnerAddress: w.winnerAddress,
      amount: w.amountWei,
      amountFormatted: w.amountFormatted,
      status: "assigned",
      distributionTxHash: txHash,
      assignedAt: new Date(),
    }));

    // insertMany with ordered:false so one dup doesn't kill the batch
    try {
      await Reward.insertMany(rewardDocs, { ordered: false });
    } catch (e) {
      // Duplicate key (already distributed this winner) → safe to ignore
      if (e.code !== 11000 && !e.writeErrors?.every((w) => w.code === 11000)) {
        throw e;
      }
    }

    // 🔥 STEP 5: update Bounty summary + mark distributed
    bounty.rewardsAssignedOnChain = true;
    bounty.distributionTxHash = txHash;
    bounty.distributedAt = new Date();
    bounty.assignedCount = winnerDetails.length;
    bounty.winners.assigned = winnerDetails.map((w) => w.winnerAddress);
    await bounty.save();

    // 🔥 STEP 5b: update submission statuses
    // Winners → accepted, everyone else on this bounty → rejected
    const winnerAddresses = winnerDetails.map((w) => w.winnerAddress);

    await Submission.updateMany(
      {
        bountyId: bounty._id,
        user: { $in: winnerAddresses },
      },
      { $set: { status: "accepted" } },
    );

    await Submission.updateMany(
      {
        bountyId: bounty._id,
        user: { $nin: winnerAddresses },
      },
      { $set: { status: "rejected" } },
    );

    // 🔥 STEP 6: increment completed tasks for each winner
    await Promise.all(
      winnerDetails.map((w) =>
        User.updateOne(
          { walletAddress: w.winnerAddress },
          {
            $inc: { "stats.tasksCompleted": 1 },
            $set: { lastLogin: new Date() },
          },
          { upsert: true },
        ),
      ),
    );

    return res.status(200).json({
      message: "Distribution synced from blockchain",
      winners: winnerDetails,
      chainId: chainIdNum,
      txHash,
    });
  } catch (err) {
    console.error("🔥 DISTRIBUTION ERROR:", err);
    return res.status(500).json({ error: err.message });
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

    const rewards = await Reward.find({ bountyId: id }).lean();

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
      isDistributed: rewards.length > 0,
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
