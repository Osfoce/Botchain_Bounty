const test = require("node:test");
const assert = require("node:assert/strict");

const originalAdminWallets = process.env.ADMIN_WALLETS;
process.env.ADMIN_WALLETS =
  "0x3333333333333333333333333333333333333333";
const { getBountySubmissions, getUserSubmission } = require("../controller/submission.controller");
if (originalAdminWallets === undefined) {
  delete process.env.ADMIN_WALLETS;
} else {
  process.env.ADMIN_WALLETS = originalAdminWallets;
}

const Bounty = require("../modules/bounty.module");
const Enrollment = require("../modules/enrollment.module");
const Submission = require("../modules/submission.module");
const User = require("../modules/user.module");
const {
  getOrCreateUserProfile,
  getUserDashboard,
} = require("../controller/user.controller");
const {
  serializeBounty,
  serializeSubmission,
  serializeUser,
} = require("../utils/serializers");

const bountyId = "507f1f77bcf86cd799439011";
const creator = "0x1111111111111111111111111111111111111111";
const participant = "0x2222222222222222222222222222222222222222";
const admin = "0x3333333333333333333333333333333333333333";
const other = "0x4444444444444444444444444444444444444444";

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

const makeQuery = (result) => {
  const query = {
    skipValue: 0,
    limitValue: 100,
    sort() {
      return this;
    },
    skip(value) {
      this.skipValue = value;
      return this;
    },
    limit(value) {
      this.limitValue = value;
      return this;
    },
    select() {
      return this;
    },
    lean: async () => result,
    then(resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return query;
};

const makeSubmission = (id, user) => ({
  _id: id,
  bountyId,
  bountyTitle: "Private bounty",
  user,
  description: `Private work from ${user}`,
  projectLink: "https://example.test/work",
  image: "https://example.test/submission.png",
  status: "pending",
  submittedAt: new Date("2026-01-01T00:00:00Z"),
  __v: 7,
  internalModerationNote: "private",
});

test("submission responses are scoped to creator, submitter, or configured admin", async (t) => {
  const originals = {
    bountyFindById: Bounty.findById,
    submissionFind: Submission.find,
    submissionCountDocuments: Submission.countDocuments,
  };
  const records = [
    makeSubmission("submission-a", participant),
    makeSubmission("submission-b", other),
  ];
  let lastFilter;
  Bounty.findById = () =>
    makeQuery({ _id: bountyId, creator, archivedAt: null });
  Submission.find = (filter) => {
    lastFilter = filter;
    return makeQuery(
      records.filter(
        (record) =>
          String(record.bountyId) === String(filter.bountyId) &&
          (!filter.user || record.user === filter.user),
      ),
    );
  };
  Submission.countDocuments = async (filter) =>
    records.filter(
      (record) =>
        String(record.bountyId) === String(filter.bountyId) &&
        (!filter.user || record.user === filter.user),
    ).length;
  t.after(() => {
    Bounty.findById = originals.bountyFindById;
    Submission.find = originals.submissionFind;
    Submission.countDocuments = originals.submissionCountDocuments;
  });

  const participantResponse = response();
  await getBountySubmissions(
    {
      params: { id: bountyId },
      query: {
        page: "1",
        limit: "100",
        wallet: creator,
        creator,
      },
      auth: { walletAddress: participant },
    },
    participantResponse,
  );
  assert.equal(participantResponse.statusCode, 200);
  assert.deepEqual(lastFilter, { bountyId, user: participant });
  assert.equal(participantResponse.body.submissions.length, 1);
  assert.equal(
    participantResponse.body.submissions[0].description,
    `Private work from ${participant}`,
  );
  assert.equal("__v" in participantResponse.body.submissions[0], false);
  assert.equal("internalModerationNote" in participantResponse.body.submissions[0], false);
  assert.equal(participantResponse.body.pagination.limit, 100);

  const strangerResponse = response();
  await getBountySubmissions(
    {
      params: { id: bountyId },
      query: {},
      auth: { walletAddress: "0x5555555555555555555555555555555555555555" },
    },
    strangerResponse,
  );
  assert.equal(strangerResponse.statusCode, 200);
  assert.deepEqual(strangerResponse.body.submissions, []);
  assert.deepEqual(lastFilter, {
    bountyId,
    user: "0x5555555555555555555555555555555555555555",
  });

  const creatorResponse = response();
  await getBountySubmissions(
    { params: { id: bountyId }, query: {}, auth: { walletAddress: creator } },
    creatorResponse,
  );
  assert.equal(creatorResponse.body.submissions.length, 2);
  assert.deepEqual(lastFilter, { bountyId });

  const adminMessages = [];
  const originalInfo = console.info;
  const originalWarn = console.warn;
  console.info = (...values) => adminMessages.push(values.join(" "));
  console.warn = (...values) => adminMessages.push(values.join(" "));
  try {
    const adminResponse = response();
    await getBountySubmissions(
      { params: { id: bountyId }, query: {}, auth: { walletAddress: admin } },
      adminResponse,
    );
    assert.equal(adminResponse.body.submissions.length, 2);
    assert.match(adminMessages.join(" "), /admin_submissions_read/);
  } finally {
    console.info = originalInfo;
    console.warn = originalWarn;
  }
});

test("personal submission history is paginated, filtered, and serialized explicitly", async (t) => {
  const originals = {
    submissionFind: Submission.find,
    submissionCountDocuments: Submission.countDocuments,
  };
  let queryFilter;
  let queryLimit;
  Submission.find = (filter) => {
    queryFilter = filter;
    const query = makeQuery([makeSubmission("submission-a", participant)]);
    const originalLimit = query.limit;
    query.limit = function (limit) {
      queryLimit = limit;
      return originalLimit.call(this, limit);
    };
    return query;
  };
  Submission.countDocuments = async (filter) =>
    filter.status ? 1 : 12;
  t.after(() => {
    Submission.find = originals.submissionFind;
    Submission.countDocuments = originals.submissionCountDocuments;
  });

  const res = response();
  await getUserSubmission(
    {
      auth: { walletAddress: participant },
      query: { bountyId, limit: "100" },
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(queryFilter, { user: participant, bountyId });
  assert.equal(queryLimit, 100);
  assert.equal(res.body.submissions.length, 1);
  assert.equal(res.body.pagination.limit, 100);
  assert.equal("__v" in res.body.submissions[0], false);
  assert.equal("internalModerationNote" in res.body.submissions[0], false);
  assert.equal(res.body.submissions[0].description, `Private work from ${participant}`);
});

test("public bounty and user serializers omit internal persistence fields", () => {
  const bounty = serializeBounty({
    _id: bountyId,
    title: "Public bounty",
    creator,
    startDate: new Date("2026-01-01T00:00:00Z"),
    deadline: new Date("2026-02-01T00:00:00Z"),
    network: "5042",
    reward: 10,
    token: "USDC",
    submissions: { count: 2, maxSubmissions: 10 },
    archivedAt: null,
    archivedBy: admin,
    __v: 3,
    internalModerationNote: "private",
  });
  assert.equal(bounty._id, bountyId);
  assert.equal(bounty.submissions.count, 2);
  assert.equal("archivedBy" in bounty, false);
  assert.equal("__v" in bounty, false);
  assert.equal("internalModerationNote" in bounty, false);

  const publicSubmission = serializeSubmission(
    makeSubmission("submission-a", participant),
  );
  assert.equal("description" in publicSubmission, false);
  assert.equal("__v" in publicSubmission, false);

  const user = serializeUser({
    walletAddress: participant,
    totalEarnings: 1,
    claimedRewards: [{ amountWei: "secret" }],
    __v: 9,
  });
  assert.equal(user.walletAddress, participant);
  assert.equal("claimedRewards" in user, false);
  assert.equal("__v" in user, false);
});

test("self-profile history is paginated and returns explicit DTOs", async (t) => {
  const originals = {
    userFindOne: User.findOne,
    userFindOneAndUpdate: User.findOneAndUpdate,
    bountyFind: Bounty.find,
    bountyCountDocuments: Bounty.countDocuments,
    submissionFind: Submission.find,
    submissionCountDocuments: Submission.countDocuments,
  };
  const user = {
    walletAddress: participant,
    reputationScore: 4,
    totalEarnings: 12,
    claimedRewards: [{ amountWei: "private-history" }],
    __v: 5,
  };
  User.findOne = async () => user;
  User.findOneAndUpdate = async () => user;
  Bounty.find = () =>
    makeQuery([
      {
        _id: bountyId,
        title: "Owned bounty",
        creator: participant,
        startDate: new Date("2026-01-01T00:00:00Z"),
        deadline: new Date("2026-02-01T00:00:00Z"),
        network: "5042",
        reward: 10,
        token: "USDC",
        __v: 2,
      },
    ]);
  Bounty.countDocuments = async () => 1;
  Submission.find = () =>
    makeQuery([makeSubmission("submission-a", participant)]);
  Submission.countDocuments = async () => 1;
  t.after(() => {
    User.findOne = originals.userFindOne;
    User.findOneAndUpdate = originals.userFindOneAndUpdate;
    Bounty.find = originals.bountyFind;
    Bounty.countDocuments = originals.bountyCountDocuments;
    Submission.find = originals.submissionFind;
    Submission.countDocuments = originals.submissionCountDocuments;
  });

  const res = response();
  await getOrCreateUserProfile(
    {
      auth: { walletAddress: participant },
      query: { page: "1", limit: "100" },
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.walletAddress, participant);
  assert.equal(res.body.user.totalEarningsUsd, null);
  assert.equal(res.body.user.earningsUsdStatus, "incomplete");
  assert.equal("claimedRewards" in res.body.user, false);
  assert.equal("__v" in res.body.user, false);
  assert.equal("__v" in res.body.createdBounties[0], false);
  assert.equal("internalModerationNote" in res.body.submissions[0], false);
  assert.equal(res.body.pagination.limit, 100);
});

test("dashboard history returns aggregates and caps enrollment identifiers", async (t) => {
  const originals = {
    userFindOneAndUpdate: User.findOneAndUpdate,
    bountyAggregate: Bounty.aggregate,
    submissionAggregate: Submission.aggregate,
    enrollmentFind: Enrollment.find,
    enrollmentCountDocuments: Enrollment.countDocuments,
  };
  User.findOneAndUpdate = async () => ({
    walletAddress: participant,
    reputationScore: 2,
    totalEarnings: 5,
    stats: { tasksCompleted: 3 },
  });
  Bounty.aggregate = async () => [
    { _id: "active", count: 2 },
    { _id: "completed", count: 1 },
  ];
  Submission.aggregate = async () => [
    { _id: "pending", count: 4 },
    { _id: "accepted", count: 2 },
  ];
  Enrollment.find = () =>
    makeQuery(Array.from({ length: 100 }, (_, index) => ({
      bountyId: `bounty-${index}`,
    })));
  Enrollment.countDocuments = async () => 125;
  t.after(() => {
    User.findOneAndUpdate = originals.userFindOneAndUpdate;
    Bounty.aggregate = originals.bountyAggregate;
    Submission.aggregate = originals.submissionAggregate;
    Enrollment.find = originals.enrollmentFind;
    Enrollment.countDocuments = originals.enrollmentCountDocuments;
  });

  const res = response();
  await getUserDashboard({ auth: { walletAddress: participant } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.bounties.active, 2);
  assert.equal(res.body.bounties.completed, 1);
  assert.equal(res.body.bounties.total, 3);
  assert.equal(res.body.submissions.pending, 4);
  assert.equal(res.body.submissions.total, 6);
  assert.equal(res.body.user.totalEarningsUsd, null);
  assert.equal(res.body.user.earningsUsdStatus, "incomplete");
  assert.equal(res.body.enrolledBountyIds.length, 100);
  assert.deepEqual(res.body.enrollmentPagination, {
    limit: 100,
    total: 125,
    hasMore: true,
  });
});
