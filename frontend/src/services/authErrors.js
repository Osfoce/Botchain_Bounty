export const SESSION_EXPIRED_MESSAGE =
  "Your sign-in expired. Sign in with your wallet to continue.";

export const getAuthError = (error) => {
  if (error?.code === 4001 || error?.name === "UserRejectedRequestError") {
    return "Wallet signature was rejected. No session was created.";
  }
  return (
    error?.response?.data?.error ||
    error?.message ||
    "Wallet sign-in failed. Please try again."
  );
};
