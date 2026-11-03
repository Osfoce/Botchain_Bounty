import axios from "axios";

let accessSession = null;
let activeWallet = null;
export const SESSION_EXPIRED_EVENT = "happy-bounty:session-expired";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (
    accessSession &&
    accessSession.walletAddress === activeWallet?.address &&
    accessSession.chainId === activeWallet?.chainId
  ) {
    config.headers.Authorization = `Bearer ${accessSession.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && accessSession) {
      accessSession = null;
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
};

export const setActiveWallet = (walletAddress, chainId) => {
  activeWallet = walletAddress ? { address: walletAddress, chainId } : null;
};

export default apiClient;
