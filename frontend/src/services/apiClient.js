import axios from "axios";

let accessSession = null;
let activeWallet = null;
const SESSION_STORAGE_KEY = "happy-bounty:auth-session";
export const SESSION_EXPIRED_EVENT = "happy-bounty:session-expired";

const readStoredSession = () => {
  try {
    const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (
      typeof session.token !== "string" ||
      typeof session.walletAddress !== "string" ||
      !Number.isSafeInteger(Number(session.chainId))
    ) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return {
      token: session.token,
      walletAddress: session.walletAddress.toLowerCase(),
      chainId: Number(session.chainId),
    };
  } catch {
    return null;
  }
};

accessSession = readStoredSession();

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (
    accessSession &&
    accessSession.walletAddress === activeWallet?.address
  ) {
    config.headers.Authorization = `Bearer ${accessSession.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && accessSession) {
      setAccessToken(null);
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export const setAccessToken = (token, walletAddress, chainId) => {
  accessSession = token
    ? {
        token,
        walletAddress: walletAddress.toLowerCase(),
        chainId,
      }
    : null;

  try {
    if (accessSession) {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(accessSession),
      );
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Authentication still works for the current page if storage is unavailable.
  }
};

export const getAccessSession = () =>
  accessSession ? { ...accessSession } : null;

export const setActiveWallet = (walletAddress, chainId) => {
  activeWallet = walletAddress ? { address: walletAddress, chainId } : null;
};

export default apiClient;
