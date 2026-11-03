const test = require("node:test");
const assert = require("node:assert/strict");
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
const { app, isDatabaseReady } = require("../server");
process.env.NODE_ENV = originalNodeEnv;

test("server allows configured frontend origins and sends security headers", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`, {
    headers: { origin: "https://botchain-bounty.vercel.app" },
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "https://botchain-bounty.vercel.app",
  );
  assert.ok(response.headers.get("content-security-policy").includes("default-src 'none'"));
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("strict-transport-security"), /max-age=31536000/);
  assert.equal(
    response.headers.get("permissions-policy"),
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
});

test("unknown routes do not echo query strings", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/missing?token=private`,
  );
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.code, "NOT_FOUND");
  assert.equal(JSON.stringify(payload).includes("private"), false);
});

test("server denies unlisted origins with a stable response and no CORS grant", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`, {
    headers: { origin: "https://untrusted.example" },
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(payload.code, "ORIGIN_NOT_ALLOWED");
  assert.equal(payload.error, "Origin is not allowed.");
});

test("health and readiness endpoints expose minimal monitor status", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const healthResponse = await fetch(`${baseUrl}/healthz`);
  const healthPayload = await healthResponse.json();
  const readinessResponse = await fetch(`${baseUrl}/readyz`);
  const readinessPayload = await readinessResponse.json();

  assert.equal(healthResponse.status, 200);
  assert.equal(healthPayload.status, "ok");
  assert.ok(healthPayload.requestId);
  assert.equal(
    isDatabaseReady({ readyState: 1 }),
    true,
  );
  assert.equal(
    isDatabaseReady({ readyState: 0 }),
    false,
  );
  assert.equal(readinessResponse.status, isDatabaseReady() ? 200 : 503);
  assert.equal(
    readinessPayload.status,
    isDatabaseReady() ? "ready" : "not_ready",
  );
  assert.deepEqual(Object.keys(readinessPayload).sort(), [
    "requestId",
    "status",
  ]);
});
