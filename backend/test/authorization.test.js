const test = require("node:test");
const assert = require("node:assert/strict");

const originalAdminWallets = process.env.ADMIN_WALLETS;
process.env.ADMIN_WALLETS =
  "0x3333333333333333333333333333333333333333";
const {
  isAdminWallet,
  requireAdmin,
  requireBountyOwner,
  requireBountyOwnerOrAdmin,
} = require("../middleware/authorization");
if (originalAdminWallets === undefined) {
  delete process.env.ADMIN_WALLETS;
} else {
  process.env.ADMIN_WALLETS = originalAdminWallets;
}

const Bounty = require("../modules/bounty.module");
const Comment = require("../modules/comment.module");
const Enrollment = require("../modules/enrollment.module");
const Submission = require("../modules/submission.module");
const { updateBounty, deleteBounty } = require("../controller/bounty.controller");
const { addComment } = require("../controller/comment.controller");
const { userEnrollment } = require("../controller/enrollment.controller");
const { submit } = require("../controller/submission.controller");
const isAcceptingEntries = require("../utils/bountyLifecycle").isAcceptingEntries;

const bountyId = "507f1f77bcf86cd799439011";
const ownerWallet = "0x1111111111111111111111111111111111111111";
const otherWallet = "0x2222222222222222222222222222222222222222";
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

const queryFor = (value) => ({
  select() {
    return this;
  },
  lean: async () => value,
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const invoke = async (middleware, req, res) => {
  let nextCalled = false;
  let nextError;
  await middleware(req, res, (error) => {
    nextCalled = true;
    nextError = error;
  });
  return { nextCalled, nextError };
};

test("bounty update authorization permits only the creator", async (t) => {
  const originalFindById = Bounty.findById;
  const bounty = { _id: bountyId, creator: ownerWallet, archivedAt: null };
  Bounty.findById = () => queryFor(bounty);
  t.after(() => {
    Bounty.findById = originalFindById;
  });

  const ownerReq = {
    params: { id: bountyId },
    auth: { walletAddress: ownerWallet },
  };
  const ownerRes = response();
  const ownerResult = await invoke(requireBountyOwner, ownerReq, ownerRes);
  assert.equal(ownerResult.nextCalled, true);
  assert.equal(ownerReq.bounty, bounty);
  assert.equal(ownerReq.authorizationRole, "owner");

  const otherRes = response();
  const otherResult = await invoke(
    requireBountyOwner,
    {
      params: { id: bountyId },
      auth: { walletAddress: otherWallet },
    },
    otherRes,
  );
  assert.equal(otherResult.nextCalled, false);
  assert.equal(otherRes.statusCode, 403);

  const adminRes = response();
  const adminResult = await invoke(
    requireBountyOwner,
    {
      params: { id: bountyId },
      auth: { walletAddress: adminWallet },
    },
    adminRes,
  );
  assert.equal(adminResult.nextCalled, false);
  assert.equal(adminRes.statusCode, 403);
});

test("admins are server-provisioned and can archive another creator's bounty", async (t) => {
  const originalFindById = Bounty.findById;
  const originalFindByIdAndUpdate = Bounty.findByIdAndUpdate;
  const bounty = { _id: bountyId, creator: ownerWallet, archivedAt: null };
  Bounty.findById = () => queryFor(bounty);

  let archiveUpdate;
  Bounty.findByIdAndUpdate = async (...args) => {
    archiveUpdate = args;
    return { ...bounty, ...args[1].$set };
  };

  const auditMessages = [];
  const originalInfo = console.info;
  const originalWarn = console.warn;
  console.info = (...values) => auditMessages.push(values.join(" "));
  console.warn = (...values) => auditMessages.push(values.join(" "));
  t.after(() => {
    Bounty.findById = originalFindById;
    Bounty.findByIdAndUpdate = originalFindByIdAndUpdate;
    console.info = originalInfo;
    console.warn = originalWarn;
  });

  assert.equal(isAdminWallet(adminWallet), true);
  assert.equal(isAdminWallet(otherWallet), false);

  const adminReq = {
    params: { id: bountyId },
    auth: { walletAddress: adminWallet },
  };
  const adminRes = response();
  const adminResult = await invoke(
    requireBountyOwnerOrAdmin,
    adminReq,
    adminRes,
  );
  assert.equal(adminResult.nextCalled, true);
  assert.equal(adminReq.authorizationRole, "admin");

  const archiveRes = response();
  await deleteBounty(
    { ...adminReq, body: {} },
    archiveRes,
  );
  assert.equal(archiveRes.statusCode, 200);
  assert.equal(archiveRes.body.archived, true);
  assert.equal(archiveUpdate[0], bountyId);
  assert.equal(archiveUpdate[1].$set.archivedBy, adminWallet);
  assert.ok(archiveUpdate[1].$set.archivedAt instanceof Date);
  assert.match(auditMessages.join(" "), /admin_bounty_archived/);
});

test("admin middleware denies unprovisioned and anonymous wallets", async (t) => {
  const logged = [];
  const originalWarn = console.warn;
  console.warn = (...values) => logged.push(values.join(" "));
  t.after(() => {
    console.warn = originalWarn;
  });

  const anonymousRes = response();
  const anonymous = await invoke(requireAdmin, {}, anonymousRes);
  assert.equal(anonymous.nextCalled, false);
  assert.equal(anonymousRes.statusCode, 401);

  const deniedRes = response();
  const denied = await invoke(
    requireAdmin,
    { auth: { walletAddress: otherWallet } },
    deniedRes,
  );
  assert.equal(denied.nextCalled, false);
  assert.equal(deniedRes.statusCode, 403);

  const allowedRes = response();
  const allowed = await invoke(
    requireAdmin,
    { auth: { walletAddress: adminWallet } },
    allowedRes,
  );
  assert.equal(allowed.nextCalled, true);
  const events = logged
    .map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  assert.ok(
    events.some(
      (event) =>
        event.action === "authorization_denied" &&
        event.errorCode === "ADMIN_ROLE_REQUIRED",
    ),
  );
});

test("bounty updates reject creator and financial fields", async (t) => {
  const originalFindByIdAndUpdate = Bounty.findByIdAndUpdate;
  let updateCalled = false;
  Bounty.findByIdAndUpdate = async () => {
    updateCalled = true;
  };
  t.after(() => {
    Bounty.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const res = response();
  await updateBounty(
    {
      params: { id: bountyId },
      body: { creator: otherWallet, reward: 1 },
    },
    res,
  );

  assert.equal(res.statusCode, 400);
  assert.equal(updateCalled, false);
});

test("bounty archival preserves the record and listing filters hide it", async () => {
  const now = new Date();
  const active = {
    lifecycleStatus: null,
    archivedAt: null,
    startDate: new Date(now.getTime() - 1000),
    deadline: new Date(now.getTime() + 1000),
  };
  assert.equal(isAcceptingEntries(active, now), true);
  assert.equal(isAcceptingEntries({ ...active, archivedAt: now }, now), false);
  assert.equal(isAcceptingEntries({ ...active, lifecycleStatus: "cancelled" }, now), false);
  assert.equal(isAcceptingEntries({ ...active, startDate: new Date(now.getTime() + 1000) }, now), false);
  assert.equal(isAcceptingEntries({ ...active, deadline: new Date(now.getTime() - 1000) }, now), false);

  const filter = require("../utils/buildBountyFilter")({ status: "all" });
  assert.equal(filter.archivedAt, null);
});

test("enrollment and submission writes reject inactive or full bounties", async (t) => {
  const originals = {
    bountyFindById: Bounty.findById,
    bountyFindOneAndUpdate: Bounty.findOneAndUpdate,
    enrollmentCreate: Enrollment.create,
    submissionCreate: Submission.create,
  };
  const startDate = new Date(Date.now() + 60_000);
  const inactiveBounty = {
    _id: bountyId,
    title: "Not yet open",
    archivedAt: null,
    lifecycleStatus: null,
    startDate,
    deadline: new Date(startDate.getTime() + 60_000),
    submissions: { count: 0, maxSubmissions: 1 },
  };
  let writeCalls = 0;
  Bounty.findById = () => queryFor(inactiveBounty);
  Bounty.findOneAndUpdate = async () => {
    writeCalls += 1;
    return inactiveBounty;
  };
  Enrollment.create = async () => {
    writeCalls += 1;
  };
  Submission.create = async () => {
    writeCalls += 1;
  };
  t.after(() => {
    Bounty.findById = originals.bountyFindById;
    Bounty.findOneAndUpdate = originals.bountyFindOneAndUpdate;
    Enrollment.create = originals.enrollmentCreate;
    Submission.create = originals.submissionCreate;
  });

  const enrollmentRes = response();
  await userEnrollment(
    { auth: { walletAddress: ownerWallet }, body: { bountyId } },
    enrollmentRes,
  );
  assert.equal(enrollmentRes.statusCode, 409);

  const submissionRes = response();
  await submit(
    {
      auth: { walletAddress: ownerWallet },
      body: {
        bountyId,
        description: "Work",
        projectLink: "https://example.test/work",
      },
    },
    submissionRes,
  );
  assert.equal(submissionRes.statusCode, 409);
  assert.equal(writeCalls, 0);
});

test("archived bounties reject new comments", async (t) => {
  const originalFindById = Bounty.findById;
  const originalCommentCreate = Comment.create;
  let commentWrites = 0;
  Bounty.findById = () =>
    queryFor({ _id: bountyId, archivedAt: new Date(), lifecycleStatus: null });
  Comment.create = async () => {
    commentWrites += 1;
  };
  t.after(() => {
    Bounty.findById = originalFindById;
    Comment.create = originalCommentCreate;
  });

  const res = response();
  await addComment(
    {
      auth: { walletAddress: ownerWallet },
      params: { bountyId },
      body: { text: "Archived bounty comment" },
    },
    res,
  );
  assert.equal(res.statusCode, 409);
  assert.equal(commentWrites, 0);
});
