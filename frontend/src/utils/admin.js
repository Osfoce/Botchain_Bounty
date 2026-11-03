const walletPattern = /^0x[a-fA-F0-9]{40}$/;

export const parseAdminWallets = (value = "") => {
  const wallets = value
    .split(",")
    .map((wallet) => wallet.trim())
    .filter(Boolean);

  if (wallets.some((wallet) => !walletPattern.test(wallet))) {
    throw new Error("VITE_ADMIN_WALLETS must contain comma-separated wallet addresses");
  }

  return new Set(wallets.map((wallet) => wallet.toLowerCase()));
};

const adminWallets = parseAdminWallets(import.meta.env?.VITE_ADMIN_WALLETS || "");

export const isConfiguredAdminWallet = (walletAddress) =>
  typeof walletAddress === "string" &&
  adminWallets.has(walletAddress.toLowerCase());
