const Bounty = require("../modules/bounty.module");
const Submission = require("../modules/submission.module");
const User = require("../modules/user.module");
const Reward = require("../modules/reward.module");
const buildBountyFilter = require("../utils/buildBountyFilter");
const paginate = require("../utils/paginate");
const buildSortQuery = require("../utils/buildSortQuery");

const createBounty = async (req, res) => {
  try {
    let {
      title,
      description,
      category,
      tags,
      creator,
      startDate,
      deadline,
      originLink,
      network,
      reward,
      token,
      winnersAllowed,
      payoutType,
      percentages,
      // ── on-chain linkage ──
      blockchainId,
      txHash,
      isOnChain,
      bountyContract,
    } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    tags = (tags || []).map((tag) => tag.trim().toLowerCase());
    tags = [...new Set(tags)];

    startDate = new Date(startDate);
    deadline = new Date(deadline);
    reward = Number(reward);

    if (isNaN(startDate.getTime()) || isNaN(deadline.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const bounty = await Bounty.create({
      title,
      description,
      category,
      tags,
      creator,
      startDate,
      deadline,
      originLink,
      network,
      reward,
      token,
      winnersAllowed,
      payoutType,
      percentages,
      // ── persist the linkage ──
      blockchainId: blockchainId ?? null,
      txHash: txHash ?? null,
      isOnChain: isOnChain ?? false,
      bountyContract: bountyContract ?? null,
    });

    res.status(201).json({
      message: "Bountycreated sucessfully",
      bounty: {
        _id: bounty.id,
        title: bounty.title,
        creator: bounty.creator,
        blockchainId: bounty.blockchainId,
        bountyContract: bounty.bountyContract,
      },
    });
  } catch (error) {
    console.error("Failed to create Bounty:", error, "path:", error.name);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    // Mongoose cast error (e.g. bad ObjectId) → 400
    if (error.name === "CastError") {
      return res.status(400).json({
        message: `Invalid value for ${error.path}`,
        value: error.value,
      });
    }

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// get single bounty
const getBounty = async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(400).json({ message: "Bounty not found" });

    const submissions = await Submission.find({ bountyId: bounty._id })
      .sort({ submittedAt: -1 })
      .lean();

    const isCreator =
      req.query.wallet &&
      bounty.creator?.toLowerCase() === req.query.wallet.toLowerCase();

    // Public shape: addresses and timestamps only
    const publicSubmissions = submissions.map((s) => ({
      _id: s._id,
      user: s.user,
      submittedAt: s.submittedAt,
      status: s.status,
    }));

    // Creator shape: full content
    const creatorSubmissions = submissions;

    res.status(200).json({
      message: "Success",
      bounty: {
        ...bounty.toObject({ virtuals: true }),
        status: bounty.currentStatus,
        submissions: {
          count: bounty.submissions?.count ?? submissions.length,
          maxSubmissions: bounty.submissions?.maxSubmissions ?? 100,
          items: isCreator ? creatorSubmissions : publicSubmissions,
          isCreatorView: Boolean(isCreator),
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid bounty id" });
    }
    console.error("Failed to fetch bounty:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getBounties = async (req, res) => {
  try {
    // Build MongoDB filter
    const filter = buildBountyFilter(req.query);

    // Build pagination
    const { page, limit, skip } = paginate(req.query);

    // Build sorting
    const sort = buildSortQuery(req.query);

    const total = await Bounty.countDocuments(filter);

    const bounties = await Bounty.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      bounties,

      pagination: {
        page,
        limit,
        total,

        pages: Math.ceil(total / limit),

        hasNext: page * limit < total,

        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bounties",
      error: error.message,
    });
  }
};

const updateBounty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Request body is empty",
      });
    }

    const updates = {};

    const allowedFields = ["title", "description", "originLink"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const bounty = await Bounty.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!bounty) {
      return res.status(404).json({
        message: "Bounty not found",
      });
    }

    res.status(200).json({
      message: "Bounty updated successfully",
      bounty,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteBounty = async (req, res) => {
  const bounty = await Bounty.findByIdAndDelete(req.params.id);
  if (!bounty) return res.status(404).json({ message: "Bounty not found" });

  res.status(200).json({ message: "Deleted successfully" });
};

const bountyTags = async (req, res) => {
  try {
    const tags = (await Bounty.distinct("tags")).sort();

    res.status(200).json(tags);
  } catch (err) {
    console.error("Failed to fetch tags", err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

const bountyCategory = async (req, res) => {
  try {
    const categories = (await Bounty.distinct("category")).sort();
    res.status(200).json(categories);
  } catch (err) {
    console.error("Failed to fetch categories", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    // 1. Total bounties created (matches your contract counter)
    const bountiesCreated = await Bounty.countDocuments();

    // 2. Bounties completed (where rewards have been distributed)
    const bountiesCompleted = await Bounty.countDocuments({
      lifecycleStatus: "completed",
    });

    // 3. Total rewards paid (sum of all claimed rewards)
    const rewards = await Reward.find({ status: "claimed" }).lean();
    const totalPaid = rewards.reduce(
      (sum, r) => sum + Number(r.amountFormatted || 0),
      0,
    );

    // 4. Unique contributors (anyone who has submitted work)
    const contributors = await Submission.distinct("user").then(
      (users) => users.length,
    );

    res.status(200).json({
      bountiesCreated,
      bountiesCompleted,
      totalPaid,
      contributors,
    });
  } catch (err) {
    console.error("Failed to fetch platform stats:", err);
    res.status(500).json({ error: "Failed to fetch platform stats" });
  }
};

module.exports = {
  createBounty,
  getBounty,
  getBounties,
  updateBounty,
  deleteBounty,
  bountyTags,
  bountyCategory,
  getPlatformStats,
};
