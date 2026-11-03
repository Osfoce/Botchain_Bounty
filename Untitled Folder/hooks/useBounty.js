// hooks/useBounty.js
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useChainId,
  usePublicClient,
} from "wagmi";
import { useState, useEffect } from "react";
import { parseEventLogs } from "viem";
import { showToast } from "../components/UI/Toast";
import {
  prepareCreateBountyTx,
  prepareClaimTx,
  getClaimableConfig,
  prepareAssignSingleWinnerTx,
  prepareAssignMultipleWinnersTx,
  prepareSubmitTx,
  getClaimedConfig,
  getBountyInfoConfig,
  getAvailableBountiesConfig,
  getBountiesByCreatorConfig,
  getUserSubmissionsConfig,
  getTotalFeesConfig,
  getBountyCounterConfig,
  getFeePercentConfig,
  getMaxWinnersConfig,
  getOwnerConfig,
  prepareWithdrawTx,
  formatReward,
} from "../services/bountyService";
import { BOUNTY_ABI } from "../utils/abi";

export const useBounty = () => {
  const { address: account } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  // Transaction states
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  // Wagmi write hook
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction receipt (for UI feedback)
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isWaiting) {
      setIsConfirming(true);
      setIsPending(false);
    } else if (isSuccess) {
      setIsConfirming(false);
      setTxHash(null);
      // showToast success is already shown inside executeTx, but we keep this for consistency
    }
  }, [isWaiting, isSuccess]);

  /* ------------------------------------------------------------------ */
  /*                     CORE TRANSACTION EXECUTOR                      */
  /* ------------------------------------------------------------------ */
  const executeTx = async (prepareFn, params, options = {}) => {
    const { successMessage = "Transaction successful", eventName } = options;

    if (!account) {
      showToast.error("Please connect your wallet");
      throw new Error("No account connected");
    }
    if (!chainId) {
      showToast.error("No network detected");
      throw new Error("No chain ID");
    }

    // Prepare the tx config — wrap in try/catch because prepare fns can throw
    // (e.g., getPayoutType throws on an unknown payout type).
    let txConfig;
    try {
      txConfig = prepareFn({ ...params, account, chainId });
    } catch (err) {
      console.error("Failed to prepare transaction:", err);
      showToast.error(err.message || "Invalid transaction parameters");
      throw err;
    }

    if (!txConfig.address) {
      showToast.error("Contract not deployed on this network");
      throw new Error("Contract address missing");
    }

    setIsPending(true);
    setIsConfirming(false);
    setTxError(null);
    let hash = null;
    try {
      // Send transaction
      hash = await writeContractAsync(txConfig);

      setTxHash(hash);
      setIsPending(false);
      setIsConfirming(true);

      showToast.loading("Transaction sent. Waiting for confirmation...", {
        id: hash,
      });

      setIsConfirming(false); // block mined

      // ...........
      // Wait for receipt using public client
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // console.log("Receipt logs:", receipt.logs);
      // console.log("Full receipt:", receipt);

      if (receipt.status !== "success") {
        throw new Error("Transaction reverted");
      }

      // Success showToast
      showToast.success(successMessage, { id: hash });

      // Parse event if requested
      let eventData = null;
      if (eventName && receipt.logs.length > 0) {
        const events = parseEventLogs({
          abi: BOUNTY_ABI,
          logs: receipt.logs,
          eventName: eventName,
        });

        const matched = events.find((e) => e.eventName === eventName);

        if (matched) eventData = matched.args;
      }

      return { hash, receipt, eventData };
    } catch (err) {
      console.error(err);
      setTxError(err);
      setIsPending(false);
      setIsConfirming(false);
      showToast.error(
        err.shortMessage || err.message || "Transaction failed",
        hash ? { id: hash } : undefined,
      );
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*                   FETCH BOUNTY ID FROM A TRANSACTION               */
  /* ------------------------------------------------------------------ */

  /**
   * Resolve a bounty ID from a createBounty transaction.
   *
   * Primary path: parse the `BountyCreated` event from the receipt.
   * Fallback path: read `bountyCounter()` and use the current value —
   *   the counter is incremented on every createBounty, so the latest
   *   bounty ID equals the counter's current value.
   *
   * The fallback is useful when:
   *  - the receipt logs are missing (rare RPC issue)
   *  - the event was emitted but the log decoder fails
   *  - you're on a chain where the indexer hasn't caught up
   *
   * @param {`0x${string}`} txHash
   * @returns {Promise<number|null>} bountyId or null on failure
   */

  const fetchBountyIdFromTx = async (txHash) => {
    // console.log(`Fetching bountyId from txHash: ${txHash}`);
    // console.log(typeof txHash);

    if (!txHash) {
      showToast.error("Transaction hash is required");
      return null;
    }

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status !== "success") {
        throw new Error("Transaction reverted");
      }

      // console.log("Receipt logs for bountyId fetch:", receipt.logs);
      // console.log("Full receipt for bountyId fetch:", receipt);

      // ---- Primary: parse the BountyCreated event ----
      try {
        const events = parseEventLogs({
          abi: BOUNTY_ABI,
          logs: receipt.logs,
          eventName: "BountyCreated",
        });
        const eventBountyId = events?.[0]?.args?.bountyId;
        if (eventBountyId !== undefined && eventBountyId !== null) {
          return Number(eventBountyId);
        }
      } catch (parseErr) {
        console.warn(
          "Failed to parse BountyCreated event, falling back to counter:",
          parseErr,
        );
      }

      // ---- Fallback: read bountyCounter() ----
      if (!chainId) return null;
      const config = getBountyCounterConfig({ chainId });
      if (!config?.address) return null;

      const counter = await publicClient.readContract({
        address: config.address,
        abi: config.abi,
        functionName: config.functionName,
        args: config.args,
      });

      // counter is a bigint; the latest bounty ID equals the counter value
      // because the contract increments the counter BEFORE storing the bounty.
      return counter !== undefined && counter !== null ? Number(counter) : null;
    } catch (error) {
      console.error(error);
      showToast.error("Failed to retrieve bountyId from transaction");
      return null;
    }
  };

  /* ------------------------------------------------------------------ */
  /*                         READ HOOKS                                 */
  /* ------------------------------------------------------------------ */

  const useClaimableReward = (bountyId, user) => {
    return useReadContract({
      ...(bountyId && user && chainId
        ? getClaimableConfig({ bountyId, user, chainId })
        : {}),
      query: {
        enabled: !!bountyId && !!user && !!chainId,
      },
    });
  };

  const useClaimedStatus = (bountyId, user) => {
    return useReadContract({
      ...(bountyId && user && chainId
        ? getClaimedConfig({ bountyId, user, chainId })
        : {}),
      query: {
        enabled: !!bountyId && !!user && !!chainId,
      },
    });
  };

  const useBountyInfo = (bountyId) => {
    const config =
      bountyId && chainId ? getBountyInfoConfig({ bountyId, chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!bountyId && !!chainId && !!config?.address },
    });
  };

  const useAvailableBounties = () => {
    const config = chainId ? getAvailableBountiesConfig({ chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!chainId && !!config?.address },
    });
  };

  const useBountiesByCreator = (creator) => {
    const config =
      creator && chainId
        ? getBountiesByCreatorConfig({ creator, chainId })
        : null;
    return useReadContract({
      ...config,
      query: { enabled: !!creator && !!chainId && !!config?.address },
    });
  };

  const useUserSubmissions = (user) => {
    const config =
      user && chainId ? getUserSubmissionsConfig({ user, chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!user && !!chainId && !!config?.address },
    });
  };

  const useTotalFees = () => {
    const config = chainId ? getTotalFeesConfig({ chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!chainId && !!config?.address },
    });
  };

  const useBountyCounter = () => {
    const config = chainId ? getBountyCounterConfig({ chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!chainId && !!config?.address },
    });
  };

  const useFeePercent = () => {
    const config = chainId ? getFeePercentConfig({ chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!chainId && !!config?.address },
    });
  };

  const useMaxWinners = () => {
    const config = chainId ? getMaxWinnersConfig({ chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!chainId && !!config?.address },
    });
  };

  const useOwner = () => {
    const config = chainId ? getOwnerConfig({ chainId }) : null;
    return useReadContract({
      ...config,
      query: { enabled: !!chainId && !!config?.address },
    });
  };

  /* ------------------------------------------------------------------ */
  /*                        WRITE ACTIONS                               */
  /* ------------------------------------------------------------------ */

  const createBounty = async (bountyData) => {
    return executeTx(
      prepareCreateBountyTx,
      { bountyData },
      {
        successMessage: "Bounty created!",
        eventName: "BountyCreated",
      },
    );
  };

  const claimReward = async (bountyId) => {
    return executeTx(
      prepareClaimTx,
      { bountyId },
      {
        successMessage: "Reward claimed!",
        eventName: "RewardClaimed",
      },
    );
  };

  const assignSingleWinner = async (bountyId, winner) => {
    return executeTx(
      prepareAssignSingleWinnerTx,
      { bountyId, winner },
      {
        successMessage: "Winner assigned!",
        eventName: "RewardsAssigned",
      },
    );
  };

  const assignMultipleWinners = async (bountyId, winners, percentages) => {
    return executeTx(
      prepareAssignMultipleWinnersTx,
      { bountyId, winners, percentages },
      {
        successMessage: "Winners assigned!",
        eventName: "RewardsAssigned",
      },
    );
  };

  const submitSolution = async (bountyId, link) => {
    return executeTx(
      prepareSubmitTx,
      { bountyId, link },
      {
        successMessage: "Solution submitted!",
      },
    );
  };

  /**
   * Withdraw accumulated protocol fees (owner only).
   * The contract uses the selected network's native token, so there's no token type argument.
   */

  const withdrawFees = async (recipient) => {
    return executeTx(
      prepareWithdrawTx,
      { recipient },
      { successMessage: "Fees withdrawn!", eventName: "FeeWithdrawn" },
    );
  };

  /* ------------------------------------------------------------------ */
  /*                             RETURN                                 */
  /* ------------------------------------------------------------------ */

  return {
    // States
    isPending,
    isConfirming,
    txHash,
    txError,

    // Helpers
    fetchBountyIdFromTx,
    formatReward,

    // Read hooks
    useClaimableReward,
    useClaimedStatus,
    useBountyInfo,
    useAvailableBounties,
    useBountiesByCreator,
    useUserSubmissions,
    useTotalFees,
    useBountyCounter,
    useFeePercent,
    useMaxWinners,
    useOwner,

    // Write actions
    createBounty,
    claimReward,
    assignSingleWinner,
    assignMultipleWinners,
    submitSolution,
    withdrawFees,
  };
};
