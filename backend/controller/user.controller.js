const User = require("../modules/user.module");
const { logRequestError } = require("../utils/requestLogger");
const Bounty = require("../modules/bounty.module");
const Submission = require("../modules/submission.module");
const Enrollment = require("../modules/enrollment.module");
const Comment = require("../modules/comment.module");
const Reward = require("../modules/reward.module");
const UserDataRequest = require("../modules/userDataRequest.module");
const paginate = require("../utils/paginate");
const {
  serializeBounty,
  serializeSubmission,
  serializeUser,
} = require("../utils/serializers");
const { getTotalEarnings } = require("../services/financialAmounts.service");
const { getUsdEarnings } = require("../services/usdEarnings.service");
const { getSafeErrorCode } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const getUsdEarningsForUser = async (req, user) => {
  try {
    return await getUsdEarnings({
      rewards: user.claimedRewards || [],
      legacyTotal: user.totalEarnings,
    });
  } catch (error) {
    logRequestError(req, "user_usd_earnings_unavailable", error, "warn");
    return {
      status: "unavailable",
      totalEarningsUsd: null,
      breakdown: [],
      errorCode: getSafeErrorCode(error, "USD_VALUATION_UNAVAILABLE"),
    };
  }
};

const getOrCreateUserProfile = async (req, res) => {
  const wallet = req.auth.walletAddress;

  try {
    let user = await User.findOne({ walletAddress: wallet });

    if (!user) {
      user = await User.create({ walletAddress: wallet });
    } else {
      user = await User.findOneAndUpdate(
        { walletAddress: wallet },
        { $set: { lastLogin: new Date() } },
        { new: true },
      );
    }

    const { page, limit, skip } = paginate(req.query || {});
    const bountyFilter = { creator: wallet };
    const submissionFilter = { user: wallet };
    const [createdBounties, submissions, bountyTotal, submissionTotal] =
      await Promise.all([
        Bounty.find(bountyFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Submission.find(submissionFilter)
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .select(
            "_id bountyId bountyTitle user description projectLink image status submittedAt",
          )
          .lean(),
        Bounty.countDocuments(bountyFilter),
        Submission.countDocuments(submissionFilter),
      ]);

    const [usdEarnings] = await Promise.all([getUsdEarningsForUser(req, user)]);

    res.status(200).json({
      user: {
        ...serializeUser(user),
        totalEarningsUsd: usdEarnings.totalEarningsUsd,
        earningsUsdBreakdown: usdEarnings.breakdown,
        earningsUsdStatus: usdEarnings.status,
        ...(usdEarnings.errorCode
          ? { earningsUsdErrorCode: usdEarnings.errorCode }
          : {}),
      },
      createdBounties: createdBounties.map((bounty) => serializeBounty(bounty)),
      submissions: submissions.map((submission) =>
        serializeSubmission(submission, { includeWork: true }),
      ),
      pagination: {
        page,
        limit,
        bounties: {
          total: bountyTotal,
          pages: Math.ceil(bountyTotal / limit),
        },
        submissions: {
          total: submissionTotal,
          pages: Math.ceil(submissionTotal / limit),
        },
      },
    });
  } catch (err) {
    logRequestError(req, "user_read_failed", err);
    if (err.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch user",
    });
  }
};

const getUserDashboard = async (req, res) => {
  const wallet = req.auth.walletAddress;
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      {
        $set: { lastLogin: new Date() },
        $setOnInsert: { walletAddress: wallet },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const now = new Date();
    const [
      bountyStatusRows,
      submissionStatusRows,
      enrollments,
      enrollmentTotal,
      usdEarnings,
    ] = await Promise.all([
      Bounty.aggregate([
        { $match: { creator: wallet } },
        {
          $project: {
            status: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$lifecycleStatus", "completed"] },
                    then: "completed",
                  },
                  {
                    case: { $eq: ["$lifecycleStatus", "cancelled"] },
                    then: "cancelled",
                  },
                  { case: { $gt: ["$startDate", now] }, then: "upcoming" },
                  { case: { $gte: ["$deadline", now] }, then: "active" },
                ],
                default: "ended",
              },
            },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $match: { user: wallet } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Enrollment.find({ user: wallet })
        .sort({ enrolledAt: -1 })
        .limit(100)
        .select("bountyId")
        .lean(),
      Enrollment.countDocuments({ user: wallet }),
      getUsdEarningsForUser(req, user),
    ]);

    const bountyStats = {
      active: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      ended: 0,
      total: 0,
    };
    for (const { _id: status, count } of bountyStatusRows) {
      if (Object.hasOwn(bountyStats, status)) {
        bountyStats[status] = count;
        bountyStats.total += count;
      }
    }

    const submissionStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      total: 0,
    };
    for (const { _id: status, count } of submissionStatusRows) {
      if (Object.hasOwn(submissionStats, status)) {
        submissionStats[status] = count;
        submissionStats.total += count;
      }
    }
    res.status(200).json({
      user: {
        walletAddress: wallet,
        reputationScore: user.reputationScore || 0,
        totalEarnings: getTotalEarnings(user),
        totalEarningsUsd: usdEarnings.totalEarningsUsd,
        earningsUsdBreakdown: usdEarnings.breakdown,
        earningsUsdStatus: usdEarnings.status,
        ...(usdEarnings.errorCode
          ? { earningsUsdErrorCode: usdEarnings.errorCode }
          : {}),
        tasksCompleted: user.stats?.tasksCompleted || 0,
      },
      bounties: bountyStats,
      submissions: submissionStats,
      enrolledBountyIds: enrollments.map((e) => String(e.bountyId)),
      enrollmentPagination: {
        limit: 100,
        total: enrollmentTotal,
        hasMore: enrollmentTotal > enrollments.length,
      },
    });
  } catch (err) {
    logRequestError(req, "user_dashboard_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch dashboard stats",
    });
  }
};

const getUserDataExport = async (req, res) => {
  const wallet = req.auth.walletAddress;
  try {
    const { page, limit, skip } = paginate(req.query || {});
    const [
      profile,
      createdBounties,
      bountyTotal,
      submissions,
      submissionTotal,
      enrollments,
      enrollmentTotal,
      comments,
      commentTotal,
      rewards,
      rewardTotal,
    ] = await Promise.all([
      User.findOne({ walletAddress: wallet })
        .select({
          walletAddress: 1,
          reputationScore: 1,
          totalEarnings: 1,
          createdAt: 1,
          lastLogin: 1,
          "stats.tasksCreated": 1,
          "stats.tasksCompleted": 1,
          "stats.submissions.pending": 1,
          "stats.submissions.accepted": 1,
          "stats.submissions.rejected": 1,
        })
        .lean(),
      Bounty.find({ creator: wallet })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bounty.countDocuments({ creator: wallet }),
      Submission.find({ user: wallet })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "_id bountyId bountyTitle user description projectLink image status submittedAt",
        )
        .lean(),
      Submission.countDocuments({ user: wallet }),
      Enrollment.find({ user: wallet })
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id bountyId user status enrolledAt submittedAt")
        .lean(),
      Enrollment.countDocuments({ user: wallet }),
      Comment.find({ user: wallet })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id bountyId user text createdAt")
        .lean(),
      Comment.countDocuments({ user: wallet }),
      Reward.find({ winnerAddress: wallet })
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "_id bountyId bountyTitle blockchainId chainId bountyContract winnerAddress amount amountFormatted status distributionTxHash assignedAt claimedAt claimTxHash claimLogIndex claimBlockNumber claimBlockHash",
        )
        .lean(),
      Reward.countDocuments({ winnerAddress: wallet }),
    ]);

    const pagination = (total) => ({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    });

    return res.status(200).json({
      data: {
        profile,
        createdBounties: createdBounties.map((bounty) =>
          serializeBounty(bounty),
        ),
        submissions: submissions.map((submission) =>
          serializeSubmission(submission, { includeWork: true }),
        ),
        enrollments,
        comments,
        rewards,
      },
      pagination: {
        createdBounties: pagination(bountyTotal),
        submissions: pagination(submissionTotal),
        enrollments: pagination(enrollmentTotal),
        comments: pagination(commentTotal),
        rewards: pagination(rewardTotal),
      },
      excluded: [
        "authentication sessions",
        "nonce hashes",
        "rate-limit keys",
        "internal distribution-deduplication keys",
      ],
    });
  } catch (error) {
    logRequestError(req, "user_data_export_failed", error);
    if (error.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to export user data",
    });
  }
};

const serializeUserDataRequest = (request, includeReviewDetails = false) => ({
  _id: String(request._id),
  status: request.status,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
  reviewedAt: request.reviewedAt || null,
  ...(includeReviewDetails
    ? {
        walletAddress: request.walletAddress,
        reviewedBy: request.reviewedBy || null,
        resolution: request.resolution || null,
      }
    : {}),
});

const findActiveDataRequest = (wallet) =>
  UserDataRequest.findOne({ walletAddress: wallet, active: true })
    .sort({ createdAt: -1 })
    .select("_id status createdAt updatedAt reviewedAt")
    .lean();

const requestUserDataDeletion = async (req, res) => {
  const wallet = req.auth.walletAddress;
  try {
    const existing = await findActiveDataRequest(wallet);
    if (existing) {
      return res.status(200).json({
        request: serializeUserDataRequest(existing),
        alreadyOpen: true,
      });
    }

    const request = await UserDataRequest.create({ walletAddress: wallet });
    await recordSecurityAudit({
      req,
      event: "user_data_deletion_requested",
      severity: "info",
      outcome: "success",
      walletAddress: wallet,
      resourceId: String(request._id),
    });
    return res.status(202).json({
      request: serializeUserDataRequest(request),
      alreadyOpen: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const existing = await findActiveDataRequest(wallet);
        if (existing) {
          return res.status(200).json({
            request: serializeUserDataRequest(existing),
            alreadyOpen: true,
          });
        }
      } catch (lookupError) {
        logRequestError(req, "user_data_request_lookup_failed", lookupError);
      }
    }
    logRequestError(req, "user_data_deletion_request_failed", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to create data deletion request",
    });
  }
};

const getUserDataDeletionRequests = async (req, res) => {
  const wallet = req.auth.walletAddress;
  try {
    const { page, limit, skip } = paginate(req.query || {});
    const filter = { walletAddress: wallet };
    const [requests, total] = await Promise.all([
      UserDataRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id status createdAt updatedAt reviewedAt")
        .lean(),
      UserDataRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      requests: requests.map((request) => serializeUserDataRequest(request)),
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
    logRequestError(req, "user_data_requests_read_failed", error);
    if (error.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch data deletion requests",
    });
  }
};

const getAdminUserDataDeletionRequests = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req.query || {});
    const [requests, total] = await Promise.all([
      UserDataRequest.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "_id walletAddress status reviewedBy reviewedAt resolution createdAt updatedAt +resolution",
        )
        .lean(),
      UserDataRequest.countDocuments({}),
    ]);

    return res.status(200).json({
      requests: requests.map((request) =>
        serializeUserDataRequest(request, true),
      ),
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
    logRequestError(req, "admin_user_data_requests_read_failed", error);
    if (error.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch data deletion requests",
    });
  }
};

const updateAdminUserDataDeletionRequest = async (req, res) => {
  const { id } = req.params;
  const { status, resolution } = req.body;
  const terminal = status === "completed" || status === "rejected";

  try {
    const existing = await UserDataRequest.findById(id)
      .select("_id status")
      .lean();
    if (!existing) {
      return res.status(404).json({
        code: "NOT_FOUND",
        error: "Data deletion request not found.",
      });
    }
    if (!["pending", "reviewing"].includes(existing.status)) {
      return res.status(409).json({
        code: "INVALID_STATE",
        error: "This data deletion request is already closed.",
      });
    }

    const updated = await UserDataRequest.findOneAndUpdate(
      { _id: id, status: existing.status },
      {
        $set: {
          status,
          active: !terminal,
          reviewedBy: req.auth.walletAddress,
          reviewedAt: terminal ? new Date() : null,
          ...(resolution !== undefined ? { resolution } : {}),
        },
      },
      { new: true, runValidators: true },
    )
      .select(
        "_id walletAddress status reviewedBy reviewedAt resolution createdAt updatedAt +resolution",
      )
      .lean();

    if (!updated) {
      return res.status(409).json({
        code: "INVALID_STATE",
        error: "This data deletion request changed while being reviewed.",
      });
    }

    await recordSecurityAudit({
      req,
      event: "admin_user_data_request_reviewed",
      severity: "warn",
      outcome: "success",
      walletAddress: req.auth.walletAddress,
      resourceId: id,
    });
    return res.status(200).json({
      request: serializeUserDataRequest(updated, true),
    });
  } catch (error) {
    logRequestError(req, "admin_user_data_request_update_failed", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to update data deletion request",
    });
  }
};

module.exports = {
  getAdminUserDataDeletionRequests,
  getOrCreateUserProfile,
  getUserDashboard,
  getUserDataDeletionRequests,
  getUserDataExport,
  requestUserDataDeletion,
  updateAdminUserDataDeletionRequest,
};
