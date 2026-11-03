import test from "node:test";
import assert from "node:assert/strict";
import { parseAdminWallets } from "./admin.js";

test("admin wallet configuration is normalized and validated", () => {
  const wallets = parseAdminWallets(
    " 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222 ",
  );
  assert.deepEqual(
    [...wallets],
    [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
    ],
  );
  assert.deepEqual([...parseAdminWallets("")], []);
  assert.throws(() => parseAdminWallets("not-a-wallet"), /VITE_ADMIN_WALLETS/);
});
