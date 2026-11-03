const express = require("express");
const { getOrCreateUserProfile, getUserDashboard } = require("../controller/user.controller");

const router = express.Router();

// create routes
router.route("/user/:wallet").get(getOrCreateUserProfile);
router.route("/user/details/:wallet").get(getUserDashboard);

module.exports = router;
