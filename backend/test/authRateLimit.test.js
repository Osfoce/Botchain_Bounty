const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const authRoutes = require("../routes/auth.route");

test("authentication routes enforce their stricter IP abuse limits", async (t) => {
  const app = express();
  app.use(express.json(), authRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const baseUrl = `http://127.0.0.1:${server.address().port}/auth`;
  for (let request = 0; request < 30; request += 1) {
    const response = await fetch(`${baseUrl}/nonce`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(response.status, 400);
  }
  const nonceLimitResponse = await fetch(`${baseUrl}/nonce`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(nonceLimitResponse.status, 429);
  assert.equal((await nonceLimitResponse.json()).code, "RATE_LIMITED");

  for (let request = 0; request < 15; request += 1) {
    const response = await fetch(`${baseUrl}/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    assert.equal(response.status, 400);
  }
  const verifyLimitResponse = await fetch(`${baseUrl}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(verifyLimitResponse.status, 429);
  assert.equal((await verifyLimitResponse.json()).code, "RATE_LIMITED");
});
