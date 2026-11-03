const mongoose = require("mongoose");

const authNonceSchema = new mongoose.Schema(
  {
    nonceHash: {
      type: String,
      required: true,
      unique: true,
    },
    messageHash: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    chainId: {
      type: Number,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { versionKey: false },
);

authNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AuthNonce", authNonceSchema);
