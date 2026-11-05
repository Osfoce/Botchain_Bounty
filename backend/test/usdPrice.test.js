const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clearUsdPriceCache,
  getUsdPriceQuote,
} = require("../services/usdPrice.service");

const botAsset = { chainId: 677, token: "BOT", tokenDecimals: 18 };
const tickerId = "bot-bot-chain";

const response = (body, { ok = true } = {}) => ({
  ok,
  json: async () => body,
});

test("Arc USDC uses an explicitly labeled one-dollar peg assumption", async () => {
  const quote = await getUsdPriceQuote({
    chainId: 5042,
    token: "USDC",
    tokenDecimals: 18,
  });

  assert.equal(quote.priceUsd, "1");
  assert.equal(quote.source, "stablecoin-peg-assumption");
  assert.equal(quote.quotedAt, quote.fetchedAt);
  assert.equal(quote.cacheHit, false);
});

test("BOT quotes validate CoinPaprika data and cache valid results", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async (url, options) => {
    calls += 1;
    assert.equal(
      url,
      `https://api.coinpaprika.com/v1/tickers/${tickerId}`,
    );
    assert.equal(options.headers.accept, "application/json");
    assert.ok(options.signal);
    return response({
      id: tickerId,
      last_updated: new Date().toISOString(),
      quotes: { USD: { price: 0.125 } },
    });
  };
  t.after(() => {
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  const first = await getUsdPriceQuote(botAsset);
  const second = await getUsdPriceQuote(botAsset);

  assert.equal(first.priceUsd, "0.125");
  assert.equal(first.source, "coinpaprika");
  assert.match(first.sourceUrl, /api\.coinpaprika\.com/);
  assert.equal(first.cacheHit, false);
  assert.equal(second.cacheHit, true);
  assert.equal(calls, 1);
});

test("concurrent BOT quote requests share one provider request", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return response({
      id: tickerId,
      last_updated: new Date().toISOString(),
      quotes: { USD: { price: "0.25" } },
    });
  };
  t.after(() => {
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  const quotes = await Promise.all([
    getUsdPriceQuote(botAsset),
    getUsdPriceQuote(botAsset),
  ]);

  assert.equal(calls, 1);
  assert.deepEqual(quotes.map((quote) => quote.priceUsd), ["0.25", "0.25"]);
});

test("cached BOT quotes expire at the provider freshness boundary", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  const originalDateNow = Date.now;
  const baseTime = originalDateNow();
  let now = baseTime;
  let calls = 0;
  Date.now = () => now;
  global.fetch = async () => {
    calls += 1;
    return response({
      id: tickerId,
      last_updated: new Date(
        calls === 1 ? baseTime - 14 * 60_000 - 59_000 : now,
      ).toISOString(),
      quotes: { USD: { price: 0.5 } },
    });
  };
  t.after(() => {
    Date.now = originalDateNow;
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  await getUsdPriceQuote(botAsset);
  now += 2_000;
  const refreshed = await getUsdPriceQuote(botAsset);

  assert.equal(calls, 2);
  assert.equal(refreshed.cacheHit, false);
});

test("unsupported assets and mismatched decimals are rejected", async () => {
  await assert.rejects(
    getUsdPriceQuote({ chainId: 968, token: "BOT", tokenDecimals: 18 }),
    { code: "USD_PRICE_UNSUPPORTED_ASSET" },
  );
  await assert.rejects(
    getUsdPriceQuote({ chainId: 677, token: "BOT", tokenDecimals: 6 }),
    { code: "USD_PRICE_ASSET_MISMATCH" },
  );
  await assert.rejects(
    getUsdPriceQuote({ chainId: 677, token: "USDC", tokenDecimals: 18 }),
    { code: "USD_PRICE_UNSUPPORTED_ASSET" },
  );
});

test("BOT quotes reject provider failures, wrong assets, invalid prices, and stale data", async (t) => {
  clearUsdPriceCache();
  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
    clearUsdPriceCache();
  });

  global.fetch = async () => response({}, { ok: false });
  await assert.rejects(getUsdPriceQuote(botAsset), {
    code: "USD_PRICE_PROVIDER_UNAVAILABLE",
  });

  global.fetch = async () =>
    response({
      id: "different-asset",
      last_updated: new Date().toISOString(),
      quotes: { USD: { price: 1 } },
    });
  await assert.rejects(getUsdPriceQuote(botAsset), {
    code: "USD_PRICE_INVALID_RESPONSE",
  });

  global.fetch = async () =>
    response({
      id: tickerId,
      last_updated: new Date().toISOString(),
      quotes: { USD: { price: 0 } },
    });
  await assert.rejects(getUsdPriceQuote(botAsset), {
    code: "USD_PRICE_INVALID_RESPONSE",
  });

  global.fetch = async () =>
    response({
      id: tickerId,
      last_updated: new Date(Date.now() - 16 * 60_000).toISOString(),
      quotes: { USD: { price: 1 } },
    });
  await assert.rejects(getUsdPriceQuote(botAsset), {
    code: "USD_PRICE_STALE",
  });
});
