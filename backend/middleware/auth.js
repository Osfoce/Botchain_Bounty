const { createHash } = require("node:crypto");
const AuthSession = require("../modules/authSession.module");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const IDLE_SESSION_MS = 30 * 60 * 1000;

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const getBearerToken = (req) => {
  const authorization = req.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization);
  return match?.[1] || null;
};

const loadSession = async (token) => {
  const now = new Date();
  const tokenHash = hashToken(token);
  const session = await AuthSession.findOne({
    tokenHash,
    expiresAt: { $gt: now },
    absoluteExpiresAt: { $gt: now },
  }).lean();

  if (!session) return null;

  const expiresAt = new Date(
    Math.min(
      now.getTime() + IDLE_SESSION_MS,
      new Date(session.absoluteExpiresAt).getTime(),
    ),
  );
  const activeSession = await AuthSession.findOneAndUpdate(
    {
      _id: session._id,
      expiresAt: { $gt: now },
      absoluteExpiresAt: { $gt: now },
    },
    { $set: { lastActivityAt: now, expiresAt } },
    { new: true },
  ).lean();

  return activeSession || null;
};

const authenticate = (optional = false) => async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    if (optional && !req.get("authorization")) return next();
    await recordSecurityAudit({
      req,
      event: "authentication_denied",
      severity: "warn",
      outcome: "denied",
      errorCode: "SESSION_REQUIRED",
    });
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const session = await loadSession(token);
    if (!session) {
      await recordSecurityAudit({
        req,
        event: "authentication_denied",
        severity: "warn",
        outcome: "denied",
        errorCode: "SESSION_INVALID",
      });
      return res.status(401).json({ error: "Authentication required" });
    }

    req.auth = Object.freeze({
      sessionId: String(session._id),
      walletAddress: session.walletAddress.toLowerCase(),
      chainId: session.chainId,
    });
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAuth = authenticate();
const optionalAuth = authenticate(true);

const requireSelf = async (req, res, next) => {
  const wallet = req.params.wallet;
  if (
    typeof wallet !== "string" ||
    wallet.toLowerCase() !== req.auth?.walletAddress
  ) {
    await recordSecurityAudit({
      req,
      event: "authorization_denied",
      severity: "warn",
      outcome: "denied",
      errorCode: "SELF_ACCESS_DENIED",
      walletAddress: req.auth?.walletAddress,
    });
    return res.status(403).json({ error: "You can only access your own wallet data" });
  }
  return next();
};

module.exports = { requireAuth, optionalAuth, requireSelf, hashToken };
