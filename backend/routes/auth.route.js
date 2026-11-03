const express = require("express");
const {
  issueNonce,
  verifySignature,
  logout,
} = require("../controller/auth.controller");
const { requireAuth } = require("../middleware/auth");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const {
  requestSchemas,
  validateRequest,
} = require("../middleware/requestSchemas");

const router = express.Router();
const nonceLimiters = createPolicyLimiters({
  name: "auth:nonce",
  limit: 10,
  ipLimit: 30,
});
const verifyLimiters = createPolicyLimiters({
  name: "auth:verify",
  limit: 10,
  ipLimit: 15,
});
const logoutLimiters = createPolicyLimiters({
  name: "auth:logout",
  limit: 20,
  wallet: true,
});

router.post(
  "/auth/nonce",
  ...nonceLimiters,
  validateRequest({ body: requestSchemas.authNonce }),
  issueNonce,
);
router.post(
  "/auth/verify",
  ...verifyLimiters,
  validateRequest({ body: requestSchemas.authVerify }),
  verifySignature,
);
router.post(
  "/auth/logout",
  requireAuth,
  ...logoutLimiters,
  validateRequest({ body: requestSchemas.emptyBody }),
  logout,
);

module.exports = router;
