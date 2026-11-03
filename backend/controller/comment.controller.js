// controllers/commentController.js
const Comment = require("../modules/comment.module");
const Bounty = require("../modules/bounty.module");
const mongoose = require("mongoose");
const { logRequestError } = require("../utils/requestLogger");

// GET /comments/:bountyId
const getComments = async (req, res) => {
  const { bountyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }

  try {
    const bounty = await Bounty.findById(bountyId)
      .select("_id archivedAt")
      .lean();
    if (!bounty || bounty.archivedAt) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    const comments = await Comment.find({ bountyId })
      .sort({ createdAt: -1 })
      .limit(200)
      .select("_id bountyId user text createdAt")
      .lean();

    return res.status(200).json({ comments });
  } catch (err) {
    logRequestError(req, "comments_list_failed", err);
    return res
      .status(500)
      .json({ code: "INTERNAL_ERROR", error: "Failed to fetch comments" });
  }
};

// POST /comments/:bountyId

const addComment = async (req, res) => {
  const { bountyId } = req.params;
  const { text } = req.body;
  const user = req.auth.walletAddress;

  if (!mongoose.Types.ObjectId.isValid(bountyId)) {
    return res.status(400).json({ error: "Invalid bountyId" });
  }
  if (!text?.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const bounty = await Bounty.findById(bountyId)
      .select("_id archivedAt lifecycleStatus")
      .lean();
    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }
    if (bounty.archivedAt || bounty.lifecycleStatus === "cancelled") {
      return res.status(409).json({ error: "Comments are closed for this bounty" });
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
    logRequestError(req, "comment_create_failed", err);
    return res
      .status(500)
      .json({ code: "INTERNAL_ERROR", error: "Failed to add comment" });
  }
};

module.exports = { getComments, addComment };
