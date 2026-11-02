// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const startStatusUpdateJob = require("./jobs/updateStatusJob");

// Import routes
const userRoutes = require("./routes/user.route");
const submissionRoutes = require("./routes/submission.route");
const enrollmentRoutes = require("./routes/enrollment.route");
const rewardRoutes = require("./routes/reward.route");
const bountyRoute = require("./routes/bounty.route");
const comments = require("./routes/comment.route");

const app = express();
const port = process.env.PORT || 5000;
console.log(port);

// Middleware
app.use(cors()); // For production, restrict origins as needed
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", comments);
app.use("/api", userRoutes);
app.use("/api", submissionRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", rewardRoutes);
app.use("/api", bountyRoute);

// Test route
app.get("/", (req, res) => {
  //http://localhost:5000/api/bounty/bounties
  // http://localhost:5000/api/bounty/id
  // http://localhost:5000/api/bounty/create
  // http://localhost:5000/api/bounty/delete/id
  // http://localhost:5000/api/bounty/update/id

  res.json({ message: "Happy Bounty API working" });
});

app.use((req, res, next) => {
  console.log("UNMATCHED:", req.method, req.originalUrl);
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();

    console.log("Connected to database");

    // Start the cron job only after DB is ready
    startStatusUpdateJob();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
