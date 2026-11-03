const test = require("node:test");
const assert = require("node:assert/strict");
const {
  decimalToBaseUnits,
  formatRewardAmount,
  getTotalEarnings,
  sumBountyBudgets,
  sumRewardAmounts,
} = require("../services/financialAmounts.service");
const { serializeBounty } = require("../utils/serializers");
const User = require("../modules/user.module");

test("base-unit conversion preserves values beyond floating-point precision", () => {
  assert.equal(
    decimalToBaseUnits("9007199254740993.000000000000000001", 18),
    9007199254740993000000000000000001n,
  );
  assert.equal(decimalToBaseUnits("1e-18", 18), 1n);
  assert.equal(
    formatRewardAmount("9007199254740993000000000000000001", 5042),
    "9007199254740993.000000000000000001",
  );
});

test("earnings combines legacy totals and exact new claim ledger entries", () => {
  assert.equal(
    getTotalEarnings({
      totalEarnings: 1.25,
      claimedRewards: [
        { accountingVersion: "base-units-v1", chainId: 5042, amountWei: "1" },
        { amountWei: "9000000000000000000" },
      ],
    }),
    "1.250000000000000001",
  );
});

test("reward arithmetic normalizes trusted tokens with different decimal counts", (t) => {
  const originalDecimals = require("../config/chains").CHAINS[968].chain.nativeCurrency.decimals;
  require("../config/chains").CHAINS[968].chain.nativeCurrency.decimals = 6;
  t.after(() => {
    require("../config/chains").CHAINS[968].chain.nativeCurrency.decimals = originalDecimals;
  });

  assert.equal(
    sumRewardAmounts([
      { amount: "1", chainId: 5042 },
      { amount: "1000000", chainId: 968 },
    ]),
    "1.000000000000000001",
  );
});

test("reward totals add base-unit strings without floating-point arithmetic", () => {
  assert.equal(
    sumRewardAmounts([
      { amount: "9007199254740993000000000000000001", chainId: 5042 },
      { amount: "1", chainId: 968 },
    ]),
    "9007199254740993.000000000000000002",
  );
});

test("bounty budgets prefer verified base units and sum legacy decimals exactly", () => {
  assert.equal(
    sumBountyBudgets([
      { rewardWei: "9007199254740993000000000000000001", network: "5042" },
      { reward: 0.000000000000000001, network: "968" },
    ]),
    "9007199254740993.000000000000000002",
  );
});

test("bounty serialization presents verified base units without rounding", () => {
  const serialized = serializeBounty({
    _id: "bounty-id",
    title: "Exact payout",
    creator: "0x0000000000000000000000000000000000000001",
    network: "5042",
    reward: 9007199254740992,
    rewardWei: "9007199254740993000000000000000001",
    token: "USDC",
    submissions: {},
  });

  assert.equal(serialized.reward, "9007199254740993.000000000000000001");
});

test("claimed reward virtual sums exact ledger amounts", () => {
  const user = new User({
    walletAddress: "0x0000000000000000000000000000000000000001",
    claimedRewards: [
      {
        bountyId: "bounty-id",
        bountyTitle: "Exact claim",
        chainId: 5042,
        amountWei: "1000000000000000001",
        amountFormatted: "1.000000000000000001",
      },
    ],
  });

  assert.equal(user.totalClaimedRewards, "1.000000000000000001");
});
