const mongoose = require("mongoose");
const SecurityAudit = require("../modules/securityAudit.module");
const { logSecurityEvent } = require("../utils/requestLogger");

const createSecurityAuditWriter = ({ create, isReady, logger }) =>
  async (details) => {
    const record = logger(details);

    if (!isReady()) {
      logger({
        req: details.req,
        event: "security_audit_persist_unavailable",
        severity: "error",
        outcome: "failure",
        errorCode: "DATABASE_NOT_READY",
      });
      return false;
    }

    try {
      await create(record);
      return true;
    } catch (error) {
      logger({
        req: details.req,
        event: "security_audit_persist_failed",
        severity: "error",
        outcome: "failure",
        errorCode: error?.code,
        errorName: error?.name || "Error",
      });
      return false;
    }
  };

const recordSecurityAudit = createSecurityAuditWriter({
  create: (record) =>
    process.env.NODE_ENV === "test"
      ? Promise.resolve(record)
      : SecurityAudit.create(record),
  isReady: () =>
    process.env.NODE_ENV === "test" || mongoose.connection.readyState === 1,
  logger: logSecurityEvent,
});

module.exports = { createSecurityAuditWriter, recordSecurityAudit };
