const mongoose = require("mongoose");

const apiRateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    hits: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false, collection: "apiRateLimits" },
);

module.exports =
  mongoose.models.ApiRateLimit ||
  mongoose.model("ApiRateLimit", apiRateLimitSchema);
