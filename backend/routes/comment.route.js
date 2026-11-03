const express = require("express");
const { getComments, addComment } = require("../controller/comment.controller");

const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const { requestSchemas, validateRequest } = require("../middleware/requestSchemas");

// create routes
const addCommentLimiters = createPolicyLimiters({
  name: "comment:create",
  limit: 15,
  wallet: true,
});

router
  .route("/comments/add/:bountyId")
  .post(
    requireAuth,
    ...addCommentLimiters,
    validateRequest({
      params: requestSchemas.bountyIdParams,
      body: requestSchemas.commentBody,
    }),
    addComment,
  );
router
  .route("/comments/:bountyId")
  .get(validateRequest({ params: requestSchemas.bountyIdParams }), getComments);

module.exports = router;
