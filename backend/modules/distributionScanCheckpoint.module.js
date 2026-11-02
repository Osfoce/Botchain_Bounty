const mongoose = require("mongoose");

const distributionScanCheckpointSchema = new mongoose.Schema(
  {
    chainId: { type: Number, required: true },
    bountyContract: { type: String, required: true, lowercase: true },
    nextBlock: { type: String, required: true },
    lastScannedBlock: { type: String, default: null },
    leaseOwner: { type: String, default: null },
    leaseExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

distributionScanCheckpointSchema.index(
  { chainId: 1, bountyContract: 1 },
  { unique: true },
);

const DistributionScanCheckpoint = mongoose.model(
  "DistributionScanCheckpoint",
  distributionScanCheckpointSchema,
);

module.exports = DistributionScanCheckpoint;
