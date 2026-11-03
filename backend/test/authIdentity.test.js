const test = require("node:test");
const assert = require("node:assert/strict");
const Bounty = require("../modules/bounty.module");
const Comment = require("../modules/comment.module");
const Enrollment = require("../modules/enrollment.module");
const Reward = require("../modules/reward.module");
const Submission = require("../modules/submission.module");
const {
  createBounty,
  getBounty,
} = require("../controller/bounty.controller");
const { addComment } = require("../controller/comment.controller");
const { userEnrollment } = require("../controller/enrollment.controller");
const { claimReward } = require("../controller/reward.controller");
const { submit } = require("../controller/submission.controller");

const bountyId = "507f1f77bcf86cd799439011";
const authenticatedWallet = "0x1111111111111111111111111111111111111111";
const spoofedWallet = "0x2222222222222222222222222222222222222222";

const createResponse = () => ({
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

test("write controllers derive wallet identity from the authenticated session", async (t) => {
  const originals = {
    bountyCreate: Bounty.create,
    bountyFindById: Bounty.findById,
    bountyFindByIdAndUpdate: Bounty.findByIdAndUpdate,
    bountyFindOneAndUpdate: Bounty.findOneAndUpdate,
    bountyUpdateOne: Bounty.updateOne,
    submissionFind: Submission.find,
    submissionFindOne: Submission.findOne,
    submissionCreate: Submission.create,
    enrollmentFindOne: Enrollment.findOne,
    enrollmentCreate: Enrollment.create,
    commentCreate: Comment.create,
    rewardFindOne: Reward.findOne,
  };
  t.after(() => {
    Bounty.create = originals.bountyCreate;
    Bounty.findById = originals.bountyFindById;
    Bounty.findByIdAndUpdate = originals.bountyFindByIdAndUpdate;
    Bounty.findOneAndUpdate = originals.bountyFindOneAndUpdate;
    Bounty.updateOne = originals.bountyUpdateOne;
    Submission.find = originals.submissionFind;
    Submission.findOne = originals.submissionFindOne;
    Submission.create = originals.submissionCreate;
    Enrollment.findOne = originals.enrollmentFindOne;
    Enrollment.create = originals.enrollmentCreate;
    Comment.create = originals.commentCreate;
    Reward.findOne = originals.rewardFindOne;
  });

  const bounty = {
    _id: bountyId,
    id: bountyId,
    title: "Test bounty",
    creator: authenticatedWallet,
    blockchainId: "1",
    bountyContract: null,
    rewardsAssignedOnChain: true,
    currentStatus: "active",
    startDate: new Date(Date.now() - 60_000),
    deadline: new Date(Date.now() + 60_000),
    submissions: { count: 0, maxSubmissions: 100 },
    toObject() {
      return {
        _id: bountyId,
        creator: authenticatedWallet,
        title: "Test bounty",
      };
    },
  };
  const bountyQuery = {
    select() {
      return this;
    },
    lean: async () => bounty,
    then(resolve, reject) {
      return Promise.resolve(bounty).then(resolve, reject);
    },
  };
  Bounty.findById = () => bountyQuery;
  Bounty.findByIdAndUpdate = async () => bounty;
  Bounty.findOneAndUpdate = async () => bounty;
  Bounty.updateOne = async () => ({ modifiedCount: 1 });
  Submission.find = () => ({
    sort() {
      return this;
    },
    limit() {
      return this;
    },
    select() {
      return this;
    },
    lean: async () => [
      {
        _id: "submission-id",
        bountyId,
        user: spoofedWallet,
        description: "Private submission content",
        projectLink: "https://example.test/work",
      },
    ],
  });
  Submission.findOne = async () => null;
  Enrollment.findOne = async () => null;

  let createdBounty;
  Bounty.create = async (data) => {
    createdBounty = data;
    return { ...bounty, ...data };
  };
  const bountyResponse = createResponse();
  await createBounty(
    {
      auth: { walletAddress: authenticatedWallet },
      body: {
        title: "Test bounty",
        creator: spoofedWallet,
        startDate: "2026-01-01",
        deadline: "2026-12-31",
      },
    },
    bountyResponse,
  );
  assert.equal(bountyResponse.statusCode, 400);

  const validBountyResponse = createResponse();
  await createBounty(
    {
      auth: { walletAddress: authenticatedWallet },
      body: {
        title: "Test bounty",
        startDate: "2026-01-01",
        deadline: "2026-12-31",
        reward: "1",
        network: "5042",
      },
    },
    validBountyResponse,
  );
  assert.equal(validBountyResponse.statusCode, 201);
  assert.equal(createdBounty.creator, authenticatedWallet);

  let createdSubmission;
  Submission.create = async (data) => {
    createdSubmission = data;
    return { _id: "submission-id" };
  };
  const submissionResponse = createResponse();
  Enrollment.findOne = async () => ({ status: "enrolled" });
  await submit(
    {
      auth: { walletAddress: authenticatedWallet },
      body: {
        bountyId,
        user: spoofedWallet,
        description: "Submission",
        projectLink: "https://example.test/work",
      },
    },
    submissionResponse,
  );
  assert.equal(submissionResponse.statusCode, 201);
  assert.equal(createdSubmission.user, authenticatedWallet);

  Enrollment.findOne = async () => null;
  let createdEnrollment;
  Enrollment.create = async (data) => {
    createdEnrollment = data;
    return { _id: "enrollment-id" };
  };
  const enrollmentResponse = createResponse();
  await userEnrollment(
    {
      auth: { walletAddress: authenticatedWallet },
      body: { bountyId, user: spoofedWallet },
    },
    enrollmentResponse,
  );
  assert.equal(enrollmentResponse.statusCode, 201);
  assert.equal(createdEnrollment.user, authenticatedWallet);

  let createdComment;
  Comment.create = async (data) => {
    createdComment = data;
    return data;
  };
  const commentResponse = createResponse();
  await addComment(
    {
      auth: { walletAddress: authenticatedWallet },
      params: { bountyId },
      body: { user: spoofedWallet, text: "A comment" },
    },
    commentResponse,
  );
  assert.equal(commentResponse.statusCode, 201);
  assert.equal(createdComment.user, authenticatedWallet);

  const publicDetailResponse = createResponse();
  await getBounty(
    {
      params: { id: bountyId },
      query: { wallet: authenticatedWallet },
    },
    publicDetailResponse,
  );
  assert.equal(
    publicDetailResponse.body.bounty.submissions.isCreatorView,
    false,
  );
  assert.equal(
    publicDetailResponse.body.bounty.submissions.items.length,
    0,
  );

  const creatorDetailResponse = createResponse();
  await getBounty(
    {
      auth: { walletAddress: authenticatedWallet },
      params: { id: bountyId },
      query: { wallet: spoofedWallet },
    },
    creatorDetailResponse,
  );
  assert.equal(
    creatorDetailResponse.body.bounty.submissions.isCreatorView,
    true,
  );
  assert.equal(
    creatorDetailResponse.body.bounty.submissions.items[0].description,
    "Private submission content",
  );

  let claimQuery;
  Reward.findOne = async (query) => {
    claimQuery = query;
    return null;
  };
  const claimResponse = createResponse();
  await claimReward(
    {
      auth: { walletAddress: authenticatedWallet },
      params: { id: bountyId },
      body: {
        winnerAddress: spoofedWallet,
        txHash: `0x${"a".repeat(64)}`,
      },
    },
    claimResponse,
  );
  assert.deepEqual(claimQuery, {
    bountyId,
    winnerAddress: authenticatedWallet,
  });
  assert.equal(claimResponse.statusCode, 404);
});
