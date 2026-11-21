const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const Submission = require("../modules/submission.module");
const AuthSession = require("../modules/authSession.module");
const originalAdminWallets = process.env.ADMIN_WALLETS;
const adminWallet = "0x579f49af31375da97b6ba3cf0aa4a887a0e6c98b";
process.env.ADMIN_WALLETS = adminWallet;
const analyticsRoutes = require("../routes/analytics.route");
const { hashToken } = require("../middleware/auth");
if (originalAdminWallets === undefined) {
  delete process.env.ADMIN_WALLETS;
} else {
  process.env.ADMIN_WALLETS = originalAdminWallets;
}

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

test("platform analytics is admin-only while personal analytics remains self-accessible", async (t) => {
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
  const adminToken = "A".repeat(43);
  const userToken = "B".repeat(43);
  const sessions = new Map([
    [hashToken(adminToken), {
      _id: "analytics-admin-session",
      walletAddress: adminWallet,
      chainId: 5042,
      expiresAt: new Date(Date.now() + 60_000),
      absoluteExpiresAt: new Date(Date.now() + 60_000),
    }],
    [hashToken(userToken), {
      _id: "analytics-user-session",
      walletAddress: "0x1111111111111111111111111111111111111111",
      chainId: 5042,
      expiresAt: new Date(Date.now() + 60_000),
      absoluteExpiresAt: new Date(Date.now() + 60_000),
    }],
  ]);
  AuthSession.findOne = ({ tokenHash }) => ({
    lean: async () => sessions.get(tokenHash) || null,
  });
  AuthSession.findOneAndUpdate = (filter, update) => ({
    lean: async () => {
      const session = [...sessions.values()].find(
        (candidate) => String(candidate._id) === String(filter._id),
      );
      return session ? { ...session, ...update.$set } : null;
    },
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
  const anonymousPlatformResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/platform`,
  );
  assert.equal(anonymousPlatformResponse.status, 401);

  const regularUserPlatformResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/platform`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  assert.equal(regularUserPlatformResponse.status, 403);

  const anonymousMyAnalyticsResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/me/0x1111111111111111111111111111111111111111`,
  );
  assert.equal(anonymousMyAnalyticsResponse.status, 401);

  const platformResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/platform`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
  );
  assert.equal(platformResponse.status, 200);
  assert.ok((await platformResponse.json()).overview);

  const creatorResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/creator/0x579F49Af31375Da97b6Ba3cf0Aa4a887A0E6c98b`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
  );
  assert.equal(creatorResponse.status, 200);
  const creatorAnalytics = await creatorResponse.json();
  assert.ok(creatorAnalytics.overview);
  assert.equal(creatorAnalytics.overview.totalRewardsClaimedUsd, "0");
  assert.equal(creatorAnalytics.overview.rewardsClaimedUsdStatus, "complete");
  const contributorResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/contributor/0x1111111111111111111111111111111111111111`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  assert.equal(contributorResponse.status, 200);
  assert.ok((await contributorResponse.json()).overview);

  const myAnalyticsResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/me/0x1111111111111111111111111111111111111111`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  assert.equal(myAnalyticsResponse.status, 200);
  const myAnalytics = await myAnalyticsResponse.json();
  assert.ok(myAnalytics.creator?.overview);
  assert.ok(myAnalytics.contributor?.overview);
  assert.equal(myAnalytics.overview.bountiesCreated, 0);
  assert.equal(myAnalytics.overview.totalContributions, 0);
  assert.equal(myAnalytics.creator.overview.bountiesCreated, 0);
  assert.equal(myAnalytics.contributor.overview.totalSubmissions, 0);

  const legacyMyAnalyticsResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/my/0x1111111111111111111111111111111111111111`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  assert.equal(legacyMyAnalyticsResponse.status, 200);
  const legacyMyAnalytics = await legacyMyAnalyticsResponse.json();
  assert.ok(legacyMyAnalytics.creator?.overview);
  assert.ok(legacyMyAnalytics.contributor?.overview);

  const otherWalletCreatorResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/creator/0x579F49Af31375Da97b6Ba3cf0Aa4a887A0E6c98b`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  assert.equal(otherWalletCreatorResponse.status, 403);

  const otherWalletMyAnalyticsResponse = await fetch(
    `http://127.0.0.1:${port}/api/analytics/me/0x579F49Af31375Da97b6Ba3cf0Aa4a887A0E6c98b`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  assert.equal(otherWalletMyAnalyticsResponse.status, 403);
});
