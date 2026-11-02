const mongoose = require("mongoose");
const validator = require("validator");
// Schema for submissions subdocument
const submissionSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxSubmissions: {
      type: Number,
      default: 100,
      min: 1,
    },
    // ids: {
    //   type: [String], // Array of submission IDs
    //   default: []
    // },
  },
  { _id: false },
);

// Schema for winners subdocument
const winnersSchema = new mongoose.Schema(
  {
    assigned: {
      type: [String], // Array of wallet addresses
      default: [],
    },
    // claimed: {
    //   type: [String], // Array of wallet addresses
    //   default: [],
    // },
  },
  { _id: false },
);

// Main Bounty Schema
const bountySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (v) => v.length <= 5,
          message: "Cannot have more than 5 tags",
        },
        {
          validator: (v) =>
            v.every((tag) => typeof tag === "string" && tag.trim().length > 0),
          message: "Tags cannot be empty",
        },
        {
          validator: (v) => {
            const normalized = v.map((t) => t.trim().toLowerCase());
            return new Set(normalized).size === normalized.length;
          },
          message: "Duplicate tags are not allowed",
        },
      ],
    },
    // The backend extracts the creators address
    creator: {
      type: String,
      required: [true, "Creator wallet address is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid Ethereum wallet address!`,
      },
    },
    blockchainId: {
      type: Number,
      default: null,
      index: true,
    },
    bountyContract: {
      type: String,
      required: false, // will be required for on-chain bounties
      trim: true,
      validate: {
        validator: (v) => !v || /^0x[a-fA-F0-9]{40}$/.test(v),
        message: (props) => `${props.value} is not a valid contract address`,
      },
    },
    txHash: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator: (v) => !v || /^0x[a-fA-F0-9]{64}$/.test(v),
        message: (props) => `${props.value} is not a valid transaction hash`,
      },
    },
    isOnChain: {
      type: Boolean,
      default: false,
    },
    rewardsAssignedOnChain: {
      type: Boolean,
      default: false,
    },
    lifecycleStatus: {
      type: String,
      enum: ["completed", "cancelled"],
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Can't be changed after creation
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (v) {
          return v < this.deadline;
        },
        message: "Start date must be before deadline",
      },
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
      validate: {
        validator: function (v) {
          return v > this.startDate;
        },
        message: "Deadline must be after start date",
      },
    },
    originLink: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Invalid URL format",
      },
    },
    network: {
      type: String,
      required: [true, "Network is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["5042002", "5042", "968"],
        message: "{VALUE} is not a supported network",
      },
    },
    reward: {
      type: Number,
      required: [true, "Reward is required"],
      min: [0, "Reward cannot be negative"],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      trim: true,
      uppercase: true,
      enum: {
        values: ["USDC", "BOT"],
        message: "{VALUE} is not a supported token",
      },
    },
    winnersAllowed: {
      type: Number,
      default: 1,
      min: [1, "At least 1 winner allowed"],
      max: [5, "Cannot have more than 5 winners"],
    },
    payoutType: {
      type: String,
      required: [true, "Payout type is required"],
      enum: {
        values: ["SINGLE", "MULTI_EQUAL", "MULTI_PERCENTAGE"],
        message: "{VALUE} is not a valid payout type",
      },
      default: "SINGLE",
    },
    percentages: {
      type: [Number],
      default: [],
      validate: {
        validator: function (v) {
          if (this.payoutType === "MULTI_PERCENTAGE") {
            if (v.length !== this.winnersAllowed) {
              return false;
            }
            // Sum should be 100
            const sum = v.reduce((acc, val) => acc + val, 0);
            return Math.abs(sum - 100) < 0.01;
          }
          return true; // Not percentage type, skip validation
        },
        message: "Percentages must sum to 100 and match winnersAllowed count",
      },
    },
    submissions: {
      type: submissionSchema,
      default: () => ({}),
    },
    winners: {
      type: winnersSchema,
      default: () => ({}),
    },
    distributionTxHash: { type: String, default: null },
    distributedAt: { type: Date, default: null },
    assignedCount: { type: Number, default: 0 },
  },
  {
    timestamps: false, // We're using custom createdAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// virtual property: dynamically get bounty current status
bountySchema.virtual("currentStatus").get(function () {
  // Manual terminal states always win
  if (this.lifecycleStatus === "completed") {
    return "completed";
  }

  if (this.lifecycleStatus === "cancelled") {
    return "cancelled";
  }

  const now = new Date();

  if (now < this.startDate) {
    return "upcoming";
  }

  if (now <= this.deadline) {
    return "active";
  }

  return "ended";
});

// Virtual property: Check if bounty is active
bountySchema.virtual("isActive").get(function () {
  return this.currentStatus === "active";
});

// Virtual property: Check if bounty is expired
bountySchema.virtual("isExpired").get(function () {
  return this.currentStatus === "ended";
});

// Virtual property: Time remaining until deadline (in days)
bountySchema.virtual("daysRemaining").get(function () {
  if (this.currentStatus === "ended") {
    return 0;
  }

  const now = new Date();
  const diff = this.deadline - now;

  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
});

// Virtual property: Submission fill percentage
bountySchema.virtual("submissionFillPercentage").get(function () {
  if (!this.submissions || this.submissions.maxSubmissions === 0) return 0;
  return (this.submissions.count / this.submissions.maxSubmissions) * 100;
});

// Indexes for performance
bountySchema.index({ status: 1, startDate: 1, deadline: 1 }); // For filtering active bounties
bountySchema.index({ creator: 1 }); // For finding bounties by creator
bountySchema.index({ category: 1 }); // For category filtering
bountySchema.index({ tags: 1 }); // For tag-based searches
bountySchema.index({ network: 1 }); // For network filtering
bountySchema.index({ reward: -1 }); // For sorting by reward
bountySchema.index({ createdAt: -1 }); // For sorting by newest

// Compound index for common queries
bountySchema.index({ status: 1, category: 1, deadline: 1 });

// Middleware: Validate percentages when payoutType is 'percentage'
bountySchema.pre("validate", function () {
  if (this.payoutType !== "MULTI_PERCENTAGE") return;

  const p = this.percentages || [];

  if (p.length === 0) {
    return this.invalidate(
      "percentages",
      "Percentages are required when payoutType is percentage",
    );
  }

  if (p.length !== this.winnersAllowed) {
    return this.invalidate(
      "percentages",
      "Number of percentages must equal winnersAllowed",
    );
  }

  const sum = p.reduce((acc, val) => acc + val, 0);
  if (Math.abs(sum - 100) > 0.01) {
    return this.invalidate("percentages", "Percentages must sum to 100");
  }
});

// Instance method: Add a submission
bountySchema.methods.addSubmission = function (submissionId) {
  if (this.submissions.count >= this.submissions.maxSubmissions) {
    throw new Error("Maximum submissions reached");
  }

  if (this.submissions.ids.includes(submissionId)) {
    throw new Error("Submission already exists");
  }

  this.submissions.count += 1;
  this.submissions.ids.push(submissionId);
  return this.save();
};

// Instance method: Remove a submission
bountySchema.methods.removeSubmission = function (submissionId) {
  const index = this.submissions.ids.indexOf(submissionId);
  if (index === -1) {
    throw new Error("Submission not found");
  }

  this.submissions.count -= 1;
  this.submissions.ids.splice(index, 1);
  return this.save();
};

// Instance method: Assigning winners closes the bounty
// bountySchema.methods.assignWinner = function (walletAddress) {
//   if (this.winners.assigned.includes(walletAddress)) {
//     throw new Error("Winner already assigned");
//   }

//   if (this.winners.assigned.length >= this.winnersAllowed) {
//     throw new Error("Maximum winners reached");
//   }

//   this.winners.assigned.push(walletAddress);
//   if (this.winners.assigned.length === this.winnersAllowed) {
//     this.lifecycleStatus = "completed";
//   }
//   return this.save();
// };

// Instance method: Claim reward
// bountySchema.methods.claimReward = function (walletAddress) {
//   if (!this.winners.assigned.includes(walletAddress)) {
//     throw new Error("Wallet address is not a winner");
//   }

//   if (this.winners.claimed.includes(walletAddress)) {
//     throw new Error("Reward already claimed");
//   }

//   this.winners.claimed.push(walletAddress);
//   return this.save();
// };

// Instance method: cancel bounty
bountySchema.methods.cancel = function () {
  if (this.lifecycleStatus === "completed") {
    throw new Error("Completed bounty cannot be cancelled.");
  }

  this.lifecycleStatus = "cancelled";

  return this.save();
};

// Static method: Get active bounties
bountySchema.statics.getActive = function () {
  const now = new Date();
  return this.find({
    lifecycleStatus: null,
    startDate: { $lte: now },
    deadline: { $gte: now },
  }).sort({ createdAt: -1 });
};

// Static method: Get bounties by category
bountySchema.statics.findByCategory = function (category, limit = 10) {
  const now = new Date();

  return this.find({
    category,
    lifecycleStatus: null,
    startDate: { $lte: now },
    deadline: { $gte: now },
  })
    .sort({ reward: -1 })
    .limit(limit);
};

// Static method: Get trending bounties
bountySchema.statics.getTrending = function (limit = 5) {
  const now = new Date();

  return this.find({
    lifecycleStatus: null,
    startDate: { $lte: now },
    deadline: { $gte: now },
  })
    .sort({
      "submissions.count": -1,
      reward: -1,
    })
    .limit(limit);
};

// Export the model
const Bounty = mongoose.model("Bounty", bountySchema);

module.exports = Bounty;
