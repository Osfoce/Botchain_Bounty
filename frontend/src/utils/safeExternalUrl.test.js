import test from "node:test";
import assert from "node:assert/strict";
import { safeExternalUrl } from "./safeExternalUrl.js";

test("safeExternalUrl accepts HTTP(S) and normalizes valid destinations", () => {
  assert.equal(
    safeExternalUrl(" https://example.test/work "),
    "https://example.test/work",
  );
  assert.equal(safeExternalUrl("http://example.test"), "http://example.test/");
});

test("safeExternalUrl rejects unsafe schemes, credentials, and malformed URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "https://trusted.test@attacker.test/",
    "not a URL",
  ]) {
    assert.equal(safeExternalUrl(value), "");
  }
});

test("safeExternalUrl can require HTTPS for stored image links", () => {
  assert.equal(safeExternalUrl("http://example.test/image.webp", { httpsOnly: true }), "");
  assert.equal(
    safeExternalUrl("https://example.test/image.webp", { httpsOnly: true }),
    "https://example.test/image.webp",
  );
});
