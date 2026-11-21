import test from "node:test";
import assert from "node:assert/strict";
import {
  getAnalyticsErrorMessage,
  hasAnalyticsContent,
} from "./analytics.js";

test("empty analytics results are treated as no content", () => {
  assert.equal(hasAnalyticsContent({}), false);
  assert.equal(
    hasAnalyticsContent({
      overview: { bountiesCreated: 0, totalContributions: 0 },
      creator: { overview: { bountiesCreated: 0 } },
      contributor: { overview: { totalSubmissions: 0 }, rewards: { assigned: 0 } },
    }),
    false,
  );
});

test("combined role activity is visible when either role has data", () => {
  assert.equal(
    hasAnalyticsContent({
      overview: { bountiesCreated: 0, totalContributions: 0 },
      creator: { overview: { bountiesCreated: 2 } },
      contributor: { overview: { totalSubmissions: 0 } },
    }),
    true,
  );
  assert.equal(
    hasAnalyticsContent({
      creator: { overview: { bountiesCreated: 0 } },
      contributor: { rewards: { assigned: 1 } },
    }),
    true,
  );
});

test("network and server errors have distinct user-facing copy", () => {
  assert.match(
    getAnalyticsErrorMessage({ code: "ERR_NETWORK" }),
    /connection/,
  );
  assert.match(
    getAnalyticsErrorMessage({ response: { status: 500 } }),
    /couldn’t load/i,
  );
});
