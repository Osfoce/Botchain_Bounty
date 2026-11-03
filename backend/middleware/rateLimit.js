const { rateLimit } = require("express-rate-limit");
const MongoRateLimitStore = require("./mongoRateLimitStore");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

const readLimit = (name, fallback) => {
  const envName = `RATE_LIMIT_${name.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`;
  const value = process.env[envName];
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`${envName} must be a positive integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${envName} must be a safe positive integer`);
  }
  return parsed;
};

const readWindowMs = (envName, fallback = DEFAULT_WINDOW_MS) => {
  const value = process.env[envName];
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`${envName} must be a positive integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${envName} must be a safe positive integer`);
  }
  return parsed;
};

const createRateLimiter = ({
  name,
  limit,
  windowMs = DEFAULT_WINDOW_MS,
  keyGenerator,
  store,
}) => {
  const configuredStore =
    store ||
    (process.env.NODE_ENV === "test"
      ? undefined
      : new MongoRateLimitStore({ windowMs, prefix: name }));

  return rateLimit({
    windowMs,
    limit,
    ...(keyGenerator ? { keyGenerator } : {}),
    ...(configuredStore ? { store: configuredStore } : {}),
    standardHeaders: true,
    legacyHeaders: false,
    async handler(req, res) {
      if (
        !req.rateLimit ||
        req.rateLimit.used === req.rateLimit.limit + 1
      ) {
        await recordSecurityAudit({
          req,
          event: "rate_limit_exceeded",
          severity: "warn",
          outcome: "blocked",
          errorCode: "RATE_LIMITED",
          policy: name,
          walletAddress: req.auth?.walletAddress,
        });
      }
      res.status(429).json({
        code: "RATE_LIMITED",
        error: "Too many requests. Try again later.",
      });
    },
  });
};

const createPolicyLimiters = ({
  name,
  limit,
  windowMs = readWindowMs("RATE_LIMIT_WINDOW_MS"),
  wallet = false,
  ipLimit = Math.max(limit * 5, limit),
}) => {
  const limiters = [
    createRateLimiter({
      name: `${name}:ip`,
      limit: readLimit(`${name}:ip`, ipLimit),
      windowMs,
    }),
  ];

  if (wallet) {
    limiters.push(
      createRateLimiter({
        name: `${name}:wallet`,
        limit: readLimit(`${name}:wallet`, limit),
        windowMs,
        keyGenerator(req) {
          return req.auth?.walletAddress?.toLowerCase() || "unauthenticated";
        },
      }),
    );
  }

  return limiters;
};

const createGeneralApiLimiter = () =>
  createRateLimiter({
    name: "api:general",
    limit: readLimit("api:general", 600),
    windowMs: readWindowMs("API_RATE_LIMIT_WINDOW_MS"),
  });

module.exports = {
  DEFAULT_WINDOW_MS,
  createGeneralApiLimiter,
  createPolicyLimiters,
  createRateLimiter,
  readLimit,
  readWindowMs,
};
