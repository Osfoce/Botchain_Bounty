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
const { requireAuth, optionalAuth } = require("../middleware/auth");
const {
  requireBountyOwner,
  requireBountyOwnerOrAdmin,
} = require("../middleware/authorization");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const {
  requestSchemas,
  validateRequest,
} = require("../middleware/requestSchemas");

// create routes
const createLimiters = createPolicyLimiters({
  name: "bounty:create",
  limit: 5,
  wallet: true,
});
const adminMutationLimiters = createPolicyLimiters({
  name: "bounty:admin-mutation",
  limit: 30,
  wallet: true,
});

router
  .route("/bounty/create")
  .post(
    requireAuth,
    ...createLimiters,
    validateRequest({ body: requestSchemas.bountyCreate }),
    createBounty,
  );
router
  .route("/bounty/bounties")
  .get(validateRequest({ query: requestSchemas.bountyListQuery }), getBounties);
router.route("/bounty/tags").get(bountyTags);
router.route("/bounty/categories").get(bountyCategory);
router.route("/bounty/stats").get(getPlatformStats);
router
  .route("/bounty/:id")
  .get(
    validateRequest({ params: requestSchemas.idParams }),
    optionalAuth,
    getBounty,
  );
router
  .route("/bounty/update/:id")
  .patch(
    requireAuth,
    ...adminMutationLimiters,
    validateRequest({
      params: requestSchemas.idParams,
      body: requestSchemas.bountyUpdate,
    }),
    requireBountyOwner,
    updateBounty,
  );
router
  .route("/bounty/delete/:id")
  .delete(
    requireAuth,
    ...adminMutationLimiters,
    validateRequest({
      params: requestSchemas.idParams,
      body: requestSchemas.emptyBody,
    }),
    requireBountyOwnerOrAdmin,
    deleteBounty,
  );
module.exports = router;
