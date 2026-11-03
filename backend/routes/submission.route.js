const express = require("express");
const { submit, getUserSubmission, getBountySubmissions } = require("../controller/submission.controller");
const { upload } = require('../middleware/upload'); // Path to your multer setup
const { requireAuth, requireSelf } = require("../middleware/auth");
const { privateReadLimiter } = require("../middleware/privateReadLimiter");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const { requestSchemas, validateRequest } = require("../middleware/requestSchemas");
const { prepareSubmissionImage } = require("../services/submissionImage.service");
const router = express.Router();

const submissionLimiters = createPolicyLimiters({
  name: "submission:create",
  limit: 5,
  wallet: true,
});

// create routes
router
  .route("/bounty/submit")
  .post(
    requireAuth,
    ...submissionLimiters,
    upload.single("image"),
    validateRequest({ body: requestSchemas.submissionBody }),
    prepareSubmissionImage,
    submit,
  );
router
  .route("/bounty/submissions/:id")
  .get(
    validateRequest({
      params: requestSchemas.idParams,
      query: requestSchemas.paginationQuery,
    }),
    requireAuth,
    privateReadLimiter,
    getBountySubmissions,
  );
router
  .route("/bounty/user/submissions/:wallet")
  .get(
    validateRequest({
      params: requestSchemas.walletParams,
      query: requestSchemas.privateListQuery,
    }),
    requireAuth,
    privateReadLimiter,
    requireSelf,
    getUserSubmission,
  );


module.exports = router;