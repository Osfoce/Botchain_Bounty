const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const Submission = require("../modules/submission.module");
const { formatEther } = require("viem");

const WALLET_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const MONTHS_TO_SHOW = 6;
const RECENT_ACTIVITY_LIMIT = 8;

const getSubmissionCounts = (submissions) =>
  submissions.reduce(
    (counts, submission) => {
      const status = String(submission.status || "").toLowerCase();
      if (Object.hasOwn(counts, status)) counts[status] += 1;
      return counts;
    },
    { accepted: 0, pending: 0, rejected: 0 },
  );

const getBountyStatus = (bounty, now) => {
  if (bounty.lifecycleStatus === "completed") return "completed";
  if (bounty.lifecycleStatus === "cancelled") return "cancelled";
  if (new Date(bounty.startDate) > now) return "upcoming";
  if (new Date(bounty.deadline) >= now) return "active";
  return "ended";
};

const getRewardAmount = (reward) => {
  try {
    return Number(formatEther(BigInt(reward.amount)));
  } catch (error) {
    throw new Error(`Invalid stored reward amount for reward ${reward._id}`, {
      cause: error,
    });
  }
};

const makeMonthKey = (date) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return `${parsedDate.getUTCFullYear()}-${String(
    parsedDate.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
};

const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const makeMonthlyActivity = (bounties, submissions, rewards, now) => {
  const months = new Map();
  for (let offset = MONTHS_TO_SHOW - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    const key = makeMonthKey(date);
    months.set(key, {
      month: getMonthLabel(key),
      bounties: 0,
      submissions: 0,
      rewards: 0,
    });
  }

  const increment = (items, dateField, counter) => {
    for (const item of items) {
      const month = months.get(makeMonthKey(item[dateField]));
      if (month) month[counter] += 1;
    }
  };
  increment(bounties, "createdAt", "bounties");
  increment(submissions, "submittedAt", "submissions");
  increment(rewards, "assignedAt", "rewards");

  return [...months.values()];
};

const countCategories = (bounties, submissions, bySubmission) => {
  const bountyCategories = new Map(
    bounties.map((bounty) => [String(bounty._id), bounty.category || "Other"]),
  );
  const counts = new Map();

  if (bySubmission) {
    for (const submission of submissions) {
      const category =
        bountyCategories.get(String(submission.bountyId)) || "Other";
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  } else {
    for (const bounty of bounties) {
      const category = bounty.category || "Other";
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

const makeRecentActivity = (submissions, rewards) => [
  ...submissions.map((submission) => ({
    id: String(submission._id),
    title: `Submission: ${submission.bountyTitle}`,
    type: "submission",
    date: submission.submittedAt,
    status: submission.status,
  })),
  ...rewards.map((reward) => ({
    id: String(reward._id),
    title: `Reward: ${reward.bountyTitle}`,
    type: "reward",
    date: reward.claimedAt || reward.assignedAt,
    status: reward.status,
    amount: getRewardAmount(reward),
  })),
]
  .sort((left, right) => new Date(right.date) - new Date(left.date))
  .slice(0, RECENT_ACTIVITY_LIMIT);

const makePersonalResponse = ({
  role,
  bounties,
  submissions,
  rewards,
  now,
}) => {
  const submissionCounts = getSubmissionCounts(submissions);
  const totalSubmissions = submissions.length;
  const reviewedSubmissions =
    submissionCounts.accepted + submissionCounts.rejected;
  const claimedRewards = rewards.filter((reward) => reward.status === "claimed");
  const assignedRewards = rewards.filter((reward) =>
    ["assigned", "claimed"].includes(reward.status),
  );
  const claimedAmount = claimedRewards.reduce(
    (total, reward) => total + getRewardAmount(reward),
    0,
  );
  const bountyStatuses = bounties.reduce((counts, bounty) => {
    const status = getBountyStatus(bounty, now);
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const totalRewardBudget = bounties.reduce(
    (total, bounty) => total + (Number(bounty.reward) || 0),
    0,
  );
  const isCreator = role === "creator";

  return {
    overview: {
      bountiesCreated: isCreator ? bounties.length : 0,
      activeBounties: bountyStatuses.active || 0,
      totalContributions: isCreator ? 0 : totalSubmissions,
      totalSubmissions,
      totalRewardBudget,
      totalRewardsClaimed: claimedAmount,
      claimedAmount,
      successRate:
        reviewedSubmissions > 0
          ? (submissionCounts.accepted / reviewedSubmissions) * 100
          : 0,
    },
    submissions: submissionCounts,
    rewards: {
      assigned: assignedRewards.length,
      claimed: claimedRewards.length,
    },
    recentActivity: makeRecentActivity(submissions, rewards),
    categories: countCategories(bounties, submissions, !isCreator),
    monthlyActivity: makeMonthlyActivity(
      isCreator ? bounties : [],
      submissions,
      rewards,
      now,
    ),
    bountyStatus: bountyStatuses,
  };
};

const makePlatformResponse = async (now) => {
  const sixMonthsAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_TO_SHOW - 1), 1),
  );
  const bountyStatusExpression = {
    $switch: {
      branches: [
        { case: { $eq: ["$lifecycleStatus", "completed"] }, then: "completed" },
        { case: { $eq: ["$lifecycleStatus", "cancelled"] }, then: "cancelled" },
        { case: { $gt: ["$startDate", now] }, then: "upcoming" },
        { case: { $gte: ["$deadline", now] }, then: "active" },
      ],
      default: "ended",
    },
  };

  const [
    bountySummary,
    bountyStatuses,
    categories,
    bountyMonths,
    submissionStatuses,
    submissionMonths,
    rewardSummary,
    rewardMonths,
    uniqueContributors,
    recentSubmissions,
    recentRewards,
  ] = await Promise.all([
    Bounty.aggregate([
      {
        $group: {
          _id: null,
          totalBounties: { $sum: 1 },
          activeBounties: {
            $sum: {
              $cond: [{ $eq: [bountyStatusExpression, "active"] }, 1, 0],
            },
          },
          uniqueCreators: { $addToSet: "$creator" },
          totalRewardBudget: { $sum: "$reward" },
        },
      },
    ]),
    Bounty.aggregate([
      { $project: { status: bountyStatusExpression } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Bounty.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Bounty.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Submission.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Submission.aggregate([
      { $match: { submittedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$submittedAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Reward.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    Reward.aggregate([
      { $match: { assignedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$assignedAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    Submission.aggregate([
      { $group: { _id: "$user" } },
      { $count: "count" },
    ]),
    Submission.find({})
      .sort({ submittedAt: -1 })
      .limit(RECENT_ACTIVITY_LIMIT)
      .select("bountyTitle submittedAt status")
      .lean(),
    Reward.find({})
      .sort({ assignedAt: -1 })
      .limit(RECENT_ACTIVITY_LIMIT)
      .select("bountyTitle assignedAt claimedAt status amount")
      .lean(),
  ]);

  const bountyTotals = bountySummary[0] || {
    totalBounties: 0,
    activeBounties: 0,
    uniqueCreators: [],
    totalRewardBudget: 0,
  };
  const submissions = { accepted: 0, pending: 0, rejected: 0 };
  for (const entry of submissionStatuses) {
    if (Object.hasOwn(submissions, entry._id)) submissions[entry._id] = entry.count;
  }
  const totalSubmissions = Object.values(submissions).reduce(
    (total, count) => total + count,
    0,
  );
  const rewardCounts = { assigned: 0, claimed: 0 };
  for (const entry of rewardSummary) {
    if (Object.hasOwn(rewardCounts, entry._id)) {
      rewardCounts[entry._id] = entry.count;
    }
  }
  rewardCounts.assigned += rewardCounts.claimed;

  const monthlyActivity = makeMonthlyActivity([], [], [], now);
  const monthMap = new Map(
    monthlyActivity.map((item, index) => {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_TO_SHOW - 1 - index), 1),
      );
      return [makeMonthKey(date), item];
    }),
  );
  for (const [entries, key] of [
    [bountyMonths, "bounties"],
    [submissionMonths, "submissions"],
    [rewardMonths, "rewards"],
  ]) {
    for (const entry of entries) {
      const month = monthMap.get(entry._id);
      if (month) month[key] = entry.count;
    }
  }

  return {
    overview: {
      totalBounties: bountyTotals.totalBounties,
      activeBounties: bountyTotals.activeBounties,
      uniqueContributors: uniqueContributors[0]?.count || 0,
      uniqueCreators: bountyTotals.uniqueCreators.length,
      totalSubmissions,
      totalRewardBudget: bountyTotals.totalRewardBudget,
      successRate:
        submissions.accepted + submissions.rejected > 0
          ? (submissions.accepted /
              (submissions.accepted + submissions.rejected)) *
            100
          : 0,
    },
    submissions,
    rewards: rewardCounts,
    bountyStatus: Object.fromEntries(
      bountyStatuses.map((entry) => [entry._id, entry.count]),
    ),
    categories: categories.map((entry) => ({
      name: entry._id || "Other",
      count: entry.count,
    })),
    monthlyActivity,
    recentActivity: makeRecentActivity(recentSubmissions, recentRewards),
  };
};

const getContributorAnalytics = async (wallet, now) => {
  const [submissions, rewards] = await Promise.all([
    Submission.find({ user: wallet })
      .sort({ submittedAt: -1 })
      .select("bountyId bountyTitle submittedAt status")
      .lean(),
    Reward.find({ winnerAddress: wallet })
      .sort({ assignedAt: -1 })
      .select("bountyId bountyTitle assignedAt claimedAt status amount")
      .lean(),
  ]);
  const bountyIds = [
    ...new Set([
      ...submissions.map((submission) => String(submission.bountyId)),
      ...rewards.map((reward) => String(reward.bountyId)),
    ]),
  ];
  const bounties = bountyIds.length
    ? await Bounty.find({ _id: { $in: bountyIds } })
        .select("category reward createdAt startDate deadline lifecycleStatus")
        .lean()
    : [];
  return makePersonalResponse({
    role: "contributor",
    bounties,
    submissions,
    rewards,
    now,
  });
};

const getCreatorAnalytics = async (wallet, now) => {
  const bounties = await Bounty.find({
    creator: { $regex: `^${wallet}$`, $options: "i" },
  })
    .select("category reward createdAt startDate deadline lifecycleStatus")
    .lean();
  const bountyIds = bounties.map((bounty) => bounty._id);
  const [submissions, rewards] = bountyIds.length
    ? await Promise.all([
        Submission.find({ bountyId: { $in: bountyIds } })
          .sort({ submittedAt: -1 })
          .select("bountyId bountyTitle submittedAt status")
          .lean(),
        Reward.find({ bountyId: { $in: bountyIds } })
          .sort({ assignedAt: -1 })
          .select("bountyId bountyTitle assignedAt claimedAt status amount")
          .lean(),
      ])
    : [[], []];

  return makePersonalResponse({
    role: "creator",
    bounties,
    submissions,
    rewards,
    now,
  });
};

const getPlatformAnalytics = async (req, res) => {
  try {
    const result = await makePlatformResponse(new Date());
    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch platform analytics:", error);
    return res.status(500).json({ message: "Failed to fetch platform analytics" });
  }
};

const getWalletAnalytics = async (req, res) => {
  const { role, wallet } = req.params;
  if (!["creator", "contributor"].includes(role)) {
    return res.status(400).json({ message: "Unsupported analytics role" });
  }
  if (!WALLET_PATTERN.test(wallet)) {
    return res.status(400).json({ message: "Invalid wallet address" });
  }

  try {
    const normalizedWallet = wallet.toLowerCase();
    const now = new Date();
    const result =
      role === "creator"
        ? await getCreatorAnalytics(normalizedWallet, now)
        : await getContributorAnalytics(normalizedWallet, now);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Failed to fetch ${role} analytics:`, error);
    return res.status(500).json({ message: "Failed to fetch wallet analytics" });
  }
};

module.exports = { getPlatformAnalytics, getWalletAnalytics };
