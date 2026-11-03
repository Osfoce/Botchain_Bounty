const SAFE_LABEL = /^[A-Za-z0-9._:/-]{1,128}$/;
const WALLET_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const TRANSACTION_HASH = /^0x[a-fA-F0-9]{64}$/;
const SEVERITIES = new Set(["debug", "info", "warn", "error", "critical"]);
const OUTCOMES = new Set([
  "attempt",
  "blocked",
  "denied",
  "failure",
  "success",
]);

const safeLabel = (value) =>
  typeof value === "string" && SAFE_LABEL.test(value) ? value : undefined;
const getSafeErrorCode = (error, fallback = "INTERNAL_ERROR") =>
  safeLabel(
    typeof error?.code === "number" ? String(error.code) : error?.code,
  ) || fallback;

const createSecurityMonitor = ({ now = Date.now } = {}) => {
  const rules = [
    {
      name: "repeated_authentication_failures",
      events: new Set([
        "authentication_denied",
        "auth_challenge_rejected",
        "auth_nonce_rejected",
        "auth_signature_rejected",
      ]),
      threshold: 5,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "rate_limit_spike",
      events: new Set(["rate_limit_exceeded"]),
      threshold: 5,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "repeated_transaction_verification_failures",
      events: new Set(["transaction_verification_failed"]),
      threshold: 3,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "rpc_error_spike",
      events: new Set(["rpc_unavailable"]),
      threshold: 3,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "upload_rejection_spike",
      events: new Set(["submission_image_validation_failed"]),
      threshold: 10,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "synchronization_failure_spike",
      events: new Set([
        "claim_sync_failed",
        "distribution_sync_failed",
        "reconciliation_failed",
      ]),
      threshold: 3,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "validation_failure_spike",
      events: new Set(["request_validation_failed"]),
      threshold: 20,
      windowMs: 10 * 60 * 1000,
    },
    {
      name: "database_failure_spike",
      events: new Set([
        "database_connection_failed",
        "security_audit_persist_failed",
        "security_audit_persist_unavailable",
      ]),
      threshold: 3,
      windowMs: 10 * 60 * 1000,
    },
  ];
  const counters = new Map(
    rules.map((rule) => [
      rule.name,
      { timestamps: [], lastAlertAt: null },
    ]),
  );

  return {
    observe(record) {
      const currentTime = now();
      const alerts = [];

      for (const rule of rules) {
        if (!rule.events.has(record.action)) continue;
        const counter = counters.get(rule.name);
        counter.timestamps = counter.timestamps.filter(
          (timestamp) => currentTime - timestamp < rule.windowMs,
        );
        counter.timestamps.push(currentTime);
        if (counter.timestamps.length > rule.threshold) {
          counter.timestamps = counter.timestamps.slice(-rule.threshold);
        }

        if (
          counter.timestamps.length >= rule.threshold &&
          (counter.lastAlertAt === null ||
            currentTime - counter.lastAlertAt >= rule.windowMs)
        ) {
          counter.lastAlertAt = currentTime;
          alerts.push({
            timestamp: new Date(currentTime).toISOString(),
            severity: "critical",
            environment: process.env.NODE_ENV || "development",
            action: "security_alert",
            outcome: "failure",
            alertType: rule.name,
            eventCount: counter.timestamps.length,
            windowMs: rule.windowMs,
          });
        }
      }

      return alerts;
    },
  };
};

const securityMonitor = createSecurityMonitor();

const buildLogRecord = ({
  req,
  event,
  severity = "info",
  outcome = "attempt",
  walletAddress,
  resourceId,
  policy,
  transactionId,
  chainId,
  count,
  errorCode,
  errorName,
  errorType,
}) => {
  const route = req?.route?.path
    ? `${req.baseUrl || ""}${req.route.path}`
    : undefined;
  const record = {
    timestamp: new Date().toISOString(),
    severity: SEVERITIES.has(severity) ? severity : "info",
    environment: process.env.NODE_ENV || "development",
    action: safeLabel(event) || "unknown_event",
    outcome: OUTCOMES.has(outcome) ? outcome : "attempt",
  };

  const optionalFields = {
    requestId: safeLabel(req?.requestId),
    method: safeLabel(req?.method),
    route: safeLabel(route),
    actorWallet: WALLET_ADDRESS.test(walletAddress || "")
      ? walletAddress.toLowerCase()
      : undefined,
    resourceId: safeLabel(resourceId),
    policy: safeLabel(policy),
    transactionId: TRANSACTION_HASH.test(transactionId || "")
      ? transactionId.toLowerCase()
      : undefined,
    chainId:
      Number.isSafeInteger(Number(chainId)) && Number(chainId) > 0
        ? Number(chainId)
        : undefined,
    count:
      Number.isSafeInteger(count) && count >= 0 ? count : undefined,
    errorCode: safeLabel(
      typeof errorCode === "number" ? String(errorCode) : errorCode,
    ),
    errorName: safeLabel(errorName),
    errorType: safeLabel(errorType),
  };

  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== undefined) record[key] = value;
  }

  return record;
};

const writeLogRecord = (record) => {
  const method =
    record.severity === "critical" || record.severity === "error"
      ? console.error
      : record.severity === "warn"
        ? console.warn
        : record.severity === "debug"
          ? console.debug
          : console.info;
  method(JSON.stringify(record));
};

const logSecurityEvent = (details) => {
  const record = buildLogRecord(details);
  writeLogRecord(record);

  for (const alert of securityMonitor.observe(record)) {
    writeLogRecord(alert);
  }

  return record;
};

const logRequestError = (
  req,
  event,
  error,
  severity = "error",
  context = {},
) =>
  logSecurityEvent({
    req,
    event,
    severity,
    outcome: "failure",
    errorCode: error?.code,
    errorName: error?.name || "Error",
    errorType: error?.type,
    ...context,
  });

module.exports = {
  buildLogRecord,
  createSecurityMonitor,
  getSafeErrorCode,
  logRequestError,
  logSecurityEvent,
};
