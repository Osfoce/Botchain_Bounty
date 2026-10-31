
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, isAddress } from "viem";
import happyBountyLogo from "../assets/images/happy-bounty-logo.png";
import {
  getBountyCounterConfig,
  getFeePercentConfig,
  getOwnerConfig,
  getTotalFeesConfig,
  prepareTransferOwnershipTx,
  prepareWithdrawTx,
} from "../services/bountyService";
import { getBountyContract } from "../utils/chains.address";
import Skeleton from "../components/UI/Skeleton";

const ARC_MAINNET_ID = 5042;
const ACCENT = "#00D6A0";
const ACCENT_DARK = "#008A66";
const CONFIRM_TIMEOUT_MS = 6000;

const ADMIN_ADDRESSES = [
  "0x75DDb0a7161c717a0443967803c6516cf1e39cA6",
  "0x579F49Af31375Da97b6Ba3cf0Aa4a887A0E6c98b2",
];

const shortAddress = (address) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";

const formatNumber = (value) =>
  value == null ? "—" : Number(value).toLocaleString();

function BrandLogo({ size = "h-9 w-9", className = "" }) {
  return (
    <img
      src={happyBountyLogo}
      alt="Happy Bounty logo"
      className={`${size} shrink-0 object-contain ${className}`}
    />
  );
}

function StatCard({ icon, label, value, note }) {
  return (
    <article className="group min-w-0 rounded-xl border border-[#e5e7e2] bg-white p-4 transition duration-200 hover:border-[#00D6A0]/40 dark:border-white/[0.08] dark:bg-[#111311] dark:hover:border-[#00D6A0]/30 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#777d76] dark:text-white/50">
            {label}
          </p>

          <p className="mt-2 break-words text-xl font-semibold tracking-tight text-[#171a17] dark:text-white sm:text-2xl">
            {value}
          </p>
        </div>

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: "rgba(0,214,160,0.10)",
            color: ACCENT_DARK,
          }}
        >
          <span className="dark:text-[#00D6A0]">{icon}</span>
        </span>
      </div>

      {note && (
        <p className="mt-2 text-[11px] leading-5 text-[#858b83] dark:text-white/40">
          {note}
        </p>
      )}
    </article>
  );
}

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#008A66] dark:text-[#00D6A0]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-sm font-semibold text-[#171a17] dark:text-white sm:text-base">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}

function MobileNav({ onNavigate }) {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5e7e2] bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0c0e0c]/95 lg:hidden">
      <button
        onClick={() => onNavigate("/")}
        className="flex items-center gap-2"
        aria-label="Go to Happy Bounty home"
      >
        <BrandLogo size="h-8 w-8" />

        <span className="text-sm font-bold text-[#171a17] dark:text-white">
          Happy Bounty
        </span>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate("/dashboard")}
          className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#656b64] transition hover:bg-[#00D6A0]/10 hover:text-[#008A66] dark:text-white/60 dark:hover:text-[#00D6A0]"
        >
          Bounties
        </button>

        <button
          onClick={() => onNavigate("/create")}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-[#06271d] transition hover:brightness-95"
          style={{ backgroundColor: ACCENT }}
        >
          + Create
        </button>
      </div>
    </nav>
  );
}

function Notice({ type = "info", children }) {
  const styles = {
    info: "border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] text-[#176b54] dark:border-[#00D6A0]/20 dark:bg-[#00D6A0]/[0.05] dark:text-[#8af0d1]",
    warning:
      "border-amber-400/40 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200",
    error:
      "border-red-300/60 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    success:
      "border-[#00D6A0]/30 bg-[#00D6A0]/[0.08] text-[#176b54] dark:border-[#00D6A0]/20 dark:bg-[#00D6A0]/[0.06] dark:text-[#8af0d1]",
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs leading-5 ${styles[type]}`}
    >
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e0e5df] bg-[#fbfcf9] px-3.5 py-2.5 text-sm text-[#171a17] outline-none transition placeholder:text-[#a1a79f] focus:border-[#00D6A0] focus:ring-2 focus:ring-[#00D6A0]/15 dark:border-white/10 dark:bg-[#0b0d0b] dark:text-white dark:placeholder:text-white/25 dark:focus:border-[#00D6A0]";

const labelClass =
  "mb-2 block text-xs font-medium text-[#555c54] dark:text-white/65";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold text-[#06271d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminPage() {
  const navigate = useNavigate();
  const { address: connectedWallet, isConnected } = useAccount();
  const chainId = useChainId();

  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const isArcMainnet = chainId === ARC_MAINNET_ID;
  const contractAddress = getBountyContract(chainId);

  const isAdmin =
    isConnected &&
    Boolean(connectedWallet) &&
    ADMIN_ADDRESSES.some(
      (adminAddress) =>
        adminAddress.toLowerCase() === connectedWallet.toLowerCase(),
    );

  const {
    data: ownerAddress,
    refetch: refetchOwner,
    isLoading: ownerLoading,
    isError: ownerError,
  } = useReadContract({
    ...getOwnerConfig({ chainId }),
    query: {
      enabled: isArcMainnet && Boolean(contractAddress),
    },
  });

  const {
    data: totalFeesRaw,
    refetch: refetchFees,
    isLoading: feesLoading,
  } = useReadContract({
    ...getTotalFeesConfig({ chainId }),
    query: {
      enabled: isArcMainnet && Boolean(contractAddress),
    },
  });

  const {
    data: bountyCountRaw,
    isLoading: bountyCountLoading,
  } = useReadContract({
    ...getBountyCounterConfig({ chainId }),
    query: {
      enabled: isArcMainnet && Boolean(contractAddress),
    },
  });

  const {
    data: feePercentRaw,
    isLoading: feePercentLoading,
  } = useReadContract({
    ...getFeePercentConfig({ chainId }),
    query: {
      enabled: isArcMainnet && Boolean(contractAddress),
    },
  });

  const isOwner =
    Boolean(connectedWallet) &&
    Boolean(ownerAddress) &&
    connectedWallet.toLowerCase() === ownerAddress.toLowerCase();

  const {
    writeContract: writeWithdraw,
    data: withdrawTxHash,
    isPending: isWithdrawPending,
    error: withdrawError,
  } = useWriteContract();

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: withdrawSuccess,
  } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  const {
    writeContract: writeTransfer,
    data: transferTxHash,
    isPending: isTransferPending,
    error: transferError,
  } = useWriteContract();

  const {
    isLoading: isTransferConfirming,
    isSuccess: transferSuccess,
  } = useWaitForTransactionReceipt({
    hash: transferTxHash,
  });

  const txLoading =
    isWithdrawPending ||
    isWithdrawConfirming ||
    isTransferPending ||
    isTransferConfirming;

  useEffect(() => {
    if (!withdrawSuccess) return;

    refetchFees();
    setWithdrawAddress("");
    setFormError("");
    setConfirmAction(null);
  }, [withdrawSuccess, refetchFees]);

  useEffect(() => {
    if (!transferSuccess) return;

    refetchOwner();
    setNewOwnerAddress("");
    setFormError("");
    setConfirmAction(null);
  }, [transferSuccess, refetchOwner]);

  useEffect(() => {
    if (!confirmAction) return undefined;

    const timer = setTimeout(
      () => setConfirmAction(null),
      CONFIRM_TIMEOUT_MS,
    );

    return () => clearTimeout(timer);
  }, [confirmAction]);

  const validateWithdraw = () => {
    const trimmed = withdrawAddress.trim();

    if (!isAddress(trimmed)) {
      setFormError("Enter a valid recipient wallet address.");
      return null;
    }

    if (!isArcMainnet) {
      setFormError("Switch to Arc Mainnet before withdrawing fees.");
      return null;
    }

    if (!isOwner) {
      setFormError(
        "Only the current contract owner can withdraw fees. Admin dashboard access does not grant contract ownership.",
      );
      return null;
    }

    return trimmed;
  };

  const validateTransfer = () => {
    const trimmed = newOwnerAddress.trim();

    if (!isAddress(trimmed)) {
      setFormError("Enter a valid new owner wallet address.");
      return null;
    }

    if (!isArcMainnet) {
      setFormError("Switch to Arc Mainnet before transferring ownership.");
      return null;
    }

    if (
      ownerAddress &&
      trimmed.toLowerCase() === ownerAddress.toLowerCase()
    ) {
      setFormError("That address is already the contract owner.");
      return null;
    }

    if (!isOwner) {
      setFormError(
        "Only the current contract owner can transfer ownership.",
      );
      return null;
    }

    return trimmed;
  };

  const handleWithdrawClick = () => {
    setFormError("");

    if (!validateWithdraw()) return;

    if (confirmAction !== "withdraw") {
      setConfirmAction("withdraw");
      return;
    }

    handleWithdraw();
  };

  const handleWithdraw = () => {
    const recipient = validateWithdraw();

    if (!recipient || !connectedWallet) return;

    writeWithdraw(
      prepareWithdrawTx({
        recipient,
        account: connectedWallet,
        chainId,
      }),
    );
  };

  const handleTransferClick = () => {
    setFormError("");

    if (!validateTransfer()) return;

    if (confirmAction !== "transfer") {
      setConfirmAction("transfer");
      return;
    }

    handleTransferOwnership();
  };

  const handleTransferOwnership = () => {
    const newOwner = validateTransfer();

    if (!newOwner || !connectedWallet) return;

    writeTransfer(
      prepareTransferOwnershipTx({
        newOwner,
        account: connectedWallet,
        chainId,
      }),
    );
  };

  const totalUsdcFees =
    totalFeesRaw == null
      ? "—"
      : Number(formatEther(totalFeesRaw)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        });

  const rawFeePercent =
    feePercentRaw == null ? null : Number(feePercentRaw) / 100;

  const feePercent =
    rawFeePercent == null
      ? "—"
      : Number.isInteger(rawFeePercent)
        ? rawFeePercent.toString()
        : rawFeePercent.toFixed(2);

  if (!connectedWallet) {
    return (
      <main className="theme-page flex min-h-screen items-center justify-center bg-[#f6f5ef] px-4 text-[#171a17] transition-colors duration-300 dark:bg-[#080908] dark:text-white">
        <section className="w-full max-w-sm rounded-2xl border border-[#e5e7e2] bg-white p-7 text-center dark:border-white/10 dark:bg-[#111311] sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center">
            <BrandLogo size="h-12 w-12" />
          </div>

          <h1 className="mt-4 text-xl font-semibold">Connect your wallet</h1>

          <p className="mt-2 text-xs leading-5 text-[#777d76] dark:text-white/50">
            Connect an authorized admin wallet to access the administration
            dashboard.
          </p>

          <button
            onClick={() => navigate("/")}
            className={`${primaryButtonClass} mt-5`}
            style={{ backgroundColor: ACCENT }}
          >
            Return home
          </button>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="theme-page flex min-h-screen items-center justify-center bg-[#f6f5ef] px-4 text-[#171a17] transition-colors duration-300 dark:bg-[#080908] dark:text-white">
        <section className="w-full max-w-sm rounded-2xl border border-[#e5e7e2] bg-white p-7 text-center dark:border-white/10 dark:bg-[#111311] sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl font-semibold text-red-500">
            !
          </div>

          <h1 className="mt-4 text-xl font-semibold">Access restricted</h1>

          <p className="mt-2 text-xs leading-5 text-[#777d76] dark:text-white/50">
            This wallet is not on the Happy Bounty admin allowlist. Connect
            an authorized wallet to continue.
          </p>

          <p className="mt-4 break-all font-mono text-[11px] text-[#858b83] dark:text-white/40">
            Connected wallet: {connectedWallet}
          </p>

          <button
            onClick={() => navigate("/")}
            className={`${primaryButtonClass} mt-5`}
            style={{ backgroundColor: ACCENT }}
          >
            Return home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="theme-page min-h-screen bg-[#f6f5ef] text-[#171a17] transition-colors duration-300 dark:bg-[#080908] dark:text-white">
      <MobileNav onNavigate={navigate} />

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-[#e5e7e2] bg-white/80 px-4 py-5 dark:border-white/[0.08] dark:bg-[#0c0e0c] lg:flex">
          <button
            onClick={() => navigate("/")}
            className="mb-9 flex items-center gap-3 px-2 text-left"
            aria-label="Go to Happy Bounty home"
          >
            <BrandLogo size="h-9 w-9" />

            <span>
              <span className="block text-sm font-bold text-[#171a17] dark:text-white">
                Happy Bounty
              </span>
              <span className="mt-0.5 block text-[10px] text-[#858b83] dark:text-white/40">
                Admin workspace
              </span>
            </span>
          </button>

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#858b83] dark:text-white/35">
            Workspace
          </p>

          <button
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold"
            style={{
              backgroundColor: "rgba(0,214,160,0.10)",
              color: ACCENT_DARK,
            }}
          >
            <span className="dark:text-[#00D6A0]">▦</span>
            <span className="dark:text-[#00D6A0]">Admin overview</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#656b64] transition hover:bg-[#00D6A0]/10 hover:text-[#008A66] dark:text-white/60 dark:hover:text-[#00D6A0]"
          >
            <span>◫</span> Bounties
          </button>

          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#656b64] transition hover:bg-[#00D6A0]/10 hover:text-[#008A66] dark:text-white/60 dark:hover:text-[#00D6A0]"
          >
            <span>＋</span> Create bounty
          </button>

          <div className="mt-auto rounded-xl border border-[#e5e7e2] bg-white/70 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
              <span className="text-xs font-semibold">Arc Mainnet</span>
            </div>

            <p className="mt-2 break-all font-mono text-[10px] leading-4 text-[#858b83] dark:text-white/40">
              {contractAddress || "Contract unavailable on this network"}
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7e2] pb-5 dark:border-white/[0.08]">
            <div className="min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="mb-3 text-[11px] font-medium text-[#858b83] transition hover:text-[#008A66] dark:hover:text-[#00D6A0]"
              >
                ← Back
              </button>

              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#008A66] dark:text-[#00D6A0]">
                Happy Bounty / Control center
              </p>

              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-[#171a17] dark:text-white sm:text-2xl">
                Admin dashboard
              </h1>

              <p className="mt-1.5 text-xs text-[#777d76] dark:text-white/45">
                Monitor contract activity, fees, and ownership.
              </p>

              <p className="mt-2 text-[11px] text-[#858b83] dark:text-white/40">
                Signed in as {shortAddress(connectedWallet)}
                {isOwner ? " · Contract owner" : " · Admin access"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7e2] bg-white px-3 py-2 text-[11px] font-medium dark:border-white/10 dark:bg-[#111311]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
                Arc Mainnet
              </span>

              <button
                onClick={() => navigate("/create")}
                className={primaryButtonClass}
                style={{ backgroundColor: ACCENT }}
              >
                + Create bounty
              </button>
            </div>
          </header>

          {!isArcMainnet && (
            <div className="mb-5">
              <Notice type="warning">
                <p className="font-semibold">Switch to Arc Mainnet</p>
                <p className="mt-1 opacity-80">
                  Contract reads and actions require Arc Mainnet (chain ID{" "}
                  {ARC_MAINNET_ID}). s to continue.
                </p>
              </Notice>
            </div>
          )}

          {isArcMainnet && !contractAddress && (
            <div className="mb-5">
              <Notice type="error">
                No bounty contract is configured for Arc Mainnet. Contract
                information and actions may be unavailable.
              </Notice>
            </div>
          )}

          {isArcMainnet && contractAddress && ownerError && (
            <div className="mb-5">
              <Notice type="warning">
                Could not read the contract owner. Check the network and
                contract configuration before attempting any contract action.
              </Notice>
            </div>
          )}

          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="▤"
              label="Total bounties"
              value={
                bountyCountLoading ? "…" : formatNumber(bountyCountRaw)
              }
              note="Read from the bounty contract"
            />

            <StatCard
              icon="$"
              label="Total fees collected"
              value={
                feesLoading
                  ? "…"
                  : totalUsdcFees === "—"
                    ? "—"
                    : `${totalUsdcFees} USDC`
              }
              note="Contract-reported fee total"
            />

            <StatCard
              icon="%"
              label="Platform fee"
              value={feePercentLoading ? "…" : `${feePercent}%`}
              note="Configured on the bounty contract"
            />

            <StatCard
              icon="◎"
              label="Contract owner"
              value={ownerLoading ? "…" : shortAddress(ownerAddress)}
              note={`Connected wallet: ${shortAddress(connectedWallet)}`}
            />
          </section>

          {!isOwner && (
            <div className="mb-5">
              <Notice type="info">
                <p className="font-semibold">Read-only admin access</p>
                <p className="mt-1">
                  Your wallet can view this dashboard because it is an
                  authorized admin. Only the current contract owner can
                  withdraw fees or transfer ownership. Connect the owner
                  wallet to perform those actions.
                </p>
              </Notice>
            </div>
          )}

          <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_.85fr]">
            <article className="rounded-xl border border-[#e5e7e2] bg-white p-4 dark:border-white/[0.08] dark:bg-[#111311] sm:p-5">
              <SectionHeading
                eyebrow="Treasury"
                title="Withdraw USDC fees"
              />

              <p className="mb-5 max-w-xl text-xs leading-5 text-[#777d76] dark:text-white/45">
                Send collected USDC fees to a recipient wallet. This
                transaction requires the current contract owner and
                confirmation in your wallet.
              </p>

              <label htmlFor="withdraw-address" className={labelClass}>
                Recipient wallet address
              </label>

              <input
                id="withdraw-address"
                value={withdrawAddress}
                onChange={(event) => {
                  setWithdrawAddress(event.target.value);
                  setFormError("");
                  setConfirmAction(null);
                }}
                placeholder="0x…"
                autoComplete="off"
                className={inputClass}
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleWithdrawClick}
                  disabled={
                    !isArcMainnet ||
                    !isOwner ||
                    txLoading ||
                    !withdrawAddress.trim() ||
                    !contractAddress
                  }
                  className={primaryButtonClass}
                  style={{
                    backgroundColor:
                      confirmAction === "withdraw" ? "#f87171" : ACCENT,
                  }}
                >
                  {txLoading
                    ? "Transaction pending…"
                    : confirmAction === "withdraw"
                      ? "Click again to confirm"
                      : "Withdraw USDC"}
                </button>

                <span className="text-[11px] text-[#858b83] dark:text-white/40">
                  USDC only · Arc Mainnet
                </span>
              </div>
            </article>

            <article className="rounded-xl border border-[#e5e7e2] bg-white p-4 dark:border-white/[0.08] dark:bg-[#111311] sm:p-5">
              <SectionHeading eyebrow="Security" title="Ownership" />

              <div className="rounded-lg bg-[#f6f7f3] p-3.5 dark:bg-[#0b0d0b]">
                <p className="text-[11px] text-[#858b83] dark:text-white/40">
                  Current contract owner
                </p>

                <p className="mt-1.5 break-all font-mono text-xs text-[#171a17] dark:text-white">
                  {ownerAddress ||
                    (ownerLoading ? "Loading owner…" : "Unavailable")}
                </p>
              </div>

              <label
                htmlFor="new-owner-address"
                className={`${labelClass} mt-4`}
              >
                New owner address
              </label>

              <input
                id="new-owner-address"
                value={newOwnerAddress}
                onChange={(event) => {
                  setNewOwnerAddress(event.target.value);
                  setFormError("");
                  setConfirmAction(null);
                }}
                placeholder="0x…"
                autoComplete="off"
                className={inputClass}
              />

              <button
                onClick={handleTransferClick}
                disabled={
                  !isArcMainnet ||
                  !isOwner ||
                  txLoading ||
                  !newOwnerAddress.trim() ||
                  !contractAddress
                }
                className="mt-3 w-full rounded-lg border px-4 py-2.5 text-xs font-semibold transition hover:bg-[#00D6A0]/10 disabled:cursor-not-allowed disabled:opacity-40"
                style={
                  confirmAction === "transfer"
                    ? {
                        borderColor: "#f87171",
                        backgroundColor: "rgba(248,113,113,0.08)",
                        color: "#ef4444",
                      }
                    : {
                        borderColor: "rgba(0,214,160,0.45)",
                        color: ACCENT_DARK,
                      }
                }
              >
                {txLoading
                  ? "Transaction pending…"
                  : confirmAction === "transfer"
                    ? "Click again to confirm transfer"
                    : "Transfer ownership"}
              </button>

              <p className="mt-3 text-[11px] leading-5 text-[#858b83] dark:text-white/40">
                Ownership transfer is a sensitive on-chain action. Verify
                the address before confirming.
              </p>
            </article>
          </section>

          {(formError || withdrawError || transferError) && (
            <div className="mb-4">
              <Notice type="error">
                {formError ||
                  withdrawError?.shortMessage ||
                  transferError?.shortMessage ||
                  "Transaction failed. Please check your wallet and try again."}
              </Notice>
            </div>
          )}

          {(withdrawSuccess || transferSuccess) && (
            <div className="mb-4">
              <Notice type="success">
                {withdrawSuccess
                  ? "USDC withdrawal confirmed on-chain."
                  : "Ownership transfer confirmed on-chain."}
              </Notice>
            </div>
          )}

          <section className="rounded-xl border border-[#e5e7e2] bg-white p-4 dark:border-white/[0.08] dark:bg-[#111311] sm:p-5">
            <SectionHeading
              eyebrow="Network status"
              title="Contract connection"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-[#858b83] dark:text-white/40">
                  Network
                </p>
                <p className="mt-1.5 text-xs font-semibold">
                  {isArcMainnet
                    ? "Arc Mainnet"
                    : `Unsupported network · ${chainId ?? "not connected"}`}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-[#858b83] dark:text-white/40">
                  Contract
                </p>
                <p className="mt-1.5 break-all font-mono text-[11px] leading-5">
                  {contractAddress ||
                    "No contract configured for this network"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[#858b83] dark:text-white/40">
                  Owner permissions
                </p>
                <p className="mt-1.5 text-xs font-semibold">
                  {ownerLoading
                    ? "Checking owner…"
                    : isOwner
                      ? "Owner access verified"
                      : "Owner wallet required"}
                </p>
              </div>
            </div>
          </section>

          {txLoading && (
            <div className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
              <div className="app-modal-panel w-full max-w-xs rounded-xl border border-[#e0e5df] bg-[#fbfcf9] p-5 dark:border-white/10 dark:bg-[#111311]">
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>

                <Skeleton className="h-1.5 w-full rounded-full" />

                <p className="mt-4 text-xs font-medium text-[#626a61] dark:text-white/60">
                  Transaction pending. Confirm it in your wallet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
