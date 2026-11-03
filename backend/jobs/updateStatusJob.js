// cron jobs
// jobs/updateStatusJob.js
const cron = require("node-cron");
const { updateBountyStatuses } = require("../utils/bountyUtils");
const { logSecurityEvent } = require("../utils/requestLogger");

function startStatusUpdateJob() {
  cron.schedule("0 * * * *", async () => {
    logSecurityEvent({
      event: "bounty_status_update_started",
      severity: "info",
      outcome: "attempt",
    });
    await updateBountyStatuses();
  });
  logSecurityEvent({
    event: "bounty_status_update_scheduled",
    severity: "info",
    outcome: "success",
  });
}

module.exports = startStatusUpdateJob;
