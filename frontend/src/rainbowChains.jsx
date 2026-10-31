
// Import network icons from src/assets/images
import arcIcon from "./assets/images/arc.png";
import botIcon from "./assets/images/bot.png";

// Supported Wagmi / RainbowKit Chains

export const arcMainnet = {
  id: 5042,
  name: "Arc",
  iconUrl: arcIcon,
  iconBackground: "#080908",

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

export const botchainTestnet = {
  id: 968,
  name: "BOT Chain Testnet (Bohr)",
  iconUrl: botIcon,
  iconBackground: "#080908",

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

export const supportedChains = [
  arcMainnet,
  botchainTestnet,
];
