const express = require("express");
const {
  userEnrollment,
  getUserEnrollment,
} = require("../controller/enrollment.controller");

const router = express.Router();

router.route("/user/enrollment").post(userEnrollment);
router.route("/user/get-enrollment/:wallet").get(getUserEnrollment);

module.exports = router;
