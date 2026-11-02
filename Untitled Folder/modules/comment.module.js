// modules/comment.module.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    bountyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
      index: true,
    },
    user: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { timestamps: false },
);

// One comment per user per bounty
commentSchema.index({ bountyId: 1, user: 1 }, { unique: true });
// Fast "latest comments for this bounty"
commentSchema.index({ bountyId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);