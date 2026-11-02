import test from "node:test";
import assert from "node:assert/strict";
import {
  CHAIN_IDS,
  getBountyContract,
  getExplorerConfig,
  getNativeToken,
} from "./chains.address.js";

test("Arc and BOT testnets resolve to the configured bounty deployments", () => {
  const contractAddress = "0x498482e334269a10d0621D3AC5e726734B01DDCe";

  assert.equal(getBountyContract(CHAIN_IDS.ARC_TESTNET), contractAddress);
  assert.equal(getBountyContract(CHAIN_IDS.BOTCHAIN_TESTNET), contractAddress);
  assert.equal(getNativeToken(CHAIN_IDS.ARC_TESTNET).symbol, "USDC");
  assert.equal(getNativeToken(CHAIN_IDS.BOTCHAIN_TESTNET).symbol, "BOT");
  assert.equal(
    getExplorerConfig(CHAIN_IDS.ARC_TESTNET).url,
    "https://testnet.arcscan.app",
  );
  assert.equal(
    getExplorerConfig(CHAIN_IDS.BOTCHAIN_TESTNET).url,
    "https://scan.bohr.life",
  );
});
