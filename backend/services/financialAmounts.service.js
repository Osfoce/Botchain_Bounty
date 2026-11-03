const { formatUnits } = require("viem");
const { CHAINS } = require("../config/chains");

const getTokenDecimals = (chainId) => {
  const decimals = CHAINS[Number(chainId)]?.chain?.nativeCurrency?.decimals;
  if (!Number.isSafeInteger(decimals) || decimals < 0) {
    throw new Error(`Trusted token decimals are not configured for chain ${chainId}`);
  }
  return decimals;
};

const getMaximumTokenDecimals = () =>
  Math.max(...Object.keys(CHAINS).map((chainId) => getTokenDecimals(chainId)));

const decimalToBaseUnits = (value, decimals) => {
  const normalized = String(value ?? "0").trim();
  if (normalized.length > 256) {
    throw new Error("Decimal amount exceeds the supported length");
  }
  const match = normalized.match(/^(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) throw new Error("Decimal amount is invalid");

  const fraction = match[2] || "";
  const exponent = Number(match[3] || 0);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 100) {
    throw new Error("Decimal amount has an unsupported exponent");
  }
  const digits = `${match[1]}${fraction}`.replace(/^0+(?=\d)/, "");
  const scale = fraction.length - exponent;
  if (scale > decimals) {
    throw new Error("Decimal amount exceeds the configured token precision");
  }

  const scaled = `${digits}${"0".repeat(decimals - scale)}`;
  return BigInt(scaled || "0");
};

const getTotalEarnings = (user) => {
  const totalDecimals = getMaximumTokenDecimals();
  let total = decimalToBaseUnits(user.totalEarnings || 0, totalDecimals);

  for (const reward of user.claimedRewards || []) {
    if (reward.accountingVersion !== "base-units-v1") continue;
    if (!/^[0-9]+$/.test(String(reward.amountWei))) {
      throw new Error("Claim ledger contains an invalid base-unit amount");
    }
    const rewardDecimals = getTokenDecimals(reward.chainId);
    total +=
      BigInt(reward.amountWei) *
      10n ** BigInt(totalDecimals - rewardDecimals);
  }

  return formatUnits(total, totalDecimals);
};

const formatRewardAmount = (amountWei, chainId) => {
  if (!/^[0-9]+$/.test(String(amountWei))) {
    throw new Error("Reward amount is not a valid base-unit value");
  }
  return formatUnits(BigInt(amountWei), getTokenDecimals(chainId));
};

const sumRewardAmounts = (rewards) => {
  const totalDecimals = rewards.reduce(
    (max, reward) => Math.max(max, getTokenDecimals(reward.chainId)),
    0,
  );
  let total = 0n;
  for (const reward of rewards) {
    const rewardDecimals = getTokenDecimals(reward.chainId);
    if (!/^[0-9]+$/.test(String(reward.amount))) {
      throw new Error(`Invalid stored reward amount for reward ${reward._id}`);
    }
    total +=
      BigInt(reward.amount) *
      10n ** BigInt(totalDecimals - rewardDecimals);
  }

  return formatUnits(total, totalDecimals);
};

const sumBountyBudgets = (bounties) => {
  const totalDecimals = bounties.reduce(
    (max, bounty) => Math.max(max, getTokenDecimals(bounty.network)),
    0,
  );
  let total = 0n;
  for (const bounty of bounties) {
    const bountyDecimals = getTokenDecimals(bounty.network);
    let amount;
    if (bounty.rewardWei != null) {
      if (!/^[0-9]+$/.test(String(bounty.rewardWei))) {
        throw new Error(`Invalid stored bounty amount for bounty ${bounty._id}`);
      }
      amount = BigInt(bounty.rewardWei);
    } else {
      amount = decimalToBaseUnits(bounty.reward, bountyDecimals);
    }
    total += amount * 10n ** BigInt(totalDecimals - bountyDecimals);
  }
  return formatUnits(total, totalDecimals);
};

const sumClaimedRewardHistory = (claimedRewards) => {
  const totalDecimals = getMaximumTokenDecimals();
  let total = 0n;
  for (const reward of claimedRewards || []) {
    const decimals =
      reward.chainId == null ? totalDecimals : getTokenDecimals(reward.chainId);
    if (/^[0-9]+$/.test(String(reward.amountWei ?? ""))) {
      total +=
        BigInt(reward.amountWei) *
        10n ** BigInt(totalDecimals - decimals);
    } else if (reward.amountFormatted != null) {
      total += decimalToBaseUnits(reward.amountFormatted, totalDecimals);
    } else {
      throw new Error("Claim history contains no exact reward amount");
    }
  }
  return formatUnits(total, totalDecimals);
};

module.exports = {
  decimalToBaseUnits,
  formatRewardAmount,
  getMaximumTokenDecimals,
  getTokenDecimals,
  getTotalEarnings,
  sumBountyBudgets,
  sumClaimedRewardHistory,
  sumRewardAmounts,
};
