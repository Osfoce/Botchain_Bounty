const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const Submission = require("../modules/submission.module");
const AuthSession = require("../modules/authSession.module");
const analyticsRoutes = require("../routes/analytics.route");
const { hashToken } = require("../middleware/auth");

const emptyQuery = (result = []) => ({
  sort() {
    return this;
  },
  limit() {
    return this;
  },
  select() {
    return this;
  },
  lean: async () => result,
});

test("platform and creator analytics URLs are mounted and return analytics data", async (t) => {
  const originals = {
    bountyAggregate: Bounty.aggregate,
    bountyFind: Bounty.find,
    rewardAggregate: Reward.aggregate,
    rewardFind: Reward.find,
    submissionAggregate: Submission.aggregate,
    submissionFind: Submission.find,
    sessionFindOne: AuthSession.findOne,
    sessionFindOneAndUpdate: AuthSession.findOneAndUpdate,
  };
  Bounty.aggregate = async () => [];
  Bounty.find = () => emptyQuery();
  Reward.aggregate = async () => [];
  Reward.find = () => emptyQuery();
  Submission.aggregate = async () => [];
  Submission.find = () => emptyQuery();
  const token = "A".repeat(43);
  const session = {
    _id: "analytics-test-session",
    tokenHash: hashToken(token),
    walletAddress: "0x579f49af31375da97b6ba3cf0aa4a887a0e6c98b",
    chainId: 5042,
    expiresAt: new Date(Date.now() + 60_000),
    absoluteExpiresAt: new Date(Date.now() + 60_000),
  };
  AuthSession.findOne = () => ({ lean: async () => session });
  AuthSession.findOneAndUpdate = (_filter, update) => ({
    lean: async () => ({ ...session, ...update.$set }),
  });
  t.after(() => {
    Bounty.aggregate = originals.bountyAggregate;
    Bounty.find = originals.bountyFind;
    Reward.aggregate = originals.rewardAggregate;
    Reward.find = originals.rewardFind;
    Submission.aggregate = originals.submissionAggregate;
    Submission.find = originals.submissionFind;
    AuthSession.findOne = originals.sessionFindOne;
    AuthSession.findOneAndUpdate = originals.sessionFindOneAndUpdate;
  });

  const app = express();
  app.use("/api", analyticsRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const platformResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/platform`,
  );
  assert.equal(platformResponse.status, 200);
  assert.ok((await platformResponse.json()).overview);

  const creatorResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/creator/0x579F49Af31375Da97b6Ba3cf0Aa4a887A0E6c98b`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  assert.equal(creatorResponse.status, 200);
  assert.ok((await creatorResponse.json()).overview);
});
