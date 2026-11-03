const express = require("express");
const {
  userEnrollment,
  getUserEnrollment,
} = require("../controller/enrollment.controller");

const router = express.Router();
const { requireAuth, requireSelf } = require("../middleware/auth");
const { privateReadLimiter } = require("../middleware/privateReadLimiter");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const { requestSchemas, validateRequest } = require("../middleware/requestSchemas");

const enrollmentLimiters = createPolicyLimiters({
  name: "enrollment:create",
  limit: 20,
  wallet: true,
});

router
  .route("/user/enrollment")
  .post(
    requireAuth,
    ...enrollmentLimiters,
    validateRequest({ body: requestSchemas.enrollmentBody }),
    userEnrollment,
  );
router
  .route("/user/get-enrollment/:wallet")
  .get(
    validateRequest({
      params: requestSchemas.walletParams,
      query: requestSchemas.privateListQuery,
    }),
    requireAuth,
    privateReadLimiter,
    requireSelf,
    getUserEnrollment,
  );

module.exports = router;
