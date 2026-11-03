const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const retryUntilVerified = async (
  synchronize,
  { maxAttempts = 60, intervalMs = 5000 } = {},
) => {
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await synchronize();
      const pending =
        response.status === 202 ||
        response.data?.status === "pending_confirmation" ||
        response.data?.status === "pending";
      if (!pending) return response;
      lastError = new Error(
        response.data?.error || "Transaction is awaiting required confirmations",
      );
    } catch (error) {
      if (
        error.response?.status !== 503 ||
        error.response?.data?.retryable !== true
      ) {
        throw error;
      }
      lastError = error;
    }

    if (attempt + 1 < maxAttempts) await wait(intervalMs);
  }

  const error = new Error(
    "Transaction is still awaiting verification. Retry synchronization with the same transaction hash.",
  );
  error.code = "TRANSACTION_SYNC_PENDING";
  error.cause = lastError;
  throw error;
};
