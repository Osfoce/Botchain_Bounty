const mongoose = require("mongoose");
// Schema for individual claimed rewards
const claimedRewardSchema = new mongoose.Schema(
  {
    bountyId: {
      type: String,
      required: true,
      trim: true,
    },
    bountyTitle: {
      type: String,
      required: true,
      trim: true,
    },
    chainId: { type: Number, default: null },
    token: { type: String, default: null, trim: true, uppercase: true },
    tokenDecimals: { type: Number, default: null, min: 0, max: 255 },
    amountWei: { type: String, required: true },
    amountFormatted: { type: String, default: "0" },
    claimEventKey: { type: String, default: null },
    accountingVersion: { type: String, default: null },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    txHash: { type: String, default: null },
  },
  { _id: false },
); // No separate _id for subdocuments

module.exports = claimedRewardSchema;
