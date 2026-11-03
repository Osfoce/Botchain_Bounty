const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { privateKeyToAccount } = require("viem/accounts");
const { SiweMessage } = require("siwe");
const AuthNonce = require("../modules/authNonce.module");
const AuthSession = require("../modules/authSession.module");
const Bounty = require("../modules/bounty.module");
const authRoutes = require("../routes/auth.route");
const bountyRoutes = require("../routes/bounty.route");
const commentRoutes = require("../routes/comment.route");
const enrollmentRoutes = require("../routes/enrollment.route");
const rewardRoutes = require("../routes/reward.route");
const submissionRoutes = require("../routes/submission.route");
const userRoutes = require("../routes/user.route");
const analyticsRoutes = require("../routes/analytics.route");
const { requireAuth, hashToken } = require("../middleware/auth");

const origin = "http://localhost:5173";
const accountA = privateKeyToAccount(`0x${"01".repeat(32)}`);
const accountB = privateKeyToAccount(`0x${"02".repeat(32)}`);

const startTestServer = async (t) => {
  const nonces = new Map();
  const sessions = new Map();
  const originals = {
    nonceCreate: AuthNonce.create,
    nonceFindOne: AuthNonce.findOne,
    nonceFindOneAndUpdate: AuthNonce.findOneAndUpdate,
    sessionCreate: AuthSession.create,
    sessionFindOne: AuthSession.findOne,
    sessionFindOneAndUpdate: AuthSession.findOneAndUpdate,
    sessionDeleteOne: AuthSession.deleteOne,
  };
  let nextId = 0;

  AuthNonce.create = async (data) => {
    const record = { ...data, consumedAt: null, _id: `nonce-${++nextId}` };
    nonces.set(record.nonceHash, record);
    return record;
  };
  AuthNonce.findOne = async ({ nonceHash }) => nonces.get(nonceHash) || null;
  AuthNonce.findOneAndUpdate = async (filter, update) => {
    const record = nonces.get(filter.nonceHash);
    if (
      !record ||
      record.consumedAt !== null ||
      record.messageHash !== filter.messageHash ||
      record.walletAddress !== filter.walletAddress ||
      record.chainId !== filter.chainId ||
      record.origin !== filter.origin ||
      record.expiresAt <= filter.expiresAt.$gt
    ) {
      return null;
    }
    record.consumedAt = update.$set.consumedAt;
    return record;
  };
  AuthSession.create = async (data) => {
    const session = { ...data, _id: `session-${++nextId}` };
    sessions.set(session.tokenHash, session);
    return session;
  };
  AuthSession.findOne = (filter) => ({
    lean: async () => {
      const session = sessions.get(filter.tokenHash);
      if (
        !session ||
        session.expiresAt <= filter.expiresAt.$gt ||
        session.absoluteExpiresAt <= filter.absoluteExpiresAt.$gt
      ) {
        return null;
      }
      return session;
    },
  });
  AuthSession.findOneAndUpdate = (filter, update) => ({
    lean: async () => {
      const session = [...sessions.values()].find(
        (candidate) => String(candidate._id) === String(filter._id),
      );
      if (!session || session.expiresAt <= filter.expiresAt.$gt) return null;
      Object.assign(session, update.$set);
      return session;
    },
  });
  AuthSession.deleteOne = async ({ _id }) => {
    const match = [...sessions.entries()].find(
      ([, session]) => String(session._id) === String(_id),
    );
    if (match) sessions.delete(match[0]);
    return { deletedCount: match ? 1 : 0 };
  };

  const app = express();
  app.use(express.json());
  app.use("/api", authRoutes);
  app.use("/api", commentRoutes);
  app.use("/api", userRoutes);
  app.use("/api", submissionRoutes);
  app.use("/api", enrollmentRoutes);
  app.use("/api", rewardRoutes);
  app.use("/api", bountyRoutes);
  app.use("/api", analyticsRoutes);
  app.get("/api/private", requireAuth, (req, res) => {
    res.json({ walletAddress: req.auth.walletAddress });
  });

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  t.after(() => {
    AuthNonce.create = originals.nonceCreate;
    AuthNonce.findOne = originals.nonceFindOne;
    AuthNonce.findOneAndUpdate = originals.nonceFindOneAndUpdate;
    AuthSession.create = originals.sessionCreate;
    AuthSession.findOne = originals.sessionFindOne;
    AuthSession.findOneAndUpdate = originals.sessionFindOneAndUpdate;
    AuthSession.deleteOne = originals.sessionDeleteOne;
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  return { baseUrl, nonces, sessions };
};

const request = (url, body, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      Origin: origin,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

const issueChallenge = async (baseUrl, account = accountA, chainId = 5042) => {
  const response = await request(`${baseUrl}/auth/nonce`, {
    address: account.address,
    chainId,
  }, { method: "POST" });
  return { response, data: await response.json() };
};

const signMessage = (account, message) => account.signMessage({ message });

const verifyChallenge = (baseUrl, message, signature) =>
  request(`${baseUrl}/auth/verify`, { message, signature }, { method: "POST" });

test("valid SIWE signature authenticates the wallet and protects routes", async (t) => {
  const { baseUrl } = await startTestServer(t);
  const { response: nonceResponse, data: challenge } = await issueChallenge(
    baseUrl,
  );
  assert.equal(nonceResponse.status, 200);

  const signature = await signMessage(accountA, challenge.message);
  const verifyResponse = await verifyChallenge(
    baseUrl,
    challenge.message,
    signature,
  );
  assert.equal(verifyResponse.status, 200);
  const session = await verifyResponse.json();
  assert.equal(session.walletAddress, accountA.address.toLowerCase());
  assert.match(session.token, /^[A-Za-z0-9_-]{43}$/);

  const protectedResponse = await request(`${baseUrl}/private`, null, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  assert.equal(protectedResponse.status, 200);
  assert.equal(
    (await protectedResponse.json()).walletAddress,
    accountA.address.toLowerCase(),
  );
});

test("invalid and wrong-wallet signatures are rejected without logging secrets", async (t) => {
  const { baseUrl } = await startTestServer(t);
  const { data: challenge } = await issueChallenge(baseUrl);
  const invalidSignature = await signMessage(accountB, challenge.message);

  const logged = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  console.log = (...values) => logged.push(values.join(" "));
  console.error = (...values) => logged.push(values.join(" "));
  console.warn = (...values) => logged.push(values.join(" "));
  try {
    const response = await verifyChallenge(
      baseUrl,
      challenge.message,
      invalidSignature,
    );
    assert.equal(response.status, 401);
  } finally {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }
  assert.equal(logged.some((line) => line.includes(invalidSignature)), false);
  const audit = logged
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .find((record) => record?.action === "auth_signature_rejected");
  assert.ok(audit);
  assert.equal(audit.outcome, "denied");
  assert.equal(audit.errorCode, "INVALID_SIGNATURE");
});

test("expired, tampered, wrong-domain, and unsupported-chain challenges are rejected", async (t) => {
  const { baseUrl } = await startTestServer(t);
  const { data: expiredChallenge } = await issueChallenge(baseUrl);
  const parsed = new SiweMessage(expiredChallenge.message);
  const expiredMessage = new SiweMessage({
    domain: parsed.domain,
    address: parsed.address,
    statement: parsed.statement,
    uri: parsed.uri,
    version: parsed.version,
    chainId: parsed.chainId,
    nonce: parsed.nonce,
    issuedAt: parsed.issuedAt,
    expirationTime: new Date(Date.now() - 1000).toISOString(),
  }).prepareMessage();
  const expiredSignature = await signMessage(accountA, expiredMessage);
  assert.equal(
    (
      await verifyChallenge(baseUrl, expiredMessage, expiredSignature)
    ).status,
    401,
  );

  const { data: tamperedChallenge } = await issueChallenge(baseUrl);
  const tamperedMessage = tamperedChallenge.message.replace(
    "Sign in to Happy Bounty.",
    "Sign in to another site.",
  );
  const tamperedSignature = await signMessage(accountA, tamperedMessage);
  assert.equal(
    (
      await verifyChallenge(baseUrl, tamperedMessage, tamperedSignature)
    ).status,
    401,
  );

  const { data: domainChallenge } = await issueChallenge(baseUrl);
  const domainMessage = domainChallenge.message.replace(
    "localhost:5173",
    "attacker.example",
  );
  const domainSignature = await signMessage(accountA, domainMessage);
  assert.equal(
    (await verifyChallenge(baseUrl, domainMessage, domainSignature)).status,
    401,
  );

  const { data: uriChallenge } = await issueChallenge(baseUrl);
  const uriMessage = uriChallenge.message.replace(
    "http://localhost:5173",
    "https://attacker.example",
  );
  const uriSignature = await signMessage(accountA, uriMessage);
  assert.equal(
    (await verifyChallenge(baseUrl, uriMessage, uriSignature)).status,
    401,
  );

  const unsupported = await issueChallenge(baseUrl, accountA, 1);
  assert.equal(unsupported.response.status, 400);
  const disallowedOrigin = await request(
    `${baseUrl}/auth/nonce`,
    { address: accountA.address, chainId: 5042 },
    { method: "POST", headers: { Origin: "https://attacker.example" } },
  );
  assert.equal(disallowedOrigin.status, 403);
});

test("nonce reuse and concurrent replay allow only one session", async (t) => {
  const { baseUrl } = await startTestServer(t);
  const { data: challenge } = await issueChallenge(baseUrl);
  const signature = await signMessage(accountA, challenge.message);

  const [first, concurrent] = await Promise.all([
    verifyChallenge(baseUrl, challenge.message, signature),
    verifyChallenge(baseUrl, challenge.message, signature),
  ]);
  const statuses = [first.status, concurrent.status].sort();
  assert.deepEqual(statuses, [200, 401]);
  assert.equal(
    (await verifyChallenge(baseUrl, challenge.message, signature)).status,
    401,
  );
});

test("missing, malformed, expired, and logged-out credentials are rejected", async (t) => {
  const { baseUrl, sessions } = await startTestServer(t);
  assert.equal((await request(`${baseUrl}/private`, null)).status, 401);
  assert.equal(
    (
      await request(`${baseUrl}/private`, null, {
        headers: { Authorization: "Bearer malformed" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request(`${baseUrl}/private`, null, {
        headers: { Authorization: `Bearer ${"B".repeat(43)}` },
      })
    ).status,
    401,
  );

  const { data: challenge } = await issueChallenge(baseUrl);
  const signature = await signMessage(accountA, challenge.message);
  const verifyResponse = await verifyChallenge(
    baseUrl,
    challenge.message,
    signature,
  );
  const session = await verifyResponse.json();
  const storedSession = sessions.get(hashToken(session.token));

  storedSession.expiresAt = new Date(Date.now() - 1000);
  assert.equal(
    (
      await request(`${baseUrl}/private`, null, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
    ).status,
    401,
  );

  const { data: absoluteExpiryChallenge } = await issueChallenge(baseUrl);
  const absoluteExpirySignature = await signMessage(
    accountA,
    absoluteExpiryChallenge.message,
  );
  const absoluteExpiryResponse = await verifyChallenge(
    baseUrl,
    absoluteExpiryChallenge.message,
    absoluteExpirySignature,
  );
  const absoluteExpirySession = await absoluteExpiryResponse.json();
  sessions.get(hashToken(absoluteExpirySession.token)).absoluteExpiresAt =
    new Date(Date.now() - 1000);
  assert.equal(
    (
      await request(`${baseUrl}/private`, null, {
        headers: { Authorization: `Bearer ${absoluteExpirySession.token}` },
      })
    ).status,
    401,
  );

  const { data: logoutChallenge } = await issueChallenge(baseUrl);
  const logoutSignature = await signMessage(accountA, logoutChallenge.message);
  const logoutSessionResponse = await verifyChallenge(
    baseUrl,
    logoutChallenge.message,
    logoutSignature,
  );
  const logoutSession = await logoutSessionResponse.json();
  const logoutResponse = await request(`${baseUrl}/auth/logout`, {}, {
    method: "POST",
    headers: { Authorization: `Bearer ${logoutSession.token}` },
  });
  assert.equal(logoutResponse.status, 204);
  assert.equal(
    (
      await request(`${baseUrl}/private`, null, {
        headers: { Authorization: `Bearer ${logoutSession.token}` },
      })
    ).status,
    401,
  );
});

test("API writes and wallet-scoped reads require authentication", async (t) => {
  const { baseUrl } = await startTestServer(t);
  const bountyId = "507f1f77bcf86cd799439011";
  const wallet = accountA.address;
  const protectedRequests = [
    ["POST", "/bounty/create"],
    ["PATCH", `/bounty/update/${bountyId}`],
    ["DELETE", `/bounty/delete/${bountyId}`],
    ["POST", "/bounty/submit"],
    ["POST", "/user/enrollment"],
    ["POST", `/comments/add/${bountyId}`],
    ["GET", `/bounty/submissions/${bountyId}`],
    ["POST", `/bounty/${bountyId}/distribute`],
    ["POST", `/bounty/${bountyId}/claim`],
    ["GET", `/user/${wallet}`],
    ["GET", `/user/details/${wallet}`],
    ["GET", `/user/get-enrollment/${wallet}`],
    ["GET", `/bounty/user/submissions/${wallet}`],
    ["GET", `/analytics/creator/${wallet}`],
  ];

  for (const [method, path] of protectedRequests) {
    const body = method === "GET" || method === "DELETE" ? null : {};
    const response = await request(`${baseUrl}${path}`, body, { method });
    assert.equal(response.status, 401, `${method} ${path} should require auth`);
  }

  const { data: challenge } = await issueChallenge(baseUrl, accountA);
  const signature = await signMessage(accountA, challenge.message);
  const authResponse = await verifyChallenge(
    baseUrl,
    challenge.message,
    signature,
  );
  const session = await authResponse.json();
  const otherWalletResponse = await request(
    `${baseUrl}/user/${accountB.address}`,
    null,
    { headers: { Authorization: `Bearer ${session.token}` } },
  );
  assert.equal(otherWalletResponse.status, 403);
});

test("a non-owner cannot trigger distribution synchronization", async (t) => {
  const { baseUrl, sessions } = await startTestServer(t);
  const bountyId = "507f1f77bcf86cd799439011";
  const token = "D".repeat(43);
  const originalFindById = Bounty.findById;
  let bountyReads = 0;
  Bounty.findById = () => {
    bountyReads += 1;
    return {
      select() {
        return this;
      },
      lean: async () => ({ _id: bountyId, creator: accountA.address }),
    };
  };
  t.after(() => {
    Bounty.findById = originalFindById;
  });

  const now = new Date();
  sessions.set(hashToken(token), {
    _id: "m2-session",
    tokenHash: hashToken(token),
    walletAddress: accountB.address.toLowerCase(),
    chainId: 5042,
    lastActivityAt: now,
    expiresAt: new Date(now.getTime() + 60_000),
    absoluteExpiresAt: new Date(now.getTime() + 60_000),
  });

  const response = await request(
    `${baseUrl}/bounty/${bountyId}/distribute`,
    { txHash: `0x${"1".repeat(64)}`, blockchainId: "1", chainId: 5042 },
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  assert.equal(response.status, 403);
  assert.equal(bountyReads, 1);
});

test("direct update and delete requests are denied to an authenticated non-owner", async (t) => {
  const { baseUrl, sessions } = await startTestServer(t);
  const bountyId = "507f1f77bcf86cd799439011";
  const token = "E".repeat(43);
  const originalFindById = Bounty.findById;
  const originalFindByIdAndUpdate = Bounty.findByIdAndUpdate;
  let writeCalls = 0;
  Bounty.findById = () => ({
    select() {
      return this;
    },
    lean: async () => ({ _id: bountyId, creator: accountA.address }),
  });
  Bounty.findByIdAndUpdate = async () => {
    writeCalls += 1;
    return null;
  };
  t.after(() => {
    Bounty.findById = originalFindById;
    Bounty.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const now = new Date();
  sessions.set(hashToken(token), {
    _id: "m2-non-owner-session",
    tokenHash: hashToken(token),
    walletAddress: accountB.address.toLowerCase(),
    chainId: 5042,
    lastActivityAt: now,
    expiresAt: new Date(now.getTime() + 60_000),
    absoluteExpiresAt: new Date(now.getTime() + 60_000),
  });

  const updateResponse = await request(
    `${baseUrl}/bounty/update/${bountyId}`,
    { title: "Attacker edit" },
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const deleteResponse = await request(
    `${baseUrl}/bounty/delete/${bountyId}`,
    null,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  assert.equal(updateResponse.status, 403);
  assert.equal(deleteResponse.status, 403);
  assert.equal(writeCalls, 0);
});

test("the owner can edit allowed fields and archive without deleting history", async (t) => {
  const { baseUrl, sessions } = await startTestServer(t);
  const bountyId = "507f1f77bcf86cd799439011";
  const token = "F".repeat(43);
  const originalFindById = Bounty.findById;
  const originalFindByIdAndUpdate = Bounty.findByIdAndUpdate;
  const bounty = { _id: bountyId, creator: accountA.address, archivedAt: null };
  let updates = 0;
  Bounty.findById = () => ({
    select() {
      return this;
    },
    lean: async () => bounty,
  });
  Bounty.findByIdAndUpdate = async (_id, update) => {
    updates += 1;
    return { ...bounty, ...(update.$set || update) };
  };
  t.after(() => {
    Bounty.findById = originalFindById;
    Bounty.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const now = new Date();
  sessions.set(hashToken(token), {
    _id: "m2-owner-session",
    tokenHash: hashToken(token),
    walletAddress: accountA.address.toLowerCase(),
    chainId: 5042,
    lastActivityAt: now,
    expiresAt: new Date(now.getTime() + 60_000),
    absoluteExpiresAt: new Date(now.getTime() + 60_000),
  });
  const authorization = { Authorization: `Bearer ${token}` };

  const updateResponse = await request(
    `${baseUrl}/bounty/update/${bountyId}`,
    { title: "Owner edit" },
    { method: "PATCH", headers: authorization },
  );
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).bounty.title, "Owner edit");

  const protectedUpdateResponse = await request(
    `${baseUrl}/bounty/update/${bountyId}`,
    { creator: accountB.address },
    { method: "PATCH", headers: authorization },
  );
  assert.equal(protectedUpdateResponse.status, 400);

  const archiveResponse = await request(
    `${baseUrl}/bounty/delete/${bountyId}`,
    null,
    { method: "DELETE", headers: authorization },
  );
  assert.equal(archiveResponse.status, 200);
  assert.equal((await archiveResponse.json()).archived, true);
  assert.equal(updates, 2);
});
