// backend/utils/buildBountyFilter.js
/**
 * Build a MongoDB filter object from the public `/bounty/bounties` query parameters.
 *
 * Supported query keys:
 *   - category: exact match
 *   - tags: comma‑separated list (case‑insensitive, matches any tag)
 *   - status: one of "active", "upcoming", "ended", "completed", "cancelled", "all"
 *
 * All filters implicitly exclude archived bounties (archivedAt: null).
 */
const buildBountyFilter = (query) => {
  const { category, tags, status } = query;
  const filter = { archivedAt: null };

  // ── Category ───────────────────────
  if (category) filter.category = category;

  // ── Tags ───────────────────────────
  if (tags) {
    const tagArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean); // drop empty strings
    if (tagArray.length) filter.tags = { $in: tagArray };
  }

  // ── Status ───────────────────────
  if (status && status !== "all") {
    const now = new Date();
    // Date-based states must exclude terminal lifecycle states. Matching null
    // includes legacy documents where lifecycleStatus is missing.
    switch (status) {
      case "active":
        // Bounty is currently running and has not been completed or cancelled.
        filter.lifecycleStatus = null;
        filter.startDate = { $lte: now };
        filter.deadline = { $gte: now };
        break;

      case "upcoming":
        // Bounty has not started and is not terminal.
        filter.lifecycleStatus = null;
        filter.startDate = { $gt: now };
        break;

      case "ended":
        // Deadline passed, but bounty was not completed or cancelled.
        filter.lifecycleStatus = null;
        filter.deadline = { $lt: now };
        break;

      case "completed":
        filter.lifecycleStatus = "completed";
        break;

      case "cancelled":
        filter.lifecycleStatus = "cancelled";
        break;

      // future‑proof placeholder for multi‑status handling could go here
    }
  }

  return filter;
};

module.exports = buildBountyFilter;
