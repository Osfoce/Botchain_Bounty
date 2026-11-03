const express = require("express");
const {
  getAdminUserDataDeletionRequests,
  getOrCreateUserProfile,
  getUserDashboard,
  getUserDataDeletionRequests,
  getUserDataExport,
  requestUserDataDeletion,
  updateAdminUserDataDeletionRequest,
} = require("../controller/user.controller");

const router = express.Router();
const { requireAuth, requireSelf } = require("../middleware/auth");
const { privateReadLimiter } = require("../middleware/privateReadLimiter");
const { requireAdmin } = require("../middleware/authorization");
const { createPolicyLimiters } = require("../middleware/rateLimit");
const { requestSchemas, validateRequest } = require("../middleware/requestSchemas");

const dataDeletionLimiters = createPolicyLimiters({
  name: "user:data-deletion",
  limit: 2,
  wallet: true,
  ipLimit: 10,
});
const adminDataRequestLimiters = createPolicyLimiters({
  name: "admin:user-data-request",
  limit: 30,
  wallet: true,
});

// create routes
router
  .route("/user/data-export")
  .get(
    validateRequest({ query: requestSchemas.paginationQuery }),
    requireAuth,
    privateReadLimiter,
    getUserDataExport,
  );
router
  .route("/user/data-deletion-request")
  .post(
    requireAuth,
    ...dataDeletionLimiters,
    validateRequest({ body: requestSchemas.emptyBody }),
    requestUserDataDeletion,
  );
router
  .route("/user/data-deletion-requests")
  .get(
    validateRequest({ query: requestSchemas.paginationQuery }),
    requireAuth,
    privateReadLimiter,
    getUserDataDeletionRequests,
  );
router
  .route("/admin/user-data-requests")
  .get(
    validateRequest({ query: requestSchemas.paginationQuery }),
    requireAuth,
    requireAdmin,
    ...adminDataRequestLimiters,
    getAdminUserDataDeletionRequests,
  );
router
  .route("/admin/user-data-requests/:id")
  .patch(
    validateRequest({
      params: requestSchemas.idParams,
      body: requestSchemas.dataDeletionUpdate,
    }),
    requireAuth,
    requireAdmin,
    ...adminDataRequestLimiters,
    updateAdminUserDataDeletionRequest,
  );
router
  .route("/user/:wallet")
  .get(
    validateRequest({
      params: requestSchemas.walletParams,
      query: requestSchemas.paginationQuery,
    }),
    requireAuth,
    privateReadLimiter,
    requireSelf,
    getOrCreateUserProfile,
  );
router
  .route("/user/details/:wallet")
  .get(
    validateRequest({ params: requestSchemas.walletParams }),
    requireAuth,
    privateReadLimiter,
    requireSelf,
    getUserDashboard,
  );

module.exports = router;
