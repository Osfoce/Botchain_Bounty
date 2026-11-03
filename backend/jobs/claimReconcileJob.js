const cron = require("node-cron");
const { reconcilePendingClaims } = require("../services/claimSync.service");
const { getSafeErrorCode, logSecurityEvent } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");

let runInProgress = false;

const runClaimReconciliation = async () => {
  if (runInProgress) return;
  runInProgress = true;
  logSecurityEvent({
    event: "claim_reconciliation_run_started",
    severity: "info",
    outcome: "attempt",
  });
  try {
    await reconcilePendingClaims();
    logSecurityEvent({
      event: "claim_reconciliation_run_completed",
      severity: "info",
      outcome: "success",
    });
  } finally {
    runInProgress = false;
  }
};

const startClaimReconcileJob = () => {
  if (process.env.CLAIM_SYNC_ENABLED === "false") {
    logSecurityEvent({
      event: "claim_reconciliation_disabled",
      severity: "warn",
      outcome: "blocked",
    });
    return;
  }

  cron.schedule("*/2 * * * *", () => {
    runClaimReconciliation().catch((error) => {
      recordSecurityAudit({
        event: "reconciliation_failed",
        severity: "error",
        outcome: "failure",
        errorCode: getSafeErrorCode(error, "RECONCILIATION_FAILED"),
      });
    });
  });
  runClaimReconciliation().catch((error) => {
    recordSecurityAudit({
      event: "reconciliation_failed",
      severity: "error",
      outcome: "failure",
      errorCode: getSafeErrorCode(error, "RECONCILIATION_FAILED"),
    });
  });
  logSecurityEvent({
    event: "claim_reconciliation_scheduled",
    severity: "info",
    outcome: "success",
  });
};

module.exports = { runClaimReconciliation, startClaimReconcileJob };
