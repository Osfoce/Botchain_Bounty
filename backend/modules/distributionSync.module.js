const mongoose = require("mongoose");

const distributionSyncSchema = new mongoose.Schema(
  {
    bountyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
      index: true,
    },
    blockchainId: { type: String, required: true },
    chainId: { type: Number, required: true },
    bountyContract: { type: String, required: true, lowercase: true },
    transactionHash: { type: String, required: true, lowercase: true },
    logIndex: { type: Number, required: true },
    blockNumber: { type: String, required: true },
    blockHash: { type: String, required: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "processing", "synced", "failed"],
      default: "pending",
      index: true,
    },
    winnerAddresses: { type: [String], default: [] },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    nextRetryAt: { type: Date, default: null },
    leaseOwner: { type: String, default: null },
    leaseExpiresAt: { type: Date, default: null },
    syncedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

distributionSyncSchema.index(
  {
    chainId: 1,
    bountyContract: 1,
    transactionHash: 1,
    logIndex: 1,
  },
  { unique: true },
);

distributionSyncSchema.index(
  { chainId: 1, bountyContract: 1, blockchainId: 1 },
  { unique: true },
);

const DistributionSync = mongoose.model(
  "DistributionSync",
  distributionSyncSchema,
);

module.exports = DistributionSync;
