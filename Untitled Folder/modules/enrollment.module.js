const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    bountyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
      index: true,
    },
    user: {
      type: String, // wallet address
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["enrolled", "submitted", "approved", "rejected"],
      default: "enrolled",
    },
    enrolledAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment at DB level
enrollmentSchema.index({ bountyId: 1, user: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema)

module.exports = Enrollment;