const mongoose = require("mongoose");

const securityAuditSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, immutable: true },
    severity: {
      type: String,
      enum: ["debug", "info", "warn", "error", "critical"],
      required: true,
      immutable: true,
    },
    environment: { type: String, required: true, immutable: true },
    action: { type: String, required: true, immutable: true },
    outcome: {
      type: String,
      enum: ["attempt", "blocked", "denied", "failure", "success"],
      required: true,
      immutable: true,
    },
    requestId: { type: String, default: null, immutable: true },
    method: { type: String, default: null, immutable: true },
    route: { type: String, default: null, immutable: true },
    actorWallet: { type: String, default: null, immutable: true },
    resourceId: { type: String, default: null, immutable: true },
    policy: { type: String, default: null, immutable: true },
    transactionId: { type: String, default: null, immutable: true },
    chainId: { type: Number, default: null, immutable: true },
    count: { type: Number, default: null, immutable: true },
    errorCode: { type: String, default: null, immutable: true },
    errorName: { type: String, default: null, immutable: true },
    errorType: { type: String, default: null, immutable: true },
  },
  {
    collection: "security_audit",
    strict: "throw",
    versionKey: false,
  },
);

securityAuditSchema.index({ timestamp: -1 });
securityAuditSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model("SecurityAudit", securityAuditSchema);
