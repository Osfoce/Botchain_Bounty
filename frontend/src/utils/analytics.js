export const hasAnalyticsContent = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const numericSections = [
    payload.overview,
    payload.submissions,
    payload.rewards,
    payload.bountyStatus,
  ].filter((section) => section && typeof section === "object");
  const hasPositiveMetric = numericSections.some((section) =>
    Object.values(section).some(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
    ),
  );
  const hasRecentActivity =
    Array.isArray(payload.recentActivity) && payload.recentActivity.length > 0;
  const hasCategories =
    Array.isArray(payload.categories) &&
    payload.categories.some((category) => Number(category.count) > 0);
  const hasMonthlyActivity =
    Array.isArray(payload.monthlyActivity) &&
    payload.monthlyActivity.some((month) =>
      [month.bounties, month.submissions, month.rewards].some(
        (value) => Number(value) > 0,
      ),
    );
  const hasPersonalRoleActivity = [payload.creator, payload.contributor].some(
    (roleData) => roleData && hasAnalyticsContent(roleData),
  );

  return (
    hasPositiveMetric ||
    hasRecentActivity ||
    hasCategories ||
    hasMonthlyActivity ||
    hasPersonalRoleActivity
  );
};

export const getAnalyticsErrorMessage = (error) => {
  if (error?.response) {
    return "We couldn’t load your analytics. Please try again.";
  }
  if (error?.code === "ERR_NETWORK") {
    return "We couldn’t connect to analytics. Check your connection and try again.";
  }
  return "We couldn’t load your analytics. Please try again.";
};
