import { useAccount } from "wagmi";
import { useAuth } from "../hooks/useAuth";

function WalletAuthControl() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, error, signOut } = useAuth();

  if (!isConnected || !address || !isAuthenticated) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={signOut}
        title="Revoke your Happy Bounty session and disconnect your wallet"
        className="rounded-full border border-[#00D6A0]/35 px-3 py-1.5 text-xs font-semibold text-[#00b889] transition-colors hover:bg-[#00D6A0]/10 disabled:cursor-wait disabled:opacity-60"
      >
        Sign out & disconnect
      </button>
      {error && (
        <p role="alert" className="max-w-64 text-center text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default WalletAuthControl;
