const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const Bounty = require("../modules/bounty.module");
const Comment = require("../modules/comment.module");
const DistributionSync = require("../modules/distributionSync.module");
const Enrollment = require("../modules/enrollment.module");
const Reward = require("../modules/reward.module");
const Submission = require("../modules/submission.module");
const User = require("../modules/user.module");
const UserDataRequest = require("../modules/userDataRequest.module");
const { getBounty, deleteBounty } = require("../controller/bounty.controller");
const { getComments } = require("../controller/comment.controller");
const {
  getUserDataDeletionRequests,
  getUserDataExport,
  requestUserDataDeletion,
  updateAdminUserDataDeletionRequest,
} = require("../controller/user.controller");
const { requestSchemas } = require("../middleware/requestSchemas");
const userRoutes = require("../routes/user.route");
const { errorHandler, requestId } = require("../middleware/requestSecurity");

const bountyId = "507f1f77bcf86cd799439011";
const wallet = "0x1111111111111111111111111111111111111111";
const adminWallet = "0x3333333333333333333333333333333333333333";

const response = () => ({
  statusCode: 200,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const makeQuery = (result) => ({
  sort() {
    return this;
  },
  skip() {
    return this;
  },
  limit() {
    return this;
  },
  select() {
    return this;
  },
  lean: async () => result,
  then(resolve, reject) {
    return Promise.resolve(result).then(resolve, reject);
  },
});

test("archived bounties and their comments are hidden from public reads", async (t) => {
  const originals = {
    bountyFindById: Bounty.findById,
    commentFind: Comment.find,
    submissionCountDocuments: Submission.countDocuments,
  };
  const archived = {
    _id: bountyId,
    creator: wallet,
    archivedAt: new Date(),
    lifecycleStatus: null,
  };
  let commentReads = 0;
  let submissionCountReads = 0;
  Bounty.findById = () => makeQuery(archived);
  Comment.find = () => {
    commentReads += 1;
    return makeQuery([]);
  };
  Submission.countDocuments = async () => {
    submissionCountReads += 1;
    return 0;
  };
  t.after(() => {
    Bounty.findById = originals.bountyFindById;
    Comment.find = originals.commentFind;
    Submission.countDocuments = originals.submissionCountDocuments;
  });

  const bountyResponse = response();
  await getBounty({ params: { id: bountyId } }, bountyResponse);
  const commentsResponse = response();
  await getComments({ params: { bountyId } }, commentsResponse);

  assert.equal(bountyResponse.statusCode, 404);
  assert.equal(commentsResponse.statusCode, 404);
  assert.equal(commentReads, 0);
  assert.equal(submissionCountReads, 0);
});

test("archiving preserves related financial and audit records and does not change chain state", async (t) => {
  const models = [
    Bounty,
    Comment,
    DistributionSync,
    Enrollment,
    Reward,
    Submission,
    User,
  ];
  const originals = {
    bountyFindByIdAndUpdate: Bounty.findByIdAndUpdate,
    deleteMany: models.map((model) => model.deleteMany),
  };
  const deleteCalls = [];
  let archiveUpdate;
  Bounty.findByIdAndUpdate = async (_id, update) => {
    archiveUpdate = update;
    return { _id: bountyId, ...update.$set };
  };
  for (const [index, model] of models.entries()) {
    model.deleteMany = async () => {
      deleteCalls.push(index);
    };
  }
  t.after(() => {
    Bounty.findByIdAndUpdate = originals.bountyFindByIdAndUpdate;
    models.forEach((model, index) => {
      model.deleteMany = originals.deleteMany[index];
    });
  });

  const result = response();
  await deleteBounty(
    {
      bounty: {
        _id: bountyId,
        archivedAt: null,
        isOnChain: true,
        blockchainId: 7,
        txHash: `0x${"a".repeat(64)}`,
      },
      auth: { walletAddress: wallet },
      authorizationRole: "owner",
    },
    result,
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.archived, true);
  assert.equal(result.body.onChainChanged, false);
  assert.ok(archiveUpdate.$set.archivedAt instanceof Date);
  assert.deepEqual(Object.keys(archiveUpdate.$set).sort(), [
    "archivedAt",
    "archivedBy",
  ]);
  assert.equal(deleteCalls.length, 0);
});

test("authenticated data export scopes every dataset to the session wallet", async (t) => {
  const originals = {
    userFindOne: User.findOne,
    bountyFind: Bounty.find,
    bountyCount: Bounty.countDocuments,
    submissionFind: Submission.find,
    submissionCount: Submission.countDocuments,
    enrollmentFind: Enrollment.find,
    enrollmentCount: Enrollment.countDocuments,
    commentFind: Comment.find,
    commentCount: Comment.countDocuments,
    rewardFind: Reward.find,
    rewardCount: Reward.countDocuments,
  };
  const filters = [];
  let profileProjection = {};
  const capture = (result) => (filter) => {
    filters.push(filter);
    return makeQuery(result);
  };
  User.findOne = (filter) => {
    filters.push(filter);
    const query = makeQuery({ walletAddress: wallet });
    query.select = (projection) => {
      profileProjection = projection;
      return query;
    };
    return query;
  };
  Bounty.find = capture([{ _id: bountyId, creator: wallet, title: "Work" }]);
  Bounty.countDocuments = async (filter) => {
    filters.push(filter);
    return 1;
  };
  Submission.find = capture([]);
  Submission.countDocuments = async (filter) => {
    filters.push(filter);
    return 0;
  };
  Enrollment.find = capture([]);
  Enrollment.countDocuments = async (filter) => {
    filters.push(filter);
    return 0;
  };
  Comment.find = capture([]);
  Comment.countDocuments = async (filter) => {
    filters.push(filter);
    return 0;
  };
  Reward.find = capture([]);
  Reward.countDocuments = async (filter) => {
    filters.push(filter);
    return 0;
  };
  t.after(() => {
    User.findOne = originals.userFindOne;
    Bounty.find = originals.bountyFind;
    Bounty.countDocuments = originals.bountyCount;
    Submission.find = originals.submissionFind;
    Submission.countDocuments = originals.submissionCount;
    Enrollment.find = originals.enrollmentFind;
    Enrollment.countDocuments = originals.enrollmentCount;
    Comment.find = originals.commentFind;
    Comment.countDocuments = originals.commentCount;
    Reward.find = originals.rewardFind;
    Reward.countDocuments = originals.rewardCount;
  });

  const result = response();
  await getUserDataExport(
    { auth: { walletAddress: wallet }, query: { page: "1", limit: "10" } },
    result,
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.data.profile.walletAddress, wallet);
  assert.equal(result.body.data.createdBounties.length, 1);
  assert.equal(result.body.pagination.createdBounties.total, 1);
  assert.equal(profileProjection.claimedRewards, undefined);
  assert.equal(profileProjection.stats, undefined);
  assert.deepEqual(result.body.excluded, [
    "authentication sessions",
    "nonce hashes",
    "rate-limit keys",
    "internal distribution-deduplication keys",
  ]);
  assert.ok(filters.every((filter) => Object.values(filter).includes(wallet)));
});

test("deletion requests are authenticated, idempotent, and do not erase financial history", async (t) => {
  const originals = {
    requestFindOne: UserDataRequest.findOne,
    requestCreate: UserDataRequest.create,
  };
  let activeRequest = null;
  let createdRequests = 0;
  let deletionCalls = 0;
  UserDataRequest.findOne = () => makeQuery(activeRequest);
  UserDataRequest.create = async (data) => {
    createdRequests += 1;
    activeRequest = {
      _id: "data-request-id",
      walletAddress: data.walletAddress,
      status: "pending",
      createdAt: new Date(),
      reviewedAt: null,
    };
    return activeRequest;
  };
  const models = [
    User,
    Bounty,
    Comment,
    DistributionSync,
    Enrollment,
    Reward,
    Submission,
  ];
  const deleteMethods = models.map((model) => ({
    deleteOne: model.deleteOne,
    deleteMany: model.deleteMany,
  }));
  for (const model of models) {
    model.deleteOne = async () => {
      deletionCalls += 1;
    };
    model.deleteMany = async () => {
      deletionCalls += 1;
    };
  }
  t.after(() => {
    UserDataRequest.findOne = originals.requestFindOne;
    UserDataRequest.create = originals.requestCreate;
    models.forEach((model, index) => {
      model.deleteOne = deleteMethods[index].deleteOne;
      model.deleteMany = deleteMethods[index].deleteMany;
    });
  });

  const firstResponse = response();
  await requestUserDataDeletion(
    { auth: { walletAddress: wallet } },
    firstResponse,
  );
  const secondResponse = response();
  await requestUserDataDeletion(
    { auth: { walletAddress: wallet } },
    secondResponse,
  );

  assert.equal(firstResponse.statusCode, 202);
  assert.equal(secondResponse.statusCode, 200);
  assert.equal(firstResponse.body.request.status, "pending");
  assert.equal(secondResponse.body.alreadyOpen, true);
  assert.equal(createdRequests, 1);
  assert.equal(deletionCalls, 0);
});

test("users can read only their own data deletion request status", async (t) => {
  const originals = {
    requestFind: UserDataRequest.find,
    requestCount: UserDataRequest.countDocuments,
  };
  let queryFilter;
  UserDataRequest.find = (filter) => {
    queryFilter = filter;
    return makeQuery([
      {
        _id: "data-request-id",
        status: "reviewing",
        resolution: "private reviewer note",
      },
    ]);
  };
  UserDataRequest.countDocuments = async (filter) => {
    queryFilter = filter;
    return 1;
  };
  t.after(() => {
    UserDataRequest.find = originals.requestFind;
    UserDataRequest.countDocuments = originals.requestCount;
  });

  const result = response();
  await getUserDataDeletionRequests(
    { auth: { walletAddress: wallet }, query: {} },
    result,
  );

  assert.deepEqual(queryFilter, { walletAddress: wallet });
  assert.equal(result.body.requests[0].status, "reviewing");
  assert.equal("resolution" in result.body.requests[0], false);
});

test("user data export and deletion requests require authentication", async (t) => {
  const app = express();
  app.use(requestId);
  app.use("/api", userRoutes);
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  const exportResponse = await fetch(`${baseUrl}/user/data-export`);
  const requestResponse = await fetch(`${baseUrl}/user/data-deletion-request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  assert.equal(exportResponse.status, 401);
  assert.equal(requestResponse.status, 401);
});

test("admin deletion review requires terminal resolutions and valid state transitions", async (t) => {
  const originals = {
    findById: UserDataRequest.findById,
    findOneAndUpdate: UserDataRequest.findOneAndUpdate,
  };
  let update;
  UserDataRequest.findById = () => makeQuery({ _id: "data-request-id", status: "pending" });
  UserDataRequest.findOneAndUpdate = (_filter, change) => {
    update = change.$set;
    return makeQuery({
      _id: "data-request-id",
      walletAddress: wallet,
      status: update.status,
      reviewedBy: adminWallet,
      reviewedAt: update.reviewedAt,
      resolution: update.resolution,
    });
  };
  t.after(() => {
    UserDataRequest.findById = originals.findById;
    UserDataRequest.findOneAndUpdate = originals.findOneAndUpdate;
  });

  const unresolved = requestSchemas.dataDeletionUpdate.safeParse({
    status: "completed",
  });
  assert.equal(unresolved.success, false);

  const result = response();
  await updateAdminUserDataDeletionRequest(
    {
      params: { id: "data-request-id" },
      body: { status: "completed", resolution: "Reviewed under retention policy" },
      auth: { walletAddress: adminWallet },
    },
    result,
  );

  assert.equal(result.statusCode, 200);
  assert.equal(update.active, false);
  assert.equal(update.reviewedBy, adminWallet);
  assert.equal(update.status, "completed");
  assert.ok(update.reviewedAt instanceof Date);
});
