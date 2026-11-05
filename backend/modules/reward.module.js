// modules/reward.module.js
const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    bountyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
      index: true,
    },
    bountyTitle: { type: String, required: true, trim: true },
    blockchainId: { type: Number, required: true }, // on-chain bounty id
    chainId: { type: String, required: true },
    token: { type: String, required: true, trim: true, uppercase: true },
    tokenDecimals: { type: Number, required: true, min: 0, max: 255 },
    bountyContract: { type: String, required: true, lowercase: true },

    winnerAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    amount: { type: String, required: true }, // store wei as string, never float
    amountFormatted: { type: String }, // cached human-readable

    status: {
      type: String,
      enum: ["assigned", "claimed"],
      default: "assigned",
      index: true,
    },

    distributionTxHash: { type: String, required: true, lowercase: true },
    assignedAt: { type: Date, default: Date.now },

    claimedAt: { type: Date, default: null },
    claimTxHash: { type: String, default: null, lowercase: true },
    claimLogIndex: { type: Number, default: null },
    claimBlockNumber: { type: String, default: null },
    claimBlockHash: { type: String, default: null },
  },
  { timestamps: true },
);

// One row per (bounty, winner). Prevents dup assignments & dup claims.
rewardSchema.index({ bountyId: 1, winnerAddress: 1 }, { unique: true });

// Fast "unclaimed rewards for this wallet" queries
rewardSchema.index({ winnerAddress: 1, status: 1 });
rewardSchema.index(
  { chainId: 1, bountyContract: 1, claimTxHash: 1, claimLogIndex: 1 },
  {
    unique: true,
    partialFilterExpression: {
      claimTxHash: { $type: "string" },
      claimLogIndex: { $type: "number" },
    },
  },
);

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
