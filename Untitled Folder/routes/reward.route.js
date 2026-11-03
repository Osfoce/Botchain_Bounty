const express = require("express");
const {
  distributeRewards,
  getWinners,
  getClaimable,
  claimReward,
  hasClaimed,
} = require("../controller/reward.controller");

const router = express.Router();

router.route("/bounty/:id/distribute").post(distributeRewards);
router.route("/bounty/:id/claim").post(claimReward);
router.route("/bounty/:id/winners").get(getWinners);
router.route("/bounty/:id/claimable/:userAddress").get(getClaimable);
router.route("/bounty/:id/has-claimed/:userAddress").get(hasClaimed);

module.exports = router;