// cron jobs
// jobs/updateStatusJob.js
const cron = require("node-cron");
const { updateBountyStatuses } = require("../utils/bountyUtils");

function startStatusUpdateJob() {
  // Run every hour (at minute 0)
  cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled bounty status update...");
    await updateBountyStatuses();
  });
  console.log("Status update cron job scheduled (every hour)");
}

module.exports = startStatusUpdateJob;
