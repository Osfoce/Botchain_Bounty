const express = require("express");
const { submit, getUserSubmission, getBountySubmissions } = require("../controller/submission.controller");
const { upload } = require('../middleware/upload'); // Path to your multer setup
const router = express.Router();



// create routes
router.route("/bounty/submit").post(upload.single('image'), submit);
router.route("/bounty/submissions/:id").get(getBountySubmissions);
router.route("/bounty/user/submissions/:wallet").get(getUserSubmission);


module.exports = router;