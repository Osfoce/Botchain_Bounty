import assert from "node:assert/strict";
import test from "node:test";
import {
  getAuthError,
  SESSION_EXPIRED_MESSAGE,
} from "./authErrors.js";

test("rejected and invalid wallet signatures produce safe messages", () => {
  assert.equal(
    getAuthError({ code: 4001 }),
    "Wallet signature was rejected. No session was created.",
  );
  assert.equal(
    getAuthError({ response: { data: { error: "Wallet signature is invalid" } } }),
    "Wallet signature is invalid",
  );
  assert.equal(
    getAuthError(new Error("wallet extension details")),
    "Wallet sign-in failed. Please try again.",
  );
});

test("expired sessions prompt for a fresh wallet sign-in", () => {
  assert.equal(
    SESSION_EXPIRED_MESSAGE,
    "Your sign-in expired. Sign in with your wallet to continue.",
  );
});
