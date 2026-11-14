// const bounty = await Bounty.findById(bountyId);
// if (bounty.submissions.count >= bounty.submissions.maxSubmissions) {
//   throw new Error("Submission limit reached");
// }
const mongoose = require("mongoose");
const Bounty = require("../modules/bounty.module");
const Enrollment = require("../modules/enrollment.module");
const Submission = require("../modules/submission.module");
const { isAcceptingEntries } = require("../utils/bountyLifecycle");
const paginate = require("../utils/paginate");
const { isAdminWallet } = require("../middleware/authorization");
const { serializeSubmission } = require("../utils/serializers");
const { logRequestError } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");
const {
  deleteSubmissionImage,
  uploadSubmissionImage,
} = require("../services/submissionImage.service");

const findPersistedSubmission = async (filter) => {
  let query = Submission.findOne(filter);
  if (typeof query?.select === "function") {
    query = query.select("_id image submittedAt +imagePublicId");
  }
  if (typeof query?.lean === "function") {
    query = query.lean();
  }
  return query;
};

// POST /submission
const submit = async (req, res) => {
  const { bountyId, description, projectLink } = req.body;
  const user = req.auth.walletAddress;

  if (!bountyId || !description || !projectLink) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 校验 ObjectId 格式
  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }

  try {
    const wallet = user.toLowerCase();

    // Check that the bounty exists and is currently accepting submissions.
    const bounty = await Bounty.findById(bountyId);
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    const submissionCount = bounty.submissions?.count ?? 0;
    const maxSubmissions = bounty.submissions?.maxSubmissions ?? 100;
    if (
      !isAcceptingEntries(bounty) ||
      submissionCount >= maxSubmissions
    ) {
      return res
        .status(409)
        .json({ error: "Bounty is not accepting submissions" });
    }

    // 检查是否已提交
    const existing = await Submission.findOne({
      bountyId,
      user: wallet,
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Already submitted to this bounty" });
    }

    const enrollment = await Enrollment.findOne({
      bountyId,
      user: wallet,
    });
    if (!enrollment) {
      return res.status(403).json({
        code: "ENROLLMENT_REQUIRED",
        error: "Enroll in this bounty before submitting work.",
      });
    }

    const submittedAt = new Date();
    const reservedBounty = await Bounty.findOneAndUpdate(
      {
        _id: bountyId,
        archivedAt: null,
        lifecycleStatus: null,
        startDate: { $lte: submittedAt },
        deadline: { $gte: submittedAt },
        $expr: {
          $lt: [
            { $ifNull: ["$submissions.count", 0] },
            { $ifNull: ["$submissions.maxSubmissions", 100] },
          ],
        },
      },
      { $inc: { "submissions.count": 1 } },
      { new: true },
    );
    if (!reservedBounty) {
      return res
        .status(409)
        .json({ error: "Bounty is not accepting submissions" });
    }

    let submission;
    let uploadedImage;
    let submissionCreateAttempted = false;
    try {
      if (req.validatedSubmissionImage) {
        uploadedImage = await uploadSubmissionImage(
          req.validatedSubmissionImage,
          req,
        );
      }

      submissionCreateAttempted = true;
      submission = await Submission.create({
        bountyId,
        bountyTitle: bounty.title,
        user,
        description,
        projectLink,
        image: uploadedImage?.imageUrl || "",
        imagePublicId: uploadedImage?.publicId || "",
        status: "pending",
        submittedAt,
      });
    } catch (error) {
      let persistedSubmission;
      let persistenceCheckCompleted =
        !submissionCreateAttempted || error.code === 11000;
      if (submissionCreateAttempted && error.code !== 11000) {
        try {
          persistedSubmission = await findPersistedSubmission({
            bountyId,
            user: wallet,
            submittedAt,
          });
          persistenceCheckCompleted = true;
        } catch (verificationError) {
          logRequestError(
            req,
            "submission_persistence_verification_failed",
            verificationError,
            "warn",
          );
        }
      }
      if (persistedSubmission) {
        submission = persistedSubmission;
        if (
          uploadedImage &&
          persistedSubmission.imagePublicId !== uploadedImage.publicId
        ) {
          await deleteSubmissionImage(uploadedImage.publicId, req);
        }
      } else {
        if (uploadedImage && persistenceCheckCompleted) {
          await deleteSubmissionImage(uploadedImage.publicId, req);
        }
        if (persistenceCheckCompleted) {
          try {
            const rollback = await Bounty.updateOne(
              { _id: bountyId, "submissions.count": { $gt: 0 } },
              { $inc: { "submissions.count": -1 } },
            );
            if (rollback.modifiedCount !== 1) {
              logRequestError(
                req,
                "submission_capacity_rollback_incomplete",
                new Error("Capacity rollback did not modify a record"),
              );
            }
          } catch (rollbackError) {
            logRequestError(
              req,
              "submission_capacity_rollback_failed",
              rollbackError,
            );
          }
        } else {
          logRequestError(
            req,
            "submission_capacity_rollback_deferred",
            new Error("Submission persistence could not be confirmed"),
            "warn",
          );
        }
        throw error;
      }
    }

    res.status(201).json({
      message: "Submission created successfully",
      _id: submission._id,
      imageUrl: submission.image || "",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Already submitted to this bounty" });
    }
    if (err.code === "IMAGE_UPLOAD_FAILED") {
      logRequestError(req, "submission_image_upload_failed", err);
      return res.status(503).json({
        code: "IMAGE_UPLOAD_UNAVAILABLE",
        error: "Image storage is temporarily unavailable.",
        ...(req.requestId ? { requestId: req.requestId } : {}),
      });
    }
    logRequestError(req, "submission_create_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to create submission",
    });
  }
};

// GET /submissions/user/:wallet
const getUserSubmission = async (req, res) => {
  const wallet = req.auth.walletAddress;

  try {
    const filter = { user: wallet };
    if (req.query.bountyId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.query.bountyId)) {
        return res.status(400).json({ error: "Invalid bountyId" });
      }
      filter.bountyId = req.query.bountyId;
    }

    const { page, limit, skip } = paginate(req.query || {});
    const [submissions, total, pending, accepted, rejected] = await Promise.all([
      Submission.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id bountyId bountyTitle user description projectLink image status submittedAt")
        .lean(),
      Submission.countDocuments(filter),
      Submission.countDocuments({ user: wallet, status: "pending" }),
      Submission.countDocuments({ user: wallet, status: "accepted" }),
      Submission.countDocuments({ user: wallet, status: "rejected" }),
    ]);

    res.status(200).json({
      submissions: submissions.map((submission) =>
        serializeSubmission(submission, { includeWork: true }),
      ),
      stats: {
        pending,
        accepted,
        rejected,
        total: pending + accepted + rejected,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    logRequestError(req, "submission_list_failed", err);
    if (err.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch submissions",
    });
  }
};

const getBountySubmissions = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid bounty id" });
  }
  if (!req.auth?.walletAddress) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const bounty = await Bounty.findById(id).select("_id creator").lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const isCreator =
      bounty.creator?.toLowerCase() === req.auth.walletAddress.toLowerCase();
    const isAdmin = isAdminWallet(req.auth.walletAddress);
    if (isAdmin && !isCreator) {
      await recordSecurityAudit({
        req,
        event: "admin_submissions_read",
        severity: "warn",
        outcome: "success",
        walletAddress: req.auth.walletAddress,
        resourceId: String(bounty._id),
      });
    }

    const filter = { bountyId: id };
    if (!isCreator && !isAdmin) {
      filter.user = req.auth.walletAddress;
    }
    const { page, limit, skip } = paginate(req.query || {});
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id bountyId bountyTitle user description projectLink image status submittedAt")
        .lean(),
      Submission.countDocuments(filter),
    ]);

    return res.status(200).json({
      submissions: submissions.map((submission) =>
        serializeSubmission(submission, { includeWork: true }),
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
  } catch (err) {
    logRequestError(req, "bounty_submission_list_failed", err);
    if (err.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    return res
      .status(500)
      .json({ code: "INTERNAL_ERROR", error: "Failed to fetch submissions" });
  }
};

// GET /bounty/:id/participants
// Public, privacy-preserving directory: never expose submission work here.
const getBountyParticipants = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid bounty id" });
  }

  try {
    const bounty = await Bounty.findById(id).select("_id archivedAt").lean();
    if (!bounty || bounty.archivedAt) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const { page, limit, skip } = paginate(req.query || {});
    const [participants, total] = await Promise.all([
      Submission.find({ bountyId: id })
        .sort({ submittedAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .select("user submittedAt")
        .lean(),
      Submission.countDocuments({ bountyId: id }),
    ]);

    return res.status(200).json({
      participants: participants.map(({ user, submittedAt }) => ({
        walletAddress: user,
        submittedAt,
      })),
      pagination: {
        page, limit, total, pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    logRequestError(req, "bounty_participant_list_failed", err);
    if (err.status === 400) {
      return res.status(400).json({ code: "INVALID_REQUEST", error: "Invalid pagination parameters." });
    }
    return res.status(500).json({ code: "INTERNAL_ERROR", error: "Failed to fetch participants" });
  }
};

module.exports = { submit, getUserSubmission, getBountySubmissions, getBountyParticipants };
