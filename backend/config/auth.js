const { CHAINS } = require("./chains");

const defaultOrigins = [
  "https://botchain-bounty.vercel.app",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
];

const configuredOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultOrigins;

const allowedOrigins = new Set(
  configuredOrigins.filter(Boolean).map((origin) => {
    const parsed = new URL(origin);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin
    ) {
      throw new Error("FRONTEND_ORIGINS must contain origins without paths");
    }
    return parsed.origin;
  }),
);

const supportedChainIds = new Set(Object.keys(CHAINS).map(Number));

const getAllowedOrigin = (origin) =>
  typeof origin === "string" && allowedOrigins.has(origin) ? origin : null;

module.exports = {
  allowedOrigins,
  getAllowedOrigin,
  supportedChainIds,
};
