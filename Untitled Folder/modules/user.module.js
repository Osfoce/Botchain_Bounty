const mongoose = require("mongoose");
const claimedRewardSchema = require("./claimReward.module");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // Basic Ethereum address validation (0x + 40 hex chars)
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid Ethereum wallet address!`,
      },
    },
    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Can't be changed after creation
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    stats: {
      tasksCreated: {
        type: Number,
        default: 0,
        min: 0,
      },
      tasksCompleted: {
        type: Number,
        default: 0,
        min: 0,
      },
      submissions: {
        pending: {
          type: Number,
          default: 0,
          min: 0,
        },
        accepted: {
          type: Number,
          default: 0,
          min: 0,
        },
        rejected: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    },
    claimedRewards: {
      type: [claimedRewardSchema],
      default: [],
    },
  },
  {
    timestamps: false, // We're using custom createdAt and lastLogin
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual property: total claimed rewards amount
userSchema.virtual("totalClaimedRewards").get(function () {
  if (!this.claimedRewards || this.claimedRewards.length === 0) return 0;
  return this.claimedRewards.reduce((sum, reward) => sum + reward.amount, 0);
});

// Virtual property: submission success rate
userSchema.virtual("submissionSuccessRate").get(function () {
  const total =
    this.stats.submissions.accepted + this.stats.submissions.rejected;
  if (total === 0) return 0;
  return (this.stats.submissions.accepted / total) * 100;
});

// Indexes for better query performance
// userSchema.index({ walletAddress: 1 }, { unique: true });
userSchema.index({ reputationScore: -1 }); // For leaderboards
userSchema.index({ "claimedRewards.bountyId": 1 }); // For finding users who claimed specific bounties
userSchema.index({ lastLogin: -1 }); // For filtering active/inactive users

// Middleware: Update lastLogin on findOneAndUpdate operations
userSchema.pre("findOneAndUpdate", function () {
  this.set({ lastLogin: Date.now() });
  // next();
});

// Instance method: Add a claimed reward "user.add..."
userSchema.methods.addClaimedReward = function (bountyId, bountyTitle, amount) {
  this.claimedRewards.push({
    bountyId,
    bountyTitle,
    amount,
    claimedAt: new Date(),
  });
  return this.save();
};

// Static method: Find user by wallet address (case-insensitive) "User.find..."
userSchema.statics.findByWalletAddress = function (walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

// Static method: Get top users by reputation "User.get..."
userSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find({})
    .sort({ reputationScore: -1 })
    .limit(limit)
    .select("walletAddress reputationScore totalEarnings stats");
};

const User = mongoose.model("User", userSchema);

module.exports = User;
