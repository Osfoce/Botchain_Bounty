// const bounty = await Bounty.findById(bountyId);
// if (bounty.submissions.count >= bounty.submissions.maxSubmissions) {
//   throw new Error("Submission limit reached");
// }
const mongoose = require("mongoose");
const Bounty = require("../modules/bounty.module");
const Submission = require("../modules/submission.module");

// POST /submission
const submit = async (req, res) => {
  const { bountyId, user, description, projectLink } = req.body;

  // The image URL from Cloudinary is in req.file.path
  const imageUrl = req.file ? req.file.path : "";

  if (!bountyId || !user || !description || !projectLink) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 校验 ObjectId 格式
  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }

  try {
    const wallet = user.toLowerCase();

    // 检查 bounty 是否存在
    const bounty = await Bounty.findById(bountyId);
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
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

    // 创建提交
    const submission = await Submission.create({
      bountyId: bountyId,
      bountyTitle: bounty.title,
      user: user,
      description: description,
      projectLink: projectLink,
      image: imageUrl, // Store the Cloudinary URL
      status: "pending",
      submittedAt: new Date(),
    });

    // bounty
    await Bounty.findByIdAndUpdate(bountyId, {
      $inc: { "submissions.count": 1 },
      // $push: { "submissions.ids": submission._id },
    });

    res.status(201).json({
      message: "Submission created successfully",
      _id: submission._id,
      imageUrl: imageUrl, // Optionally return the URL
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Already submitted to this bounty" });
    }
    console.error("Failed to create submission", err);
    res.status(500).json({
      error: "Failed to create submission",
      detail: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

// GET /submissions/user/:wallet
const getUserSubmission = async (req, res) => {
  const wallet = req.params.wallet.toLowerCase();
  if (!wallet) return res.status(400).json({ message: "User not found" });

  try {
    const submissions = await Submission.find({ user: wallet })
      .sort({ submittedAt: -1 })
      .lean();

    const formatted = submissions.map((sub) => ({
      ...sub,
      _id: sub._id.toString(),
      bountyId: sub.bountyId.toString(),
    }));

    const stats = {
      pending: formatted.filter((s) => s.status === "pending").length,
      accepted: formatted.filter((s) => s.status === "accepted").length,
      rejected: formatted.filter((s) => s.status === "rejected").length,
    };

    res.status(200).json({ submissions: formatted, stats });
  } catch (err) {
    console.error("Failed to fetch submissions", err);
    res.status(500).json({
      error: "Failed to fetch submissions",
      detail: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

const getBountySubmissions = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid bounty id" });
  }

  try {
    const submissions = await Submission.find({ bountyId: id })
      .sort({ submittedAt: -1 })
      .lean();

    const formatted = submissions.map((sub) => ({
      ...sub,
      _id: sub._id.toString(),
      bountyId: sub.bountyId.toString(),
    }));

    return res.status(200).json({ submissions: formatted });
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

module.exports = { submit, getUserSubmission, getBountySubmissions };
