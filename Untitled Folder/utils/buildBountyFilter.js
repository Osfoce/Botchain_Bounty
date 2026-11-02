const buildBountyFilter = (query) => {
  const { category, tags, status } = query;

  const filter = {};
  if (category) filter.category = category;

  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());

    filter.tags = {
      $in: tagArray,
    };
  }

  if (status && status !== "all") {
    const now = new Date();

    switch (status) {
      case "active":
        filter.lifecycleStatus = null;

        filter.startDate = {
          $lte: now,
        };

        filter.deadline = {
          $gte: now,
        };

        break;

      case "upcoming":
        filter.lifecycleStatus = null;

        filter.startDate = {
          $gt: now,
        };

        break;

      case "ended":
        filter.lifecycleStatus = null;

        filter.deadline = {
          $lt: now,
        };

        break;

      case "completed":
        filter.lifecycleStatus = "completed";

        break;

      case "cancelled":
        filter.lifecycleStatus = "cancelled";

        break;
    }
  }

  return filter;
};

module.exports = buildBountyFilter;
