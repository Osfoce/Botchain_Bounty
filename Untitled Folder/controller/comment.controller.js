// controllers/commentController.js
const Comment = require("../modules/comment.module");
const Bounty = require("../modules/bounty.module");
const mongoose = require("mongoose");

// GET /comments/:bountyId
const getComments = async (req, res) => {
  const { bountyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }

  try {
    const comments = await Comment.find({ bountyId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.status(200).json({ comments });
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// POST /comments/:bountyId

const addComment = async (req, res) => {
  const { bountyId } = req.params;
  const { user, text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }
  if (!user || !text?.trim()) {
    return res.status(400).json({ error: "user and text are required" });
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(user)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  try {
    const bounty = await Bounty.findById(bountyId).select("_id").lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const comment = await Comment.create({
      bountyId,
      user: user.toLowerCase(),
      text: text.trim(),
    });

    return res.status(201).json({ comment });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "You already commented on this bounty" });
    }
    console.error("Comment error:", err);
    return res.status(500).json({ error: "Failed to add comment" });
  }
};

module.exports = { getComments, addComment };
