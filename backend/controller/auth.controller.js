const { createHash, randomBytes } = require("node:crypto");
const { getAddress, isAddress } = require("viem");
const { SiweMessage } = require("siwe");
const AuthNonce = require("../modules/authNonce.module");
const AuthSession = require("../modules/authSession.module");
const { getAllowedOrigin, supportedChainIds } = require("../config/auth");
const { hashToken } = require("../middleware/auth");
const { logRequestError } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const NONCE_TTL_MS = 5 * 60 * 1000;
const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_ABSOLUTE_MS = 4 * 60 * 60 * 1000;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const getRequestOrigin = (req) => getAllowedOrigin(req.get("origin"));
const auditAuthenticationFailure = (req, event, errorCode) =>
  recordSecurityAudit({
    req,
    event,
    severity: "warn",
    outcome: "denied",
    errorCode,
  });

const issueNonce = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const origin = getRequestOrigin(req);
  if (!origin) {
    await auditAuthenticationFailure(req, "auth_nonce_rejected", "ORIGIN_DENIED");
    return res.status(403).json({ error: "Origin is not allowed" });
  }

  const { address, chainId } = req.body || {};
  const normalizedChainId = Number(chainId);
  if (!isAddress(address)) {
    await auditAuthenticationFailure(req, "auth_nonce_rejected", "INVALID_WALLET");
    return res.status(400).json({ error: "A valid wallet address is required" });
  }
  if (
    !Number.isSafeInteger(normalizedChainId) ||
    !supportedChainIds.has(normalizedChainId)
  ) {
    await auditAuthenticationFailure(req, "auth_nonce_rejected", "UNSUPPORTED_CHAIN");
    return res.status(400).json({ error: "Unsupported wallet network" });
  }
  let normalizedAddress;
  try {
    normalizedAddress = getAddress(address);
  } catch {
    await auditAuthenticationFailure(req, "auth_nonce_rejected", "INVALID_WALLET");
    return res.status(400).json({ error: "A valid wallet address is required" });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + NONCE_TTL_MS);
  const nonce = randomBytes(32).toString("hex");
  const siweMessage = new SiweMessage({
    domain: new URL(origin).host,
    address: normalizedAddress,
    statement: "Sign in to Happy Bounty. This signature does not make a transaction.",
    uri: origin,
    version: "1",
    chainId: normalizedChainId,
    nonce,
    issuedAt: now.toISOString(),
    expirationTime: expiresAt.toISOString(),
  });
  const message = siweMessage.prepareMessage();

  try {
    await AuthNonce.create({
      nonceHash: sha256(nonce),
      messageHash: sha256(message),
      walletAddress: address.toLowerCase(),
      chainId: normalizedChainId,
      origin,
      issuedAt: now,
      expiresAt,
    });
    await recordSecurityAudit({
      req,
      event: "auth_nonce_issued",
      severity: "info",
      outcome: "success",
      chainId: normalizedChainId,
    });
    return res.status(200).json({ message, expiresAt });
  } catch (error) {
    logRequestError(req, "wallet_nonce_persistence_failed", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Could not start wallet authentication",
    });
  }
};

const verifySignature = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const origin = getRequestOrigin(req);
  if (!origin) {
    await auditAuthenticationFailure(
      req,
      "auth_challenge_rejected",
      "ORIGIN_DENIED",
    );
    return res.status(403).json({ error: "Origin is not allowed" });
  }

  const { message, signature } = req.body || {};
  if (
    typeof message !== "string" ||
    message.length > 4096 ||
    typeof signature !== "string" ||
    signature.length > 4096
  ) {
    await auditAuthenticationFailure(
      req,
      "auth_challenge_rejected",
      "INVALID_REQUEST",
    );
    return res.status(400).json({ error: "Invalid SIWE verification request" });
  }

  let siweMessage;
  try {
    siweMessage = new SiweMessage(message);
  } catch {
    await auditAuthenticationFailure(
      req,
      "auth_challenge_rejected",
      "INVALID_MESSAGE",
    );
    return res.status(401).json({ error: "Invalid sign-in message" });
  }

  const now = new Date();
  const issuedAt = new Date(siweMessage.issuedAt);
  const expiresAt = new Date(siweMessage.expirationTime);
  const chainId = Number(siweMessage.chainId);
  const domain = new URL(origin).host;
  if (
    !isAddress(siweMessage.address) ||
    siweMessage.version !== "1" ||
    siweMessage.domain !== domain ||
    siweMessage.uri !== origin ||
    !Number.isSafeInteger(chainId) ||
    !supportedChainIds.has(chainId) ||
    Number.isNaN(issuedAt.getTime()) ||
    Number.isNaN(expiresAt.getTime()) ||
    issuedAt.getTime() > now.getTime() + 60_000 ||
    issuedAt.getTime() < now.getTime() - NONCE_TTL_MS ||
    expiresAt <= now
  ) {
    await auditAuthenticationFailure(
      req,
      "auth_challenge_rejected",
      expiresAt <= now ? "CHALLENGE_EXPIRED" : "CHALLENGE_INVALID",
    );
    return res.status(401).json({ error: "Sign-in message is expired or invalid" });
  }

  const nonceHash = sha256(siweMessage.nonce);
  const messageHash = sha256(message);

  try {
    const nonceRecord = await AuthNonce.findOne({ nonceHash });
    if (
      !nonceRecord ||
      nonceRecord.messageHash !== messageHash ||
      nonceRecord.walletAddress !== siweMessage.address.toLowerCase() ||
      nonceRecord.chainId !== chainId ||
      nonceRecord.origin !== origin ||
      new Date(nonceRecord.issuedAt).getTime() !== issuedAt.getTime() ||
      new Date(nonceRecord.expiresAt).getTime() !== expiresAt.getTime() ||
      nonceRecord.consumedAt ||
      new Date(nonceRecord.expiresAt) <= now
    ) {
      const errorCode = nonceRecord?.consumedAt
        ? "NONCE_REPLAY"
        : nonceRecord && new Date(nonceRecord.expiresAt) <= now
          ? "CHALLENGE_EXPIRED"
          : "CHALLENGE_INVALID";
      await auditAuthenticationFailure(
        req,
        "auth_challenge_rejected",
        errorCode,
      );
      return res.status(401).json({ error: "Sign-in challenge is invalid or expired" });
    }

    let verification;
    try {
      verification = await siweMessage.verify({
        signature,
        domain,
        nonce: siweMessage.nonce,
        time: now.toISOString(),
      });
    } catch {
      await auditAuthenticationFailure(
        req,
        "auth_signature_rejected",
        "INVALID_SIGNATURE",
      );
      return res.status(401).json({ error: "Wallet signature is invalid" });
    }
    if (!verification.success) {
      await auditAuthenticationFailure(
        req,
        "auth_signature_rejected",
        "INVALID_SIGNATURE",
      );
      return res.status(401).json({ error: "Wallet signature is invalid" });
    }

    const consumedNonce = await AuthNonce.findOneAndUpdate(
      {
        nonceHash,
        messageHash,
        walletAddress: siweMessage.address.toLowerCase(),
        chainId,
        origin,
        consumedAt: null,
        expiresAt: { $gt: now },
      },
      { $set: { consumedAt: now } },
      { new: true },
    );
    if (!consumedNonce) {
      await auditAuthenticationFailure(
        req,
        "auth_challenge_rejected",
        "NONCE_REPLAY",
      );
      return res.status(401).json({ error: "Sign-in challenge was already used" });
    }

    const token = randomBytes(32).toString("base64url");
    const absoluteExpiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_MS);
    const sessionExpiresAt = new Date(
      Math.min(now.getTime() + SESSION_IDLE_MS, absoluteExpiresAt.getTime()),
    );
    const session = await AuthSession.create({
      tokenHash: hashToken(token),
      walletAddress: siweMessage.address.toLowerCase(),
      chainId,
      lastActivityAt: now,
      expiresAt: sessionExpiresAt,
      absoluteExpiresAt,
    });

    await recordSecurityAudit({
      req,
      event: "authentication_succeeded",
      severity: "info",
      outcome: "success",
      walletAddress: session.walletAddress,
      chainId: session.chainId,
    });
    return res.status(200).json({
      token,
      walletAddress: session.walletAddress,
      chainId: session.chainId,
      expiresAt: sessionExpiresAt,
    });
  } catch (error) {
    logRequestError(req, "wallet_session_persistence_failed", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Could not complete wallet authentication",
    });
  }
};

const logout = async (req, res) => {
  try {
    await AuthSession.deleteOne({ _id: req.auth.sessionId });
    await recordSecurityAudit({
      req,
      event: "authentication_session_revoked",
      severity: "info",
      outcome: "success",
      walletAddress: req.auth.walletAddress,
      resourceId: req.auth.sessionId,
      chainId: req.auth.chainId,
    });
    return res.status(204).end();
  } catch (error) {
    logRequestError(req, "wallet_session_revocation_failed", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      error: "Could not end the session",
    });
  }
};

module.exports = { issueNonce, verifySignature, logout };
