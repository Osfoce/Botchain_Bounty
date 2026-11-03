const mongoose = require("mongoose");
const Bounty = require("../modules/bounty.module");
const { recordSecurityAudit } = require("../services/securityAudit.service");

const walletPattern = /^0x[a-fA-F0-9]{40}$/;

const parseAdminWallets = (value = "") => {
  const wallets = value
    .split(",")
    .map((wallet) => wallet.trim())
    .filter(Boolean);

  if (wallets.some((wallet) => !walletPattern.test(wallet))) {
    throw new Error("ADMIN_WALLETS must contain comma-separated wallet addresses");
  }

  return new Set(wallets.map((wallet) => wallet.toLowerCase()));
};

const adminWallets = parseAdminWallets(process.env.ADMIN_WALLETS);

const isAdminWallet = (walletAddress) =>
  typeof walletAddress === "string" &&
  adminWallets.has(walletAddress.toLowerCase());

const requireRole = (...roles) => {
  if (!roles.length || roles.some((role) => role !== "admin")) {
    throw new Error("Unsupported authorization role");
  }

  return async (req, res, next) => {
    if (!req.auth?.walletAddress) {
      await recordSecurityAudit({
        req,
        event: "authorization_denied",
        severity: "warn",
        outcome: "denied",
        errorCode: "AUTH_REQUIRED",
      });
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.some((role) => role === "admin" && isAdminWallet(req.auth.walletAddress))) {
      await recordSecurityAudit({
        req,
        event: "authorization_denied",
        severity: "warn",
        outcome: "denied",
        errorCode: "ADMIN_ROLE_REQUIRED",
        walletAddress: req.auth.walletAddress,
      });
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    await recordSecurityAudit({
      req,
      event: "admin_access_granted",
      severity: "info",
      outcome: "success",
      walletAddress: req.auth.walletAddress,
      resourceId: req.params?.id,
    });
    return next();
  };
};

const authorizeBounty = ({ allowAdmin, rejectArchived }) =>
  async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid bounty ID" });
    }

    if (!req.auth?.walletAddress) {
      await recordSecurityAudit({
        req,
        event: "authorization_denied",
        severity: "warn",
        outcome: "denied",
        errorCode: "AUTH_REQUIRED",
        resourceId: id,
      });
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const bounty = await Bounty.findById(id)
        .select("_id creator archivedAt")
        .lean();
      if (!bounty) {
        return res.status(404).json({ error: "Bounty not found" });
      }

      const isOwner =
        bounty.creator?.toLowerCase() === req.auth.walletAddress.toLowerCase();
      const isAdmin = !isOwner && isAdminWallet(req.auth.walletAddress);
      if (!isOwner && !(allowAdmin && isAdmin)) {
        await recordSecurityAudit({
          req,
          event: "bounty_authorization_denied",
          severity: "warn",
          outcome: "denied",
          errorCode: "BOUNTY_OWNER_REQUIRED",
          walletAddress: req.auth.walletAddress,
          resourceId: id,
        });
        return res.status(403).json({
          error: allowAdmin
            ? "Only the bounty creator or an authorized admin can perform this action"
            : "Only the bounty creator can perform this action",
        });
      }
      if (rejectArchived && bounty.archivedAt) {
        return res
          .status(409)
          .json({ error: "Archived bounties cannot be modified" });
      }

      req.bounty = bounty;
      req.authorizationRole = isAdmin ? "admin" : "owner";
      return next();
    } catch (error) {
      return next(error);
    }
  };

const requireBountyOwner = authorizeBounty({
  allowAdmin: false,
  rejectArchived: true,
});
const requireBountyOwnerOrAdmin = authorizeBounty({
  allowAdmin: true,
  rejectArchived: false,
});

module.exports = {
  isAdminWallet,
  requireAdmin: requireRole("admin"),
  requireBountyOwner,
  requireBountyOwnerOrAdmin,
  requireRole,
};
