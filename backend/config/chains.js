// chains.js
const { arcTestnet } = require("viem/chains");
const { createPublicClient, http } = require("viem");

const readBlockNumber = (name, fallback = 0) => {
  const rawValue = process.env[name];
  if (rawValue == null || rawValue === "") return fallback;
  if (!/^[0-9]+$/.test(rawValue)) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  const value = Number(rawValue);
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${name} exceeds the supported block-number range`);
  }
  return value;
};

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

const botchainMainnet = {
  id: 677,
  name: "BOT Chain",
  // iconUrl: botIcon,
  iconBackground: "#080908",

  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: ["https://rpc.botchain.ai"],
    },
  },

  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: "https://scan.botchain.ai",
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

const bountyContract = "0x498482e334269a10d0621D3AC5e726734B01DDCe";

const CHAINS = {
  5042002: {
    chain: arcTestnet,
    bountyContract,
    deploymentBlock: readBlockNumber("ARC_TESTNET_BOUNTY_DEPLOYMENT_BLOCK"),
    confirmationDepth: readBlockNumber("ARC_TESTNET_CONFIRMATION_DEPTH", 2),
  },
  5042: {
    chain: arcMainnet,
    bountyContract,
    deploymentBlock: readBlockNumber("ARC_BOUNTY_DEPLOYMENT_BLOCK"),
    confirmationDepth: readBlockNumber("ARC_CONFIRMATION_DEPTH", 12),
  },
  677: {
    chain: botchainMainnet,
    bountyContract,
    deploymentBlock: readBlockNumber("BOTCHAIN_BOUNTY_DEPLOYMENT_BLOCK"),
    confirmationDepth: readBlockNumber("BOTCHAIN_CONFIRMATION_DEPTH", 12),
  },
  968: {
    chain: botchainTestnet,
    bountyContract,
    deploymentBlock: readBlockNumber("BOTCHAIN_TESTNET_BOUNTY_DEPLOYMENT_BLOCK"),
    confirmationDepth: readBlockNumber("BOTCHAIN_TESTNET_CONFIRMATION_DEPTH", 2),
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

module.exports = {
  CHAINS,
  getPublicClient,
  botchainMainnet,
  botchainTestnet,
  arcMainnet,
};
