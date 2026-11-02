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
    amountWei: { type: String, required: true },
    amountFormatted: { type: String, default: "0" },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    txHash: { type: String, default: null },
  },
  { _id: false },
); // No separate _id for subdocuments

module.exports = claimedRewardSchema;
