// utils/bountyUtils.js
const { getDb } = require("../config/db");

function calculateBountyStatus(bounty) {
  if (bounty.lifecycleStatus === "cancelled") return "cancelled";
  if (bounty.lifecycleStatus === "completed") return "completed";
  const now = Date.now();
  if (now < bounty.startDate) return "upcoming";
  if (now <= bounty.deadline) return "active";
  return "ended";
}

async function updateBountyStatuses() {
  try {
    const db = getDb();
    const bounties = await db.collection("bounty").find({}).toArray();
    let updatedCount = 0;

    for (const bounty of bounties) {
      const newStatus = calculateBountyStatus(bounty);
      if (bounty.status !== newStatus) {
        await db
          .collection("bounty")
          .updateOne({ _id: bounty._id }, { $set: { status: newStatus } });
        updatedCount++;
      }
    }
    console.log(
      `[Status Update] Updated ${updatedCount} bounties at ${new Date().toISOString()}`,
    );
  } catch (err) {
    console.error("Error updating bounty statuses:", err);
  }
}

module.exports = { calculateBountyStatus, updateBountyStatuses };
