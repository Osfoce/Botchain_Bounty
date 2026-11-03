import { useCallback, useEffect, useRef, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "../hooks/useAuth";

function WalletSignupButton({
  onSuccess,
  className = "",
  compact = false,
  showMessage = true,
}) {
  const { address, isConnected, status } = useAccount();
  const { connectModalOpen, openConnectModal } = useConnectModal();
  const { isAuthenticated, isAuthenticating, error, signIn } = useAuth();
  const [connectIntent, setConnectIntent] = useState(false);
  const pickerWasOpened = useRef(false);

  const begin = useCallback(async () => {
    if (isAuthenticating) return;
    if (isConnected && address) {
      const succeeded = await signIn();
      if (succeeded) onSuccess?.();
      return;
    }

    pickerWasOpened.current = false;
    if (!openConnectModal) {
      setConnectIntent(false);
      return;
    }
    setConnectIntent(true);
    openConnectModal();
  }, [address, isAuthenticating, isConnected, onSuccess, openConnectModal, signIn]);

  useEffect(() => {
    if (!connectIntent) return;

    if (connectModalOpen) pickerWasOpened.current = true;

    if (isConnected && address) {
      setConnectIntent(false);
      void signIn().then((succeeded) => {
        if (succeeded) onSuccess?.();
      });
      return;
    }

    // Clear the intent if the user dismisses the picker. A wallet restored
    // later must not unexpectedly trigger a signature prompt.
    if (
      pickerWasOpened.current &&
      !connectModalOpen &&
      status === "disconnected"
    ) {
      setConnectIntent(false);
    }
  }, [address, connectIntent, connectModalOpen, isConnected, onSuccess, signIn, status]);

  const label = isAuthenticating
    ? "Signing in…"
    : isAuthenticated
      ? "Signed in"
      : isConnected
        ? "Sign a message to continue"
        : connectIntent
          ? "Choose a wallet…"
          : "Continue with wallet";

  return (
    <div className={`flex ${compact ? "w-auto" : "w-full"} flex-col items-center gap-2`}>
      {!isAuthenticated && (
        <button
          type="button"
          onClick={begin}
          disabled={isAuthenticating || connectIntent}
          className={`${compact ? "w-auto" : "w-full"} rounded-xl bg-[#00D6A0] px-4 py-3 text-sm font-bold text-[#06251c] transition hover:bg-[#00e6ac] disabled:cursor-wait disabled:opacity-60 ${className}`}
        >
          {label}
        </button>
      )}
      {!isAuthenticated && showMessage && (
        <p className="text-center text-xs text-current/65">
          Sign a message to verify your wallet. This is not a transaction and
          does not spend gas.
        </p>
      )}
      {error && !isAuthenticated && (
        <p role="alert" className="text-center text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default WalletSignupButton;
