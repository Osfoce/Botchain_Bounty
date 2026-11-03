const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const paginate = require("../utils/paginate");
const buildSortQuery = require("../utils/buildSortQuery");
const {
  createRequestParsers,
  errorHandler,
  rejectUnsupportedContentType,
  requestId,
} = require("../middleware/requestSecurity");
const {
  requestSchemas,
  validateRequest,
} = require("../middleware/requestSchemas");

const startApp = async (t, configure) => {
  const app = express();
  configure(app);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
};

test("request parser rejects oversized JSON and urlencoded bodies", async (t) => {
  const baseUrl = await startApp(t, (app) => {
    app.use(requestId, rejectUnsupportedContentType, createRequestParsers());
    app.post("/body", (_req, res) => res.sendStatus(204));
    app.use(errorHandler);
  });

  const jsonResponse = await fetch(`${baseUrl}/body`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value: "x".repeat(1_100_000) }),
  });
  const formResponse = await fetch(`${baseUrl}/body`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `value=${"x".repeat(11_000)}`,
  });

  assert.equal(jsonResponse.status, 413);
  assert.equal((await jsonResponse.json()).code, "PAYLOAD_TOO_LARGE");
  assert.equal(formResponse.status, 413);
  assert.equal((await formResponse.json()).code, "PAYLOAD_TOO_LARGE");
});

test("unsupported request media types receive an explicit 415", async (t) => {
  const baseUrl = await startApp(t, (app) => {
    app.use(requestId, rejectUnsupportedContentType, createRequestParsers());
    app.post("/body", (_req, res) => res.sendStatus(204));
    app.use(errorHandler);
  });
  const response = await fetch(`${baseUrl}/body`, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "payload",
  });

  assert.equal(response.status, 415);
  assert.equal((await response.json()).code, "UNSUPPORTED_MEDIA_TYPE");
});

test("sensitive request schemas reject malformed values and unknown fields", async (t) => {
  const baseUrl = await startApp(t, (app) => {
    app.use(express.json());
    app.post(
      "/auth/nonce",
      validateRequest({ body: requestSchemas.authNonce }),
      (_req, res) => res.sendStatus(204),
    );
    app.post(
      "/bounty/create",
      validateRequest({ body: requestSchemas.bountyCreate }),
      (_req, res) => res.sendStatus(204),
    );
  });

  const invalidWallet = await fetch(`${baseUrl}/auth/nonce`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address: "not-a-wallet", chainId: 1 }),
  });
  const unknownMutationField = await fetch(`${baseUrl}/bounty/create`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Test",
      description: "Test bounty",
      category: "Development",
      tags: [],
      startDate: "2025-01-01",
      deadline: "2025-01-02",
      originLink: "",
      network: 1,
      reward: "1",
      token: "ETH",
      winnersAllowed: 1,
      payoutType: "SINGLE",
      percentages: [],
      isAdmin: true,
    }),
  });

  assert.equal(invalidWallet.status, 400);
  assert.equal((await invalidWallet.json()).code, "INVALID_REQUEST");
  assert.equal(unknownMutationField.status, 400);
  assert.equal((await unknownMutationField.json()).code, "INVALID_REQUEST");
});

test("bounty request validation checks dates, duplicate tags, payout and URL schemes", () => {
  const base = {
    title: "Test",
    description: "Test bounty",
    category: "Development",
    tags: [],
    startDate: "2025-01-01",
    deadline: "2025-01-02",
    originLink: "",
    network: 1,
    reward: "1",
    token: "ETH",
    winnersAllowed: 1,
    payoutType: "SINGLE",
    percentages: [],
  };
  assert.equal(requestSchemas.bountyCreate.safeParse(base).success, true);
  assert.equal(
    requestSchemas.bountyCreate.safeParse({
      ...base,
      originLink: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.bountyCreate.safeParse({
      ...base,
      tags: ["security", "Security"],
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.bountyCreate.safeParse({
      ...base,
      payoutType: "MULTI_PERCENTAGE",
      winnersAllowed: 2,
      percentages: [80, 10],
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.bountyCreate.safeParse({
      ...base,
      deadline: "2024-12-31",
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.bountyCreate.safeParse({
      ...base,
      startDate: "2025-02-31",
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.privateListQuery.safeParse({ limit: "500" }).success,
    false,
  );
  assert.equal(requestSchemas.idParams.safeParse({ id: "invalid" }).success, false);
  assert.equal(
    requestSchemas.transactionBody.safeParse({
      txHash: "0xinvalid",
      blockchainId: "1",
      chainId: 5042,
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.bountyCreate.safeParse({
      ...base,
      reward: "-1",
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.submissionBody.safeParse({
      bountyId: "507f1f77bcf86cd799439011",
      description: "Submission",
      projectLink: "javascript:alert(1)",
    }).success,
    false,
  );
});

test("pagination and sort utilities reject unsafe values instead of defaulting", () => {
  assert.deepEqual(paginate({ page: "2", limit: "10" }), {
    page: 2,
    limit: 10,
    skip: 10,
  });
  assert.throws(() => paginate({ limit: "1000" }), { status: 400 });
  assert.throws(() => paginate({ page: "10001" }), { status: 400 });
  assert.throws(() => buildSortQuery({ sort: "password" }), { status: 400 });
});

test("unexpected errors return a stable response without internal details", async (t) => {
  const baseUrl = await startApp(t, (app) => {
    app.use(requestId);
    app.get("/error", () => {
      throw new Error("private database connection string");
    });
    app.use(errorHandler);
  });
  const response = await fetch(`${baseUrl}/error`);
  const payload = await response.json();

  assert.equal(response.status, 500);
  assert.equal(payload.code, "INTERNAL_ERROR");
  assert.equal(payload.error, "An unexpected error occurred.");
  assert.ok(payload.requestId);
  assert.equal(JSON.stringify(payload).includes("database connection"), false);
  assert.equal(response.headers.get("x-request-id"), payload.requestId);
});
