const test = require("node:test");
const assert = require("node:assert/strict");
const SecurityAudit = require("../modules/securityAudit.module");
const {
  buildLogRecord,
  createSecurityMonitor,
  logRequestError,
} = require("../utils/requestLogger");
const { createSecurityAuditWriter } = require("../services/securityAudit.service");

const wallet = "0x1111111111111111111111111111111111111111";
const transactionId = `0x${"a".repeat(64)}`;

test("structured request errors include correlation fields but omit error messages", (t) => {
  const logged = [];
  const originalWarn = console.warn;
  console.warn = (value) => logged.push(value);
  t.after(() => {
    console.warn = originalWarn;
  });

  const secret = "mongodb://private-user:private-password@db.example";
  logRequestError(
    {
      requestId: "request-123",
      method: "POST",
      baseUrl: "/api",
      route: { path: "/auth/verify" },
      body: { signature: "private-signature" },
    },
    "auth_signature_rejected",
    {
      name: "Error",
      code: "INVALID_SIGNATURE",
      message: secret,
    },
    "warn",
  );

  const record = JSON.parse(logged[0]);
  assert.match(record.timestamp, /^\d{4}-\d\d-\d\dT/);
  assert.equal(record.severity, "warn");
  assert.equal(record.environment, process.env.NODE_ENV || "development");
  assert.equal(record.requestId, "request-123");
  assert.equal(record.route, "/api/auth/verify");
  assert.equal(record.action, "auth_signature_rejected");
  assert.equal(record.outcome, "failure");
  assert.equal(record.errorCode, "INVALID_SIGNATURE");
  assert.equal("body" in record, false);
  assert.equal(JSON.stringify(record).includes(secret), false);
  assert.equal(JSON.stringify(record).includes("private-signature"), false);
});

test("security monitor emits one threshold alert per window", () => {
  let now = 1_000;
  const monitor = createSecurityMonitor({ now: () => now });
  const authFailure = { action: "auth_signature_rejected" };

  for (let index = 0; index < 4; index += 1) {
    assert.deepEqual(monitor.observe(authFailure), []);
  }
  const alerts = monitor.observe(authFailure);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].action, "security_alert");
  assert.equal(alerts[0].alertType, "repeated_authentication_failures");
  assert.equal(alerts[0].eventCount, 5);

  now += 1_000;
  assert.deepEqual(monitor.observe(authFailure), []);
});

test("security audit writer appends sanitized records and reports persistence failures", async () => {
  const inserted = [];
  const logs = [];
  const logger = (details) => {
    logs.push(details);
    return buildLogRecord(details);
  };
  const writer = createSecurityAuditWriter({
    create: async (record) => inserted.push(record),
    isReady: () => true,
    logger,
  });

  const persisted = await writer({
    event: "admin_bounty_archived",
    severity: "warn",
    outcome: "success",
    walletAddress: wallet,
    resourceId: "507f1f77bcf86cd799439011",
    transactionId,
    chainId: 123,
  });

  assert.equal(persisted, true);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].action, "admin_bounty_archived");
  assert.equal(inserted[0].actorWallet, wallet);
  assert.equal(inserted[0].resourceId, "507f1f77bcf86cd799439011");
  assert.equal(inserted[0].transactionId, transactionId);

  const failingWriter = createSecurityAuditWriter({
    create: async () => {
      throw Object.assign(new Error("database credentials leaked"), {
        code: "AUDIT_STORE_UNAVAILABLE",
      });
    },
    isReady: () => true,
    logger,
  });
  assert.equal(
    await failingWriter({ event: "authentication_denied" }),
    false,
  );
  assert.equal(logs.at(-1).event, "security_audit_persist_failed");
  assert.equal(logs.at(-1).errorCode, "AUDIT_STORE_UNAVAILABLE");
  assert.equal(JSON.stringify(logs).includes("database credentials leaked"), false);
});

test("audit model fields are immutable and strict", () => {
  assert.equal(SecurityAudit.schema.options.strict, "throw");
  assert.equal(SecurityAudit.schema.path("action").options.immutable, true);
  assert.equal(SecurityAudit.schema.path("timestamp").options.immutable, true);
  assert.equal(SecurityAudit.schema.path("actorWallet").options.immutable, true);
});
