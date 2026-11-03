const getBountyStatus = (bounty) => {
  if (bounty.lifecycleStatus === "completed") return "completed";
  if (bounty.lifecycleStatus === "cancelled") return "cancelled";

  const now = new Date();
  if (new Date(bounty.startDate) > now) return "upcoming";
  if (new Date(bounty.deadline) >= now) return "active";
  return "ended";
};

const serializeBounty = (bounty, { submissionCount, submissions = [] } = {}) => ({
  _id: String(bounty._id),
  id: String(bounty._id),
  title: bounty.title,
  description: bounty.description,
  category: bounty.category,
  tags: bounty.tags || [],
  creator: bounty.creator,
  blockchainId: bounty.blockchainId ?? null,
  bountyContract: bounty.bountyContract ?? null,
  txHash: bounty.txHash ?? null,
  startDate: bounty.startDate,
  deadline: bounty.deadline,
  originLink: bounty.originLink || "",
  network: bounty.network,
  reward:
    bounty.rewardWei == null
      ? bounty.reward
      : formatRewardAmount(bounty.rewardWei, bounty.network),
  token: bounty.token,
  winnersAllowed: bounty.winnersAllowed,
  payoutType: bounty.payoutType,
  percentages: bounty.percentages || [],
  createdAt: bounty.createdAt,
  status: bounty.currentStatus || getBountyStatus(bounty),
  lifecycleStatus: bounty.lifecycleStatus ?? null,
  archived: Boolean(bounty.archivedAt),
  submissions: {
    count:
      submissionCount ??
      bounty.submissions?.count ??
      0,
    maxSubmissions: bounty.submissions?.maxSubmissions ?? 100,
    items: submissions,
  },
});

const serializeSubmission = (submission, { includeWork = false } = {}) => {
  const serialized = {
    _id: String(submission._id),
    bountyId: String(submission.bountyId),
    bountyTitle: submission.bountyTitle,
    user: submission.user,
    submittedAt: submission.submittedAt,
    status: submission.status,
  };

  if (includeWork) {
    serialized.description = submission.description;
    serialized.projectLink = submission.projectLink;
    serialized.image = submission.image || "";
  }

  return serialized;
};

const serializeUser = (user) => ({
  walletAddress: user.walletAddress,
  reputationScore: user.reputationScore,
  totalEarnings: getTotalEarnings(user),
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
  stats: {
    tasksCreated: user.stats?.tasksCreated || 0,
    tasksCompleted: user.stats?.tasksCompleted || 0,
    submissions: {
      pending: user.stats?.submissions?.pending || 0,
      accepted: user.stats?.submissions?.accepted || 0,
      rejected: user.stats?.submissions?.rejected || 0,
    },
  },
});

module.exports = {
  serializeBounty,
  serializeSubmission,
  serializeUser,
};
const {
  formatRewardAmount,
  getTotalEarnings,
} = require("../services/financialAmounts.service");
