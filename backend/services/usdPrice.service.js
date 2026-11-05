const { CHAINS } = require("../config/chains");

const COINPAPRIKA_TICKER_ID = "bot-bot-chain";
const COINPAPRIKA_TICKER_URL =
  `https://api.coinpaprika.com/v1/tickers/${COINPAPRIKA_TICKER_ID}`;
const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;
const MAX_QUOTE_AGE_MS = 15 * 60_000;
const FUTURE_CLOCK_TOLERANCE_MS = 60_000;
const quoteCache = new Map();
const inFlightQuotes = new Map();

const fail = (code, message) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const resolveAsset = ({ chainId, token, tokenDecimals }) => {
  const normalizedChainId = Number(chainId);
  const chainConfig = CHAINS[normalizedChainId];
  const currency = chainConfig?.chain?.nativeCurrency;
  if (!currency) {
    fail("USD_PRICE_UNSUPPORTED_ASSET", "No USD pricing is configured for this chain");
  }

  const normalizedToken = String(token || "").trim().toUpperCase();
  if (normalizedToken !== currency.symbol.toUpperCase()) {
    fail("USD_PRICE_UNSUPPORTED_ASSET", "No USD pricing is configured for this token");
  }
  if (
    tokenDecimals != null &&
    (!Number.isSafeInteger(Number(tokenDecimals)) ||
      Number(tokenDecimals) !== currency.decimals)
  ) {
    fail("USD_PRICE_ASSET_MISMATCH", "Token decimals do not match trusted chain configuration");
  }

  if (normalizedChainId === 5042 && normalizedToken === "USDC") {
    return {
      chainId: normalizedChainId,
      token: normalizedToken,
      tokenDecimals: currency.decimals,
      type: "peg",
    };
  }
  if (normalizedChainId === 677 && normalizedToken === "BOT") {
    return {
      chainId: normalizedChainId,
      token: normalizedToken,
      tokenDecimals: currency.decimals,
      type: "coinpaprika",
    };
  }

  fail("USD_PRICE_UNSUPPORTED_ASSET", "No USD pricing is configured for this asset");
};

const getPegQuote = (asset) => {
  const quotedAt = new Date().toISOString();
  return {
    chainId: asset.chainId,
    token: asset.token,
    tokenDecimals: asset.tokenDecimals,
    priceUsd: "1",
    source: "stablecoin-peg-assumption",
    sourceUrl: null,
    quotedAt,
    fetchedAt: quotedAt,
    cacheHit: false,
  };
};

const fetchBotQuote = async (asset) => {
  let response;
  try {
    response = await fetch(COINPAPRIKA_TICKER_URL, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    fail("USD_PRICE_PROVIDER_UNAVAILABLE", "CoinPaprika price request failed");
  }

  if (!response.ok) {
    fail("USD_PRICE_PROVIDER_UNAVAILABLE", "CoinPaprika price request failed");
  }

  let ticker;
  try {
    ticker = await response.json();
  } catch {
    fail("USD_PRICE_INVALID_RESPONSE", "CoinPaprika returned invalid JSON");
  }

  const rawPrice = ticker?.quotes?.USD?.price;
  const price = Number(rawPrice);
  const quotedAtMs = Date.parse(ticker?.last_updated);
  if (
    ticker?.id !== COINPAPRIKA_TICKER_ID ||
    (typeof rawPrice !== "number" && typeof rawPrice !== "string") ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(quotedAtMs)
  ) {
    fail("USD_PRICE_INVALID_RESPONSE", "CoinPaprika returned an invalid BOT price quote");
  }

  const now = Date.now();
  if (
    now - quotedAtMs > MAX_QUOTE_AGE_MS ||
    quotedAtMs - now > FUTURE_CLOCK_TOLERANCE_MS
  ) {
    fail("USD_PRICE_STALE", "CoinPaprika BOT price quote is stale");
  }

  return {
    chainId: asset.chainId,
    token: asset.token,
    tokenDecimals: asset.tokenDecimals,
    priceUsd: String(rawPrice),
    source: "coinpaprika",
    sourceUrl: COINPAPRIKA_TICKER_URL,
    quotedAt: new Date(quotedAtMs).toISOString(),
    fetchedAt: new Date(now).toISOString(),
    cacheHit: false,
  };
};

const getUsdPriceQuote = async (assetInput) => {
  const asset = resolveAsset(assetInput);
  if (asset.type === "peg") return getPegQuote(asset);

  const cacheKey = `${asset.chainId}:${asset.token}`;
  const now = Date.now();
  const cached = quoteCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return { ...cached.quote, cacheHit: true };
  }

  const pending = inFlightQuotes.get(cacheKey);
  if (pending) {
    const quote = await pending;
    return { ...quote, cacheHit: true };
  }

  const request = fetchBotQuote(asset);
  inFlightQuotes.set(cacheKey, request);
  try {
    const quote = await request;
    const quoteExpiresAt =
      Date.parse(quote.quotedAt) + MAX_QUOTE_AGE_MS;
    quoteCache.set(cacheKey, {
      quote,
      expiresAt: Math.min(Date.now() + CACHE_TTL_MS, quoteExpiresAt),
    });
    return quote;
  } finally {
    inFlightQuotes.delete(cacheKey);
  }
};

const clearUsdPriceCache = () => {
  quoteCache.clear();
};

module.exports = {
  clearUsdPriceCache,
  getUsdPriceQuote,
};
