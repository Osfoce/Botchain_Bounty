const mongoose = require("mongoose");

const userDataRequestSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "completed", "rejected"],
      default: "pending",
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    reviewedBy: {
      type: String,
      default: null,
      lowercase: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: String,
      default: null,
      maxlength: 2000,
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

userDataRequestSchema.index(
  { walletAddress: 1 },
  {
    unique: true,
    partialFilterExpression: { active: true },
  },
);
userDataRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("UserDataRequest", userDataRequestSchema);
