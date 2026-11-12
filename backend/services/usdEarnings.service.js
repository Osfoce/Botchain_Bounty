const { formatUnits } = require("viem");
const { CHAINS } = require("../config/chains");
const { decimalToBaseUnits } = require("./financialAmounts.service");
const { getUsdPriceQuote } = require("./usdPrice.service");

const PRICE_DECIMALS = 30;
const USD_DECIMALS = 6;

const getUsdEarnings = async ({ rewards = [], legacyTotal = 0 } = {}) => {
  const grouped = new Map();
  let unattributedRewards = 0;

  for (const reward of rewards) {
    if (!/^[0-9]+$/.test(String(reward.amountWei ?? ""))) {
      unattributedRewards += 1;
      continue;
    }

    const chainId = Number(reward.chainId);
    const chain = CHAINS[chainId]?.chain;
    const token = String(
      reward.token || chain?.nativeCurrency?.symbol || "",
    ).toUpperCase();
    const tokenDecimals = Number(
      reward.tokenDecimals ?? chain?.nativeCurrency?.decimals,
    );
    if (
      !Number.isSafeInteger(chainId) ||
      !token ||
      !Number.isSafeInteger(tokenDecimals) ||
      tokenDecimals < 0
    ) {
      unattributedRewards += 1;
      continue;
    }

    const key = `${chainId}:${token}`;
    const group = grouped.get(key) || {
      chainId,
      token,
      tokenDecimals,
      amountWei: 0n,
    };
    if (group.tokenDecimals !== tokenDecimals) {
      unattributedRewards += 1;
      continue;
    }
    group.amountWei += BigInt(reward.amountWei);
    grouped.set(key, group);
  }

  const breakdown = await Promise.all(
    [...grouped.values()].map(async (group) => {
      const quote = await getUsdPriceQuote(group);
      const priceUnits = decimalToBaseUnits(quote.priceUsd, PRICE_DECIMALS);
      const denominator =
        10n ** BigInt(group.tokenDecimals + PRICE_DECIMALS);
      const usdMicros =
        (group.amountWei * priceUnits * 10n ** BigInt(USD_DECIMALS) +
          denominator / 2n) /
        denominator;

      return {
        chainId: group.chainId,
        token: group.token,
        amount: formatUnits(group.amountWei, group.tokenDecimals),
        amountUsd: formatUnits(usdMicros, USD_DECIMALS),
        priceUsd: quote.priceUsd,
        priceSource: quote.source,
        quotedAt: quote.quotedAt,
      };
    }),
  );

  const legacyValue = Number(legacyTotal);
  const hasUnattributedLegacyEarnings =
    !Number.isFinite(legacyValue) || legacyValue !== 0;
  const totalMicros = breakdown.reduce(
    (total, item) =>
      total + decimalToBaseUnits(item.amountUsd, USD_DECIMALS),
    0n,
  );
  const complete =
    !hasUnattributedLegacyEarnings && unattributedRewards === 0;

  return {
    status: complete ? "complete" : "incomplete",
    totalEarningsUsd: complete
      ? formatUnits(totalMicros, USD_DECIMALS)
      : null,
    breakdown,
    unattributedRewards,
    hasUnattributedLegacyEarnings,
    quotedAt:
      breakdown.length > 0
        ? breakdown
            .map((item) => item.quotedAt)
            .sort()
            .at(-1)
        : null,
  };
};

module.exports = { getUsdEarnings };
