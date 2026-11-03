import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { getAccount } from "@wagmi/core";
import { useConfig } from "wagmi";
import apiClient, {
  SESSION_EXPIRED_EVENT,
  setActiveWallet,
  setAccessToken,
} from "../services/apiClient";
import AuthContext from "./authContext";
import {
  getAuthError,
  SESSION_EXPIRED_MESSAGE,
} from "../services/authErrors";

export function AuthProvider({ children }) {
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const config = useConfig();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    setActiveWallet(
      isConnected ? address?.toLowerCase() : null,
      isConnected ? chainId : null,
    );
  }, [address, chainId, isConnected]);

  const signIn = useCallback(async () => {
    setError("");
    if (!isConnected || !address || !chainId) {
      setError("Connect a supported wallet before signing in.");
      return;
    }

    const requestedAddress = address.toLowerCase();
    const requestedChainId = chainId;
    const ensureSameWallet = () => {
      const current = getAccount(config);
      if (
        !current.isConnected ||
        current.address?.toLowerCase() !== requestedAddress ||
        current.chainId !== requestedChainId
      ) {
        throw new Error("Your wallet changed during sign-in. Please try again.");
      }
    };

    setIsAuthenticating(true);
    try {
      const { data: challenge } = await apiClient.post("/auth/nonce", {
        address,
        chainId,
      });
      ensureSameWallet();
      const signature = await signMessageAsync({ message: challenge.message });
      ensureSameWallet();
      const { data } = await apiClient.post("/auth/verify", {
        message: challenge.message,
        signature,
      });

      ensureSameWallet();
      if (
        data.walletAddress?.toLowerCase() !== requestedAddress ||
        Number(data.chainId) !== requestedChainId
      ) {
        throw new Error("The verified wallet did not match the connected wallet.");
      }
      setAccessToken(data.token, data.walletAddress, data.chainId);
      setSession({
        token: data.token,
        walletAddress: data.walletAddress.toLowerCase(),
        chainId: data.chainId,
      });
      return true;
    } catch (signInError) {
      setError(getAuthError(signInError));
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, chainId, config, isConnected, signMessageAsync]);

  const clearSession = useCallback(async (activeSession = session) => {
    setAccessToken(null);
    setSession(null);
    setError("");
    if (!activeSession) return;

    try {
      await apiClient.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${activeSession.token}` } },
      );
    } catch {
      setError("The session was cleared here, but server revocation could not be confirmed.");
    }
  }, [session]);

  const signOut = useCallback(async () => {
    // clearSession removes local auth immediately and revokes the server token.
    // Disconnecting here makes app sign-out and RainbowKit disconnect match.
    const revocation = clearSession(session);
    disconnect();
    await revocation;
  }, [clearSession, disconnect, session]);

  useEffect(() => {
    if (
      session &&
      (!isConnected ||
        !address ||
        session.walletAddress !== address.toLowerCase() ||
        session.chainId !== chainId)
    ) {
      void clearSession(session);
    }
  }, [address, chainId, clearSession, isConnected, session]);

  useEffect(() => {
    const handleExpiredSession = () => {
      setAccessToken(null);
      setSession(null);
      setError(SESSION_EXPIRED_MESSAGE);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(
        session &&
          isConnected &&
          address &&
          session.walletAddress === address.toLowerCase() &&
          session.chainId === chainId,
      ),
      isAuthenticating,
      error,
      signIn,
      signOut,
    }),
    [address, chainId, error, isAuthenticating, isConnected, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
