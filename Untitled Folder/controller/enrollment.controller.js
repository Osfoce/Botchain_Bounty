const mongoose = require("mongoose");
const Enrollment = require("../modules/enrollment.module");
const Bounty = require("../modules/bounty.module");

// POST /enroll
const userEnrollment = async (req, res) => {
  const { bountyId, user } = req.body;

  if (!bountyId || !user) {
    return res.status(400).json({ error: "Missing bountyId or user" });
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
    console.error("Enrollment error:", err);
    res.status(500).json({ error: "Failed to enroll" });
  }
};

// GET
const getUserEnrollment = async (req, res) => {
  const { wallet } = req.params;

  if (!wallet) {
    return res.status(400).json({ error: "Missing wallet" });
  }

  try {
    const enrollments = await Enrollment.find({ user: wallet }).lean();

    const formatted = enrollments.map((e) => ({
      ...e,
      _id: e._id.toString(),
      bountyId: e.bountyId.toString(),
    }));

    res.status(200).json({ enrollments: formatted });
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

module.exports = { userEnrollment, getUserEnrollment };
