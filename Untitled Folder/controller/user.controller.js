const { calculateBountyStatus } = require("../utils/bountyUtils");
const User = require("../modules/user.module");
const Bounty = require("../modules/bounty.module");
const Submission = require("../modules/submission.module");
const Enrollment = require("../modules/enrollment.module");

const getOrCreateUserProfile = async (req, res) => {
  const wallet = req.params.wallet.toLowerCase();

  try {
    let user = await User.findOne({ walletAddress: wallet });

    if (!user) {
      user = await User.create({ walletAddress: wallet });
    } else {
      user = await User.findOneAndUpdate(
        { walletAddress: wallet },
        { $set: { lastLogin: new Date() } },
        { new: true },
      );
    }

    const [createdBounties, submissions] = await Promise.all([
      Bounty.find({ creator: wallet }),
      Submission.find({ user: wallet }),
    ]);

    res.status(200).json({ user, createdBounties, submissions });
  } catch (err) {
    console.error("Failed to fetch user", err);
    res.status(500).json({ error: "Failed to fetch user", err: err.message });
  }
};

const getUserDashboard = async (req, res) => {
  const wallet = req.params.wallet.toLowerCase();
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      {
        $set: { lastLogin: new Date() },
        $setOnInsert: { walletAddress: wallet },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const [createdBounties, submissions, enrollments] = await Promise.all([
      Bounty.find({ creator: wallet }),
      Submission.find({ user: wallet }),
      Enrollment.find({ user: wallet }),
    ]);

    const statuses = createdBounties.map((b) => calculateBountyStatus(b));
    const bountyStats = {
      active: statuses.filter((s) => s === "active").length,
      upcoming: statuses.filter((s) => s === "upcoming").length,
      completed: statuses.filter((s) => s === "completed").length,
      cancelled: statuses.filter((s) => s === "cancelled").length,
      ended: statuses.filter((s) => s === "ended").length,
      total: createdBounties.length,
    };

    const submissionStats = {
      pending: submissions.filter((s) => s.status === "pending").length,
      accepted: submissions.filter((s) => s.status === "accepted").length,
      rejected: submissions.filter((s) => s.status === "rejected").length,
      total: submissions.length,
    };
    const totalEarnings = user.totalEarnings || 0;

    res.status(200).json({
      user: {
        walletAddress: wallet,
        reputationScore: user.reputationScore || 0,
        totalEarnings: totalEarnings.toString(),
        tasksCompleted: user.stats?.tasksCompleted || 0,
      },
      bounties: bountyStats,
      submissions: submissionStats,
      enrolledBountyIds: enrollments.map((e) => String(e.bountyId)),

      // rewards: (user.claimedRewards || [])
      //   .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
      //   .slice(0, 20) // cap at 20 for the dashboard
      //   .map((r) => ({
      //     bountyId: r.bountyId,
      //     bountyTitle: r.bountyTitle,
      //     amount: r.amount,
      //     amountFormatted: r.amountFormatted,
      //     claimedAt: r.claimedAt,
      //   })),
    });
  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
    res.status(500).json({
      error: "Failed to fetch dashboard stats",
      detail: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

module.exports = { getOrCreateUserProfile, getUserDashboard };
