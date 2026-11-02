import { NATIVE_TOKENS } from "./chains.address.js";

// Payout types for multiple winners
export const PayoutType = {
  SINGLE: 0,
  MULTI_EQUAL: 1,
  MULTI_PERCENTAGE: 2,
};

// For multiple winners, we have two options: equal split or percentage-based
export const getPayoutType = ({ winnersAllowed, payoutType }) => {
  if (winnersAllowed === 1 || payoutType === "SINGLE") return PayoutType.SINGLE;
  if (payoutType === "MULTI_EQUAL") return PayoutType.MULTI_EQUAL;
  if (payoutType === "MULTI_PERCENTAGE") return PayoutType.MULTI_PERCENTAGE;

  return PayoutType.SINGLE; // default to single if something's off
};

// ===============================
// 1. Contract Enum (Solidity mapping)
// Must match the Solidity enum order exactly.
// ===============================
export const TokenType = {
  NATIVE: 0,
};

// ===============================
// 2. Build per-chain UI → Internal map
// ===============================
export const buildUiTokenMap = (chainId) => {
  const map = {};

  const native = NATIVE_TOKENS[chainId];
  if (native) {
    map[native.symbol.toUpperCase()] = native.symbol;
    map["NATIVE"] = native.symbol;
  }

  return map;
};

// ===============================
// 3. Normalize UI token (chain-aware)
// ===============================
export const normalizeToken = (uiToken, chainId) => {
  if (!uiToken) throw new Error("Token is required");
  if (!chainId) throw new Error("chainId is required");

  const uiMap = buildUiTokenMap(chainId);
  const normalized = uiMap[uiToken.toUpperCase()];

  if (!normalized) {
    // Fallback: if matches chain's native token symbol
    const native = NATIVE_TOKENS[chainId];
    if (native && uiToken.toUpperCase() === native.symbol.toUpperCase()) {
      return native.symbol;
    }
    throw new Error(`Unsupported UI token "${uiToken}" on chain ${chainId}`);
  }

  return normalized;
};

// ===============================
// 4. Get token metadata (decimals, address) for a chain
// ===============================
export const getTokenMeta = (uiToken, chainId) => {
  if (!uiToken) throw new Error("Token is required");
  if (!chainId) throw new Error("chainId is required");

  const upper = uiToken.toUpperCase();
  const native = NATIVE_TOKENS[chainId];

  // Native token?
  if (native && (upper === native.symbol.toUpperCase() || upper === "NATIVE")) {
    return {
      kind: "native",
      symbol: native.symbol,
      decimals: native.decimals,
      address: null,
      tokenType: TokenType.NATIVE,
    };
  }

  throw new Error(`Unknown token "${uiToken}" on chain ${chainId}`);
};

// ===============================
// 5. Convenience: list tokens available on a chain (for UI dropdowns)
// ===============================
export const listTokensForChain = (chainId) => {
  const out = [];

  const native = NATIVE_TOKENS[chainId];
  if (native) {
    out.push({
      key: native.symbol,
      label: native.symbol,
      kind: "native",
      decimals: native.decimals,
      tokenType: TokenType.NATIVE,
    });
  }

  return out;
};
