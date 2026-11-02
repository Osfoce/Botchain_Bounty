const express = require("express");
const { getComments, addComment } = require("../controller/comment.controller");

const router = express.Router();

// create routes
router.route("/comments/add/:bountyId").post(addComment);
router.route("/comments/:bountyId").get(getComments);

module.exports = router;
