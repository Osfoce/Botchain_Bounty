export const CHAIN_IDS = {
  ARC_MAINNET: 5042,
  BOTCHAIN_TESTNET: 968,
};

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.ARC_MAINNET]: {
    bounty: "0x498482e334269a10d0621D3AC5e726734B01DDCe",
  },
  [CHAIN_IDS.BOTCHAIN_TESTNET]: {
    bounty: "0x498482e334269a10d0621D3AC5e726734B01DDCe",
  },
};

export const NATIVE_TOKENS = {
  [CHAIN_IDS.ARC_MAINNET]: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  [CHAIN_IDS.BOTCHAIN_TESTNET]: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
};

export const BLOCK_EXPLORERS = {
  [CHAIN_IDS.ARC_MAINNET]: {
    name: "Arc Explorer",
    url: "https://explorer.arc.io",
  },
  [CHAIN_IDS.BOTCHAIN_TESTNET]: {
    name: "BohrScan",
    url: "https://scan.bohr.life",
  },
};

/**
 * Resolve the bounty contract address for a chain.
 * Accepts number or string; returns undefined if not deployed.
 */
export const getBountyContract = (chainId) => {
  if (chainId == null) return undefined;
  const normalized = Number(chainId);
  if (!Number.isFinite(normalized)) return undefined;
  return CONTRACT_ADDRESSES[normalized]?.bounty;
};

/**
 * Resolve the native token config for a chain.
 */
export const getNativeToken = (chainId) => {
  if (chainId == null) return undefined;
  const normalized = Number(chainId);
  if (!Number.isFinite(normalized)) return undefined;
  return NATIVE_TOKENS[normalized];
};

/**
 * Resolve the block explorer configuration for a chain.
 */
export const getExplorerConfig = (chainId) => {
  if (chainId == null) return undefined;
  const normalized = Number(chainId);
  if (!Number.isFinite(normalized)) return undefined;
  return BLOCK_EXPLORERS[normalized];
};

/**
 * Generate a block explorer link for a transaction or address.
 * @param {number|string} chainId
 * @param {string} identifier - txHash or address
 * @param {'tx'|'address'} type
 * @returns {string|null}
 */
export const getExplorerUrl = (chainId, identifier, type = "tx") => {
  if (!identifier) return null;
  const explorer = getExplorerConfig(chainId);
  if (!explorer?.url) return null;
  const baseUrl = explorer.url.replace(/\/+$/, "");
  const path = type === "address" ? "address" : "tx";
  return `${baseUrl}/${path}/${identifier}`;
};
