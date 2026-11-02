const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    bountyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
      index: true,
    },
    bountyTitle: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: String, // wallet address
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    projectLink: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // Cloudinary URL
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

// Prevent duplicate submissions per (bounty, user)
submissionSchema.index({ bountyId: 1, user: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
// using inside submit
// await Submission.create({ bountyId, user: wallet, content });
// await Bounty.updateOne(
//   { _id: bountyId },
//   {
//     $inc: { "submissions.count": 1 },
//     $push: { "submissions.ids": submissionId },
//   },
// );
