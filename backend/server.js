// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const { allowedOrigins } = require("./config/auth");
const ApiRateLimit = require("./modules/apiRateLimit.module");
const {
  createGeneralApiLimiter,
} = require("./middleware/rateLimit");
const {
  createRequestParsers,
  errorHandler,
  rejectUnsupportedContentType,
  requestId,
  setPermissionsPolicy,
} = require("./middleware/requestSecurity");
const startStatusUpdateJob = require("./jobs/updateStatusJob");
const { startClaimReconcileJob } = require("./jobs/claimReconcileJob");
const DistributionSync = require("./modules/distributionSync.module");
const ClaimSync = require("./modules/claimSync.module");
const Reward = require("./modules/reward.module");
const DistributionScanCheckpoint = require("./modules/distributionScanCheckpoint.module");
const AuthNonce = require("./modules/authNonce.module");
const AuthSession = require("./modules/authSession.module");
const UserDataRequest = require("./modules/userDataRequest.module");
const SecurityAudit = require("./modules/securityAudit.module");
const { logRequestError, logSecurityEvent } = require("./utils/requestLogger");
const {
  startRewardDistributionReconcileJob,
} = require("./jobs/rewardDistributionReconcileJob");

// Import routes
const userRoutes = require("./routes/user.route");
const submissionRoutes = require("./routes/submission.route");
const enrollmentRoutes = require("./routes/enrollment.route");
const rewardRoutes = require("./routes/reward.route");
const bountyRoute = require("./routes/bounty.route");
const comments = require("./routes/comment.route");
const analyticsRoutes = require("./routes/analytics.route");
const authRoutes = require("./routes/auth.route");

const app = express();
const port = process.env.PORT || 5000;
const isDatabaseReady = (connection = mongoose.connection) =>
  connection.readyState === 1;

const trustedProxyHops = process.env.TRUST_PROXY_HOPS;
if (trustedProxyHops !== undefined && !/^(?:0|[1-9]\d*)$/.test(trustedProxyHops)) {
  throw new Error("TRUST_PROXY_HOPS must be a non-negative integer");
}
if (Number(trustedProxyHops) > 10) {
  throw new Error("TRUST_PROXY_HOPS cannot exceed 10");
}
app.set(
  "trust proxy",
  trustedProxyHops === undefined ? false : Number(trustedProxyHops),
);

app.use(requestId);
app.use(
  helmet({
    frameguard: { action: "deny" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts:
      process.env.NODE_ENV === "production"
        ? { maxAge: 31_536_000, includeSubDomains: true }
        : false,
  }),
);
app.use(setPermissionsPolicy);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      const error = new Error("CORS_ORIGIN_DENIED");
      return callback(error);
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 600,
  }),
);
app.use("/api", createGeneralApiLimiter());
app.use(rejectUnsupportedContentType);
app.use(createRequestParsers());

app.get("/healthz", (req, res) =>
  res.status(200).json({ status: "ok", requestId: req.requestId }),
);
app.get("/readyz", (req, res) => {
  const ready = isDatabaseReady();
  return res
    .status(ready ? 200 : 503)
    .json({ status: ready ? "ready" : "not_ready", requestId: req.requestId });
});

// Routes
app.use("/api", comments);
app.use("/api", userRoutes);
app.use("/api", submissionRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", rewardRoutes);
app.use("/api", bountyRoute);
app.use("/api", analyticsRoutes);
app.use("/api", authRoutes);

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
  res.status(404).json({
    code: "NOT_FOUND",
    error: "Not found.",
    requestId: req.requestId,
  });
});
app.use(errorHandler);

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();

    await Promise.all([
      DistributionSync.init(),
      ClaimSync.init(),
      Reward.init(),
      DistributionScanCheckpoint.init(),
      AuthNonce.init(),
      AuthSession.init(),
      UserDataRequest.init(),
      ApiRateLimit.init(),
      SecurityAudit.init(),
    ]);
    logSecurityEvent({
      event: "database_indexes_ready",
      severity: "info",
      outcome: "success",
    });

    // Start the cron job only after DB is ready
    startStatusUpdateJob();
    startRewardDistributionReconcileJob();
    startClaimReconcileJob();
    logSecurityEvent({
      event: "background_jobs_started",
      severity: "info",
      outcome: "success",
    });

    app.listen(port, () => {
      logSecurityEvent({
        event: "server_started",
        severity: "info",
        outcome: "success",
      });
    });
  } catch (error) {
    logRequestError(null, "server_start_failed", error, "critical");
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, isDatabaseReady, startServer };
