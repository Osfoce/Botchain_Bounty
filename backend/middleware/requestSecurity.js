const { randomUUID } = require("node:crypto");
const express = require("express");
const { logRequestError, logSecurityEvent } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const requestId = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

const rejectUnsupportedContentType = (req, res, next) => {
  const hasBody =
    Number(req.headers["content-length"] || 0) > 0 ||
    req.headers["transfer-encoding"] !== undefined;
  if (!hasBody) {
    return next();
  }

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    logSecurityEvent({
      req,
      event: "request_validation_failed",
      severity: "warn",
      outcome: "blocked",
      errorCode: "BODY_NOT_ALLOWED",
    });
    return res.status(400).json({
      code: "INVALID_REQUEST",
      error: "Request bodies are not allowed for this method.",
      requestId: req.requestId,
    });
  }

  const contentType = req.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (
    contentType === "application/json" ||
    contentType === "application/x-www-form-urlencoded" ||
    contentType === "multipart/form-data"
  ) {
    return next();
  }

  logSecurityEvent({
    req,
    event: "request_validation_failed",
    severity: "warn",
    outcome: "blocked",
    errorCode: "UNSUPPORTED_MEDIA_TYPE",
  });
  return res.status(415).json({
    code: "UNSUPPORTED_MEDIA_TYPE",
    error: "Unsupported content type.",
    requestId: req.requestId,
  });
};

const errorHandler = async (error, req, res, _next) => {
  if (res.headersSent) {
    return _next(error);
  }
  const isLimitError =
    typeof error?.code === "string" && error.code.startsWith("LIMIT_");
  let status = 500;
  if (error?.code === "RATE_LIMIT_STORE_UNAVAILABLE") {
    status = 503;
  } else if (error?.type === "entity.too.large" || error?.code === "LIMIT_FILE_SIZE") {
    status = 413;
  } else if (error?.code === "INVALID_UPLOAD") {
    status = 415;
  } else if (isLimitError || error?.type === "entity.parse.failed") {
    status = 400;
  } else if (error?.message === "CORS_ORIGIN_DENIED") {
    status = 403;
  } else if (
    Number.isInteger(error?.status) &&
    error.status >= 400 &&
    error.status < 500
  ) {
    status = error.status;
  }

  const code =
    error?.code === "RATE_LIMIT_STORE_UNAVAILABLE"
      ? "RATE_LIMIT_UNAVAILABLE"
      : error?.message === "CORS_ORIGIN_DENIED"
        ? "ORIGIN_NOT_ALLOWED"
        : status === 413
          ? "PAYLOAD_TOO_LARGE"
          : status === 400
            ? "INVALID_REQUEST"
            : status === 403
              ? "FORBIDDEN"
              : status === 415
                ? "UNSUPPORTED_MEDIA_TYPE"
                : status === 404
                  ? "NOT_FOUND"
                  : "INTERNAL_ERROR";

  const isUploadError =
    error?.code === "INVALID_UPLOAD" ||
    (typeof error?.code === "string" && error.code.startsWith("LIMIT_FILE"));
  if (isUploadError) {
    await recordSecurityAudit({
      req,
      event: "submission_image_validation_failed",
      severity: "warn",
      outcome: "blocked",
      walletAddress: req.auth?.walletAddress,
      errorCode: error.code,
    });
  } else if (isLimitError || error?.type === "entity.parse.failed") {
    logSecurityEvent({
      req,
      event: "request_validation_failed",
      severity: "warn",
      outcome: "blocked",
      errorCode: code,
    });
  }

  if (status >= 500) {
    logRequestError(req, "request_failed", error, "error", {
      errorCode: code,
    });
  }

  const messages = {
    RATE_LIMIT_UNAVAILABLE: "Request protection is temporarily unavailable.",
    PAYLOAD_TOO_LARGE: "Request body is too large.",
    INVALID_REQUEST: "Request body is invalid.",
    ORIGIN_NOT_ALLOWED: "Origin is not allowed.",
    FORBIDDEN: "Request is forbidden.",
    UNSUPPORTED_MEDIA_TYPE: "Unsupported media type.",
    INTERNAL_ERROR: "An unexpected error occurred.",
  };
  res.status(status).json({
    code,
    error: messages[code] || messages.INTERNAL_ERROR,
    requestId: req.requestId,
  });
};

const createRequestParsers = () => [
  express.json({ limit: "1mb", strict: true }),
  express.urlencoded({
    extended: false,
    limit: "10kb",
    parameterLimit: 100,
  }),
];

const setPermissionsPolicy = (_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  next();
};

module.exports = {
  createRequestParsers,
  errorHandler,
  rejectUnsupportedContentType,
  requestId,
  setPermissionsPolicy,
};
