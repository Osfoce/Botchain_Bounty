const {
  createRateLimiter,
  readLimit,
  readWindowMs,
} = require("./rateLimit");
const MongoRateLimitStore = require("./mongoRateLimitStore");

const createPrivateReadLimiter = ({
  limit = 60,
  ipLimit = 300,
  windowMs = readWindowMs("RATE_LIMIT_WINDOW_MS"),
  storeFactory = (prefix) =>
    process.env.NODE_ENV === "test"
      ? undefined
      : new MongoRateLimitStore({ windowMs, prefix }),
} = {}) => {
  const ipLimiter = createRateLimiter({
    name: "private-read:ip",
    limit: readLimit("private-read:ip", ipLimit),
    windowMs,
    store: storeFactory("private-read:ip"),
  });
  const walletLimiter = createRateLimiter({
    name: "private-read:wallet",
    limit: readLimit("private-read:wallet", limit),
    windowMs,
    keyGenerator(req) {
      return req.auth?.walletAddress?.toLowerCase() || "unauthenticated";
    },
    store: storeFactory("private-read:wallet"),
  });

  return (req, res, next) => {
    ipLimiter(req, res, (error) => {
      if (error) return next(error);
      walletLimiter(req, res, next);
    });
  };
};

const privateReadLimiter = createPrivateReadLimiter();

module.exports = { createPrivateReadLimiter, privateReadLimiter };
