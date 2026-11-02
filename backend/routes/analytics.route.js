const express = require("express");
const {
  getPlatformAnalytics,
  getWalletAnalytics,
} = require("../controller/analytics.controller");

const router = express.Router();

router.get("/analytics/platform", getPlatformAnalytics);
router.get("/analytics/:role/:wallet", getWalletAnalytics);

module.exports = router;
