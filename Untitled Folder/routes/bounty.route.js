const express = require("express");
const {
  createBounty,
  getBounty,
  getBounties,
  updateBounty,
  deleteBounty,
  bountyTags,
  bountyCategory,
  getPlatformStats,
} = require("../controller/bounty.controller");

const router = express.Router();

// create routes
router.route("/bounty/create").post(createBounty);
router.route("/bounty/bounties").get(getBounties);
router.route("/bounty/tags").get(bountyTags);
router.route("/bounty/categories").get(bountyCategory);
router.route("/bounty/stats").get(getPlatformStats);
router.route("/bounty/:id").get(getBounty);
router.route("/bounty/update/:id").patch(updateBounty);
router.route("/bounty/delete/:id").delete(deleteBounty);
module.exports = router;
