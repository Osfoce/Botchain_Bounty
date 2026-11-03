const express = require("express");
const {
  getPlatformAnalytics,
  getWalletAnalytics,
} = require("../controller/analytics.controller");
const { requireAuth, requireSelf } = require("../middleware/auth");
const { privateReadLimiter } = require("../middleware/privateReadLimiter");
const { requestSchemas, validateRequest } = require("../middleware/requestSchemas");

const router = express.Router();

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/analytics/platform", getPlatformAnalytics);
router.get(
  "/analytics/:role/:wallet",
  validateRequest({ params: requestSchemas.analyticsParams }),
  requireAuth,
  privateReadLimiter,
  requireSelf,
  getWalletAnalytics,
);

module.exports = router;
