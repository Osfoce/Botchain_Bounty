const mongoose = require("mongoose");

const claimSyncSchema = new mongoose.Schema(
  {
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    bountyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
    },
    winnerAddress: { type: String, required: true, lowercase: true },
    chainId: { type: Number, required: true },
    bountyContract: { type: String, required: true, lowercase: true },
    transactionHash: { type: String, required: true, lowercase: true },
    logIndex: { type: Number, required: true },
    blockNumber: { type: String, required: true },
    blockHash: { type: String, required: true, lowercase: true },
    amount: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "failed", "synced"],
      default: "pending",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    nextRetryAt: { type: Date, default: null },
    leaseOwner: { type: String, default: null },
    leaseExpiresAt: { type: Date, default: null },
    syncedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

claimSyncSchema.index(
  { chainId: 1, bountyContract: 1, transactionHash: 1, logIndex: 1 },
  { unique: true },
);
claimSyncSchema.index({ rewardId: 1 }, { unique: true });

module.exports = mongoose.model("ClaimSync", claimSyncSchema);
