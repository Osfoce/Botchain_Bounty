const express = require("express");
const {
  distributeRewards,
  getWinners,
  getClaimable,
  claimReward,
  hasClaimed,
} = require("../controller/reward.controller");

const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { requireBountyOwnerOrAdmin } = require("../middleware/authorization");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const {
  requestSchemas,
  validateRequest,
} = require("../middleware/requestSchemas");

const claimLimiters = createPolicyLimiters({
  name: "reward:claim",
  limit: 10,
  wallet: true,
});
const distributionLimiters = createPolicyLimiters({
  name: "reward:distribution",
  limit: 10,
  wallet: true,
});

router
  .route("/bounty/:id/distribute")
  .post(
    requireAuth,
    ...distributionLimiters,
    validateRequest({
      params: requestSchemas.idParams,
      body: requestSchemas.transactionBody,
    }),
    requireBountyOwnerOrAdmin,
    distributeRewards,
  );
router
  .route("/bounty/:id/claim")
  .post(
    requireAuth,
    ...claimLimiters,
    validateRequest({
      params: requestSchemas.idParams,
      body: requestSchemas.claimBody,
    }),
    claimReward,
  );
router
  .route("/bounty/:id/winners")
  .get(validateRequest({ params: requestSchemas.idParams }), getWinners);
router
  .route("/bounty/:id/claimable/:userAddress")
  .get(
    validateRequest({ params: requestSchemas.userAddressParams }),
    getClaimable,
  );
router
  .route("/bounty/:id/has-claimed/:userAddress")
  .get(
    validateRequest({ params: requestSchemas.userAddressParams }),
    hasClaimed,
  );

module.exports = router;