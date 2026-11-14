const Bounty = require("../modules/bounty.module");
const Submission = require("../modules/submission.module");
const User = require("../modules/user.module");
const Reward = require("../modules/reward.module");
const buildBountyFilter = require("../utils/buildBountyFilter");
const paginate = require("../utils/paginate");
const buildSortQuery = require("../utils/buildSortQuery");
const { isAdminWallet } = require("../middleware/authorization");
const chainSettings = require("../config/chains");
const { CHAINS } = chainSettings;
const { verifyBountyCreation } = require("../services/verifiedBountyCreation.service");
const {
  decimalToBaseUnits,
  sumBountyBudgets,
  sumRewardAmounts,
} = require("../services/financialAmounts.service");
const {
  serializeBounty,
  serializeSubmission,
} = require("../utils/serializers");
const { logRequestError } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const createBounty = async (req, res) => {
  try {
    if (
      req.body?.creator !== undefined &&
      (typeof req.body.creator !== "string" ||
        req.body.creator.toLowerCase() !== req.auth.walletAddress.toLowerCase())
    ) {
      return res.status(400).json({
        message: "Creator must match the authenticated wallet",
      });
    }

    let {
      title,
      description,
      category,
      tags,
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
    const submittedReward = reward;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (isOnChain !== undefined && typeof isOnChain !== "boolean") {
      return res.status(400).json({
        code: "INVALID_ON_CHAIN_FLAG",
        message: "isOnChain must be a boolean",
      });
    }

    tags = (tags || []).map((tag) => tag.trim().toLowerCase());
    tags = [...new Set(tags)];

    startDate = new Date(startDate);
    deadline = new Date(deadline);
    if (submittedReward == null || String(submittedReward).trim() === "") {
      return res.status(400).json({
        code: "INVALID_REWARD_AMOUNT",
        message: "Reward must be a valid token amount",
      });
    }

    let rewardWei = null;
    const networkConfig = CHAINS[Number(network)];
    if (networkConfig) {
      try {
        rewardWei = decimalToBaseUnits(
          submittedReward,
          networkConfig.chain.nativeCurrency.decimals,
        ).toString();
      } catch {
        return res.status(400).json({
          code: "INVALID_REWARD_AMOUNT",
          message: "Reward cannot be represented in the selected token's precision",
        });
      }
    }
    reward = Number(reward);

    if (isNaN(startDate.getTime()) || isNaN(deadline.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const hasOnChainMetadata =
      blockchainId != null || txHash != null || bountyContract != null;
    if (isOnChain === false && hasOnChainMetadata) {
      return res.status(400).json({
        code: "CHAIN_CONFIGURATION_MISMATCH",
        message: "On-chain metadata cannot be supplied for an off-chain bounty",
      });
    }

    let verifiedLink = null;
    if (isOnChain === true || hasOnChainMetadata) {
      const chainId = Number(network);
      const chainConfig = CHAINS[chainId];
      if (!Number.isSafeInteger(chainId) || !chainConfig) {
        return res.status(400).json({
          code: "UNSUPPORTED_CHAIN",
          message: "Unsupported bounty network",
        });
      }
      if (
        bountyContract != null &&
        (typeof bountyContract !== "string" ||
          bountyContract.toLowerCase() !== chainConfig.bountyContract.toLowerCase())
      ) {
        return res.status(409).json({
          code: "CHAIN_CONFIGURATION_MISMATCH",
          message: "Bounty contract does not match trusted chain configuration",
        });
      }
      if (
        blockchainId != null &&
        (!/^[0-9]+$/.test(String(blockchainId)) ||
          BigInt(blockchainId) > BigInt(Number.MAX_SAFE_INTEGER))
      ) {
        return res.status(400).json({
          code: "EVENT_BOUNTY_MISMATCH",
          message: "Invalid on-chain bounty ID",
        });
      }

      try {
        verifiedLink = await verifyBountyCreation({
          publicClient: chainSettings.getPublicClient(chainId),
          transactionHash: txHash,
          chainId,
          chainConfig,
          creator: req.auth.walletAddress,
          reward: submittedReward,
          token,
          payoutType,
          expectedBlockchainId: blockchainId,
        });
      } catch (error) {
        await recordSecurityAudit({
          req,
          event:
            error.code === "RPC_UNAVAILABLE"
              ? "rpc_unavailable"
              : "transaction_verification_failed",
          severity: "warn",
          outcome: "failure",
          walletAddress: req.auth.walletAddress,
          transactionId: txHash,
          chainId,
          errorCode: error.code,
        });
        const statusByCode = {
          INVALID_TX_HASH: 400,
          UNSUPPORTED_CHAIN: 400,
          TRANSACTION_NOT_FOUND: 202,
          TRANSACTION_NOT_CONFIRMED: 202,
          TRANSACTION_REVERTED: 400,
          WRONG_TRANSACTION_DESTINATION: 409,
          EVENT_EMITTER_MISMATCH: 409,
          EVENT_BOUNTY_MISMATCH: 409,
          EVENT_WALLET_MISMATCH: 409,
          EVENT_AMOUNT_MISMATCH: 409,
          EVENT_MISMATCH: 409,
          CHAIN_CONFIGURATION_MISMATCH: 409,
          RPC_UNAVAILABLE: 503,
        };
        const status = statusByCode[error.code] || 503;
        if (status === 503) {
          logRequestError(
            req,
            "bounty_transaction_verification_unavailable",
            error,
            "warn",
          );
        }
        return res.status(status).json({
          code: error.code || "RPC_UNAVAILABLE",
          message: error.message || "Could not verify bounty transaction",
          ...(status === 202 || status === 503 ? { retryable: true } : {}),
        });
      }

      const existing = await Bounty.findOne({ txHash: verifiedLink.txHash });
      if (existing) {
        if (
          existing.creator?.toLowerCase() !== req.auth.walletAddress.toLowerCase() ||
          Number(existing.network) !== chainId ||
          String(existing.blockchainId) !== String(verifiedLink.blockchainId)
        ) {
          return res.status(409).json({
            code: "CHAIN_CONFIGURATION_MISMATCH",
            message: "Transaction is already linked to a different bounty",
          });
        }
        await recordSecurityAudit({
          req,
          event: "bounty_creation_replayed",
          severity: "info",
          outcome: "success",
          walletAddress: req.auth.walletAddress,
          resourceId: String(existing._id),
          transactionId: verifiedLink.txHash,
          chainId,
        });
        return res.status(201).json({
          message: "Bounty created successfully",
          bounty: {
            _id: existing.id,
            title: existing.title,
            creator: existing.creator,
            blockchainId: existing.blockchainId,
            bountyContract: existing.bountyContract,
          },
        });
      }
    }

    const bounty = await Bounty.create({
      title,
      description,
      category,
      tags,
      creator: req.auth.walletAddress,
      startDate,
      deadline,
      originLink,
      network,
      reward,
      rewardWei: verifiedLink?.rewardWei ?? rewardWei,
      token,
      winnersAllowed,
      payoutType,
      percentages,
      blockchainId: verifiedLink?.blockchainId ?? null,
      txHash: verifiedLink?.txHash ?? null,
      isOnChain: Boolean(verifiedLink),
      bountyContract: verifiedLink?.bountyContract ?? null,
    });

    await recordSecurityAudit({
      req,
      event: "bounty_created",
      severity: "info",
      outcome: "success",
      walletAddress: req.auth.walletAddress,
      resourceId: String(bounty._id),
      transactionId: bounty.txHash,
      chainId: Number(bounty.network),
    });
    res.status(201).json({
      message: "Bounty created successfully",
      bounty: {
        _id: bounty.id,
        title: bounty.title,
        creator: bounty.creator,
        blockchainId: bounty.blockchainId,
        bountyContract: bounty.bountyContract,
      },
    });
  } catch (error) {
    logRequestError(req, "bounty_create_failed", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        message: "Validation failed",
        fields: Object.keys(error.errors).map((field) => field),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        message: `Invalid value for ${error.path}`,
      });
    }

    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    });
  }
};

// get single bounty
const getBounty = async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(400).json({ message: "Bounty not found" });

    const isCreator =
      req.auth?.walletAddress &&
      bounty.creator?.toLowerCase() === req.auth.walletAddress;
    const isAdmin = req.auth?.walletAddress && isAdminWallet(req.auth.walletAddress);
    if (bounty.archivedAt && !isCreator && !isAdmin) {
      return res.status(404).json({ message: "Bounty not found" });
    }

    const submissionCount =
      bounty.submissions?.count ??
      (await Submission.countDocuments({ bountyId: bounty._id }));
    let submissions = [];

    if (isCreator || isAdmin) {
      if (isAdmin && !isCreator) {
        await recordSecurityAudit({
          req,
          event: "admin_bounty_submissions_read",
          severity: "warn",
          outcome: "success",
          walletAddress: req.auth.walletAddress,
          resourceId: String(bounty._id),
        });
      }
      const privateSubmissions = await Submission.find({ bountyId: bounty._id })
        .sort({ submittedAt: -1 })
        .limit(100)
        .select("_id bountyId bountyTitle user description projectLink image status submittedAt")
        .lean();
      submissions = privateSubmissions.map((submission) =>
        serializeSubmission(submission, { includeWork: true }),
      );
    }

    const serializedBounty = serializeBounty(bounty, {
      submissionCount,
      submissions,
    });
    serializedBounty.submissions.isCreatorView = Boolean(isCreator);
    serializedBounty.submissions.isAdminView = Boolean(isAdmin);

    res.status(200).json({
      message: "Success",
      bounty: serializedBounty,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid bounty id" });
    }
    logRequestError(req, "bounty_read_failed", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    });
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
      bounties: bounties.map((bounty) => serializeBounty(bounty)),

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
    logRequestError(req, "bounty_list_failed", error);
    if (error.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch bounties",
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

    const allowedFields = new Set(["title", "description", "originLink", "deadline"]);
    const rejectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.has(field),
    );
    if (rejectedFields.length > 0) {
      return res.status(400).json({
        message: "Only title, description, originLink, and deadline can be updated",
      });
    }

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.has(field)),
    );
    const existingBounty = await Bounty.findById(id);
    if (!existingBounty) {
      return res.status(404).json({ message: "Bounty not found" });
    }

    if (updates.deadline !== undefined) {
      const nextDeadline = new Date(updates.deadline);
      if (nextDeadline.getTime() <= new Date(existingBounty.deadline).getTime()) {
        return res.status(400).json({
          code: "DEADLINE_MUST_BE_EXTENDED",
          message: "The deadline can only be extended",
        });
      }
      updates.deadline = nextDeadline;
      updates.deadlineExtendedFrom = existingBounty.deadline;
    }

    existingBounty.set(updates);
    const bounty = await existingBounty.save();

    await recordSecurityAudit({
      req,
      event: "bounty_updated",
      severity: "info",
      outcome: "success",
      walletAddress: req.auth.walletAddress,
      resourceId: id,
    });
    res.status(200).json({
      message: "Bounty updated successfully",
      bounty: serializeBounty(bounty),
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        message: "Validation failed",
      });
    }

    logRequestError(req, "bounty_update_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    });
  }
};

const deleteBounty = async (req, res) => {
  try {
    const bounty = req.bounty || (await Bounty.findById(req.params.id));
    if (!bounty) return res.status(404).json({ message: "Bounty not found" });
    if (bounty.archivedAt) {
      return res.status(200).json({
        message: "Bounty already archived; on-chain state was not changed",
        archived: true,
        onChainChanged: false,
      });
    }

    const archivedAt = new Date();
    const archived = await Bounty.findByIdAndUpdate(
      bounty._id,
      {
        $set: {
          archivedAt,
          archivedBy: req.auth.walletAddress.toLowerCase(),
        },
      },
      { new: true, runValidators: true },
    );
    if (!archived) {
      return res.status(404).json({ message: "Bounty not found" });
    }

    await recordSecurityAudit({
      req,
      event:
        req.authorizationRole === "admin"
          ? "admin_bounty_archived"
          : "bounty_archived",
      severity: req.authorizationRole === "admin" ? "warn" : "info",
      outcome: "success",
      walletAddress: req.auth.walletAddress,
      resourceId: String(bounty._id),
    });

    return res.status(200).json({
      message: "Bounty archived successfully; on-chain state was not changed",
      archived: true,
      bountyId: String(archived._id),
      onChainChanged: false,
    });
  } catch (error) {
    logRequestError(req, "bounty_archive_failed", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to archive bounty",
    });
  }
};

const bountyTags = async (req, res) => {
  try {
    const tags = (await Bounty.distinct("tags", { archivedAt: null })).sort();

    res.status(200).json(tags);
  } catch (err) {
    logRequestError(req, "bounty_tags_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch tags",
    });
  }
};

const bountyCategory = async (req, res) => {
  try {
    const categories = (
      await Bounty.distinct("category", { archivedAt: null })
    ).sort();
    res.status(200).json(categories);
  } catch (err) {
    logRequestError(req, "bounty_categories_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch categories",
    });
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
    const totalPaid = sumRewardAmounts(rewards);

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
    logRequestError(req, "bounty_platform_stats_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch platform stats",
    });
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
