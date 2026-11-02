const test = require("node:test");
const assert = require("node:assert/strict");
const { getWalletAnalytics } = require("../controller/analytics.controller");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("wallet analytics rejects unsupported roles before querying data", async () => {
  const response = createResponse();
  await getWalletAnalytics(
    { params: { role: "admin", wallet: "0x0000000000000000000000000000000000000001" } },
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "Unsupported analytics role");
});

test("wallet analytics rejects malformed wallet addresses", async () => {
  const response = createResponse();
  await getWalletAnalytics(
    { params: { role: "contributor", wallet: "not-a-wallet" } },
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "Invalid wallet address");
});
