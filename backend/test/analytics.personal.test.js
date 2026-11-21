const test = require("node:test");
const assert = require("node:assert/strict");
const Bounty = require("../modules/bounty.module");
const Reward = require("../modules/reward.module");
const Submission = require("../modules/submission.module");
const { getWalletAnalytics } = require("../controller/analytics.controller");

const makeQuery = (result) => ({
  sort() {
    return this;
  },
  select() {
    return this;
  },
  lean: async () => result,
});

test("combined analytics keeps creator and contributor figures separate", async (t) => {
  const originalMethods = {
    bountyFind: Bounty.find,
    submissionFind: Submission.find,
    rewardFind: Reward.find,
  };
  const wallets = {
    creatorOnly: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    contributorOnly: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    mixed: "0xcccccccccccccccccccccccccccccccccccccccc",
    otherCreator: "0xdddddddddddddddddddddddddddddddddddddddd",
  };
  const bounties = [
    {
      _id: "creator-only-bounty",
      creator: wallets.creatorOnly,
      category: "Development",
      reward: 2,
      network: 5042,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      startDate: new Date("2026-01-01T00:00:00Z"),
      deadline: new Date("2027-01-01T00:00:00Z"),
    },
    {
      _id: "contributor-bounty",
      creator: wallets.otherCreator,
      category: "Design",
      reward: 1,
      network: 5042,
      createdAt: new Date("2026-02-01T00:00:00Z"),
      startDate: new Date("2026-02-01T00:00:00Z"),
      deadline: new Date("2027-02-01T00:00:00Z"),
    },
    {
      _id: "mixed-created-bounty",
      creator: wallets.mixed,
      category: "Research",
      reward: 3,
      network: 5042,
      createdAt: new Date("2026-03-01T00:00:00Z"),
      startDate: new Date("2026-03-01T00:00:00Z"),
      deadline: new Date("2027-03-01T00:00:00Z"),
    },
  ];
  const submissions = [
    {
      _id: "contributor-submission",
      bountyId: "contributor-bounty",
      bountyTitle: "Contributor task",
      user: wallets.contributorOnly,
      status: "accepted",
      submittedAt: new Date("2026-04-01T00:00:00Z"),
    },
    {
      _id: "mixed-own-submission",
      bountyId: "contributor-bounty",
      bountyTitle: "Contributor task",
      user: wallets.mixed,
      status: "pending",
      submittedAt: new Date("2026-04-02T00:00:00Z"),
    },
    {
      _id: "mixed-created-bounty-submission",
      bountyId: "mixed-created-bounty",
      bountyTitle: "Bounty owned by mixed user",
      user: wallets.otherCreator,
      status: "accepted",
      submittedAt: new Date("2026-04-03T00:00:00Z"),
    },
  ];

  Bounty.find = (filter) => {
    if (filter.creator?.$regex) {
      const owner = filter.creator.$regex.slice(1, -1);
      return makeQuery(bounties.filter((bounty) => bounty.creator === owner));
    }
    if (filter._id?.$in) {
      const ids = new Set(filter._id.$in.map(String));
      return makeQuery(bounties.filter((bounty) => ids.has(String(bounty._id))));
    }
    return makeQuery([]);
  };
  Submission.find = (filter) => {
    if (filter.user) {
      return makeQuery(submissions.filter((submission) => submission.user === filter.user));
    }
    if (filter.bountyId?.$in) {
      const ids = new Set(filter.bountyId.$in.map(String));
      return makeQuery(submissions.filter((submission) => ids.has(String(submission.bountyId))));
    }
    return makeQuery([]);
  };
  Reward.find = () => makeQuery([]);

  t.after(() => {
    Bounty.find = originalMethods.bountyFind;
    Submission.find = originalMethods.submissionFind;
    Reward.find = originalMethods.rewardFind;
  });

  const fetchAnalytics = async (wallet) => {
    let status;
    let body;
    await getWalletAnalytics(
      { params: { wallet } },
      {
        status(value) {
          status = value;
          return this;
        },
        json(value) {
          body = value;
          return this;
        },
      },
    );
    assert.equal(status, 200);
    return body;
  };

  const creatorOnly = await fetchAnalytics(wallets.creatorOnly);
  assert.equal(creatorOnly.creator.overview.bountiesCreated, 1);
  assert.equal(creatorOnly.contributor.overview.totalSubmissions, 0);
  assert.equal(creatorOnly.overview.totalContributions, 0);

  const contributorOnly = await fetchAnalytics(wallets.contributorOnly);
  assert.equal(contributorOnly.creator.overview.bountiesCreated, 0);
  assert.equal(contributorOnly.contributor.overview.totalSubmissions, 1);
  assert.equal(contributorOnly.contributor.submissions.accepted, 1);
  assert.equal(contributorOnly.overview.bountiesCreated, 0);

  const mixed = await fetchAnalytics(wallets.mixed);
  assert.equal(mixed.creator.overview.bountiesCreated, 1);
  assert.equal(mixed.creator.overview.totalSubmissions, 1);
  assert.equal(mixed.contributor.overview.totalSubmissions, 1);
  assert.equal(mixed.contributor.submissions.pending, 1);
  assert.equal(mixed.overview.bountiesCreated, 1);
  assert.equal(mixed.overview.totalContributions, 1);
});
