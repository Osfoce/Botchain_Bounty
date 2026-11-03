const mongoose = require("mongoose");
const Enrollment = require("../modules/enrollment.module");
const Bounty = require("../modules/bounty.module");
const { isAcceptingEntries } = require("../utils/bountyLifecycle");
const paginate = require("../utils/paginate");
const { logRequestError } = require("../utils/requestLogger");

// POST /enroll
const userEnrollment = async (req, res) => {
  const { bountyId } = req.body;
  const user = req.auth.walletAddress;

  if (!bountyId) {
    return res.status(400).json({ error: "Missing bountyId" });
  }

  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }

  try {
    // 1. Make sure the bounty exists
    const bounty = await Bounty.findById(bountyId).lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    if (!isAcceptingEntries(bounty)) {
      return res.status(409).json({ error: "Bounty is not accepting enrollments" });
    }

    // 2. Prevent duplicate enrollment
    const existing = await Enrollment.findOne({ bountyId, user });
    if (existing) {
      return res.status(400).json({ error: "Already enrolled" });
    }

    // 3. Create enrollment
    const enrollment = await Enrollment.create({
      bountyId,
      user,
      status: "enrolled",
      enrolledAt: new Date(),
    });

    res.status(201).json({
      message: "Enrolled successfully",
      _id: enrollment._id,
    });
  } catch (err) {
    // Handle race-condition unique index violation
    if (err.code === 11000) {
      return res.status(400).json({ error: "Already enrolled" });
    }
    logRequestError(req, "enrollment_create_failed", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to enroll",
    });
  }
};

// GET
const getUserEnrollment = async (req, res) => {
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
    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id bountyId status enrolledAt submittedAt")
        .lean(),
      Enrollment.countDocuments(filter),
    ]);

    res.status(200).json({
      enrollments: enrollments.map((enrollment) => ({
        _id: String(enrollment._id),
        bountyId: String(enrollment.bountyId),
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        submittedAt: enrollment.submittedAt,
      })),
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
    logRequestError(req, "enrollment_list_failed", err);
    if (err.status === 400) {
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Invalid query parameters.",
      });
    }
    res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Failed to fetch enrollments",
    });
  }
};

module.exports = { userEnrollment, getUserEnrollment };
