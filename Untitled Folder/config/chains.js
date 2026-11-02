// chains.js
const { arcTestnet } = require("viem/chains");
const { createPublicClient, http } = require("viem");

const arcMainnet = {
  id: 5042,
  name: "Arc",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.arc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.io",
    },
  },
  testnet: false,
};

const botchainTestnet = {
  id: 968,
  name: "BOT Chain Testnet (Bohr)",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "BohrScan",
      url: "https://scan.bohr.life",
    },
  },
  testnet: true,
};

const CHAINS = {
  5042002: {
    chain: arcTestnet,
  },
  5042: {
    chain: arcMainnet,
  },
  968: {
    chain: botchainTestnet,
  },
};

const getPublicClient = (chainId) => {
  const normalized = Number(chainId);
  const config = CHAINS[normalized];

  if (!config) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpc ?? config.chain.rpcUrls.default.http[0]),
  });
};

module.exports = { CHAINS, getPublicClient, botchainTestnet, arcMainnet };
