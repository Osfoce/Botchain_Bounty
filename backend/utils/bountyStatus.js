// backend/utils/bountyStatus.js
/**
 * Return one of: "active", "ended", "completed", "cancelled", "upcoming"
 * Mirrors the logic from analytics.controller#getBountyStatus.
 */
const getBountyStatus = (bounty, now = new Date()) => {
  if (bounty.lifecycleStatus === "completed") return "completed";
  if (bounty.lifecycleStatus === "cancelled") return "cancelled";
  if (new Date(bounty.startDate) > now) return "upcoming";
  if (new Date(bounty.deadline) >= now) return "active";
  return "ended";
};

module.exports = getBountyStatus;
