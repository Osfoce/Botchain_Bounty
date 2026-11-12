const test = require("node:test");
const assert = require("node:assert/strict");
const { clearUsdPriceCache } = require("../services/usdPrice.service");
const { getUsdEarnings } = require("../services/usdEarnings.service");

const tickerId = "bot-bot-chain";
const botReward = {
  chainId: 677,
  token: "BOT",
  tokenDecimals: 18,
  amountWei: "2000000000000000000",
};

const response = (body) => ({
  ok: true,
  json: async () => body,
});

test("USD earnings totals different supported assets after price conversion", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  global.fetch = async () =>
    response({
      id: tickerId,
      last_updated: new Date().toISOString(),
      quotes: { USD: { price: 0.125 } },
    });
  t.after(() => {
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  const result = await getUsdEarnings({
    rewards: [
      {
        chainId: 5042,
        token: "USDC",
        tokenDecimals: 18,
        amountWei: "1000000000000000000",
      },
      botReward,
    ],
  });

  assert.equal(result.status, "complete");
  assert.equal(result.totalEarningsUsd, "1.25");
  assert.deepEqual(
    result.breakdown.map(({ token, amount, amountUsd, priceSource }) => ({
      token,
      amount,
      amountUsd,
      priceSource,
    })),
    [
      {
        token: "USDC",
        amount: "1",
        amountUsd: "1",
        priceSource: "stablecoin-peg-assumption",
      },
      {
        token: "BOT",
        amount: "2",
        amountUsd: "0.25",
        priceSource: "coinpaprika",
      },
    ],
  );
  assert.ok(result.quotedAt);
});

test("unattributed legacy totals suppress the USD total but retain priced breakdown", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  global.fetch = async () =>
    response({
      id: tickerId,
      last_updated: new Date().toISOString(),
      quotes: { USD: { price: 0.5 } },
    });
  t.after(() => {
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  const result = await getUsdEarnings({
    rewards: [botReward],
    legacyTotal: 7,
  });

  assert.equal(result.status, "incomplete");
  assert.equal(result.totalEarningsUsd, null);
  assert.equal(result.hasUnattributedLegacyEarnings, true);
  assert.equal(result.breakdown[0].amountUsd, "1");
});

test("rewards without enough identity are explicitly marked incomplete", async () => {
  const result = await getUsdEarnings({
    rewards: [{ amountWei: "1000" }],
  });

  assert.equal(result.status, "incomplete");
  assert.equal(result.totalEarningsUsd, null);
  assert.equal(result.unattributedRewards, 1);
});

test("provider failure is surfaced instead of returning a zero valuation", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("provider offline");
  };
  t.after(() => {
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  await assert.rejects(getUsdEarnings({ rewards: [botReward] }), {
    code: "USD_PRICE_PROVIDER_UNAVAILABLE",
  });
});
