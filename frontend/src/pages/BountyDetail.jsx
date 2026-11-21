import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiClient from "../services/apiClient";
import { useAuth } from "../hooks/useAuth";
import { showToast } from "../components/UI/Toast";
import {
  FiArrowLeft,
  FiArrowUp,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiExternalLink,
  FiInfo,
  FiLink,
  FiSearch,
  FiShield,
  FiTag,
  FiUsers,
  FiX,
  FiZap,
  FiMessageCircle,
  FiCalendar,
  FiAward,
  FiUploadCloud,
  FiSend,
  FiGlobe,
  FiEdit2,
  FiCopy,
} from "react-icons/fi";
import NavBar from "../components/Layout/NavBar";
import Footer from "../components/Layout/Footer";
import {
  getBountyContract,
  getNativeToken,
  getExplorerUrl,
} from "../utils/chains.address";
import { supportedChains } from "../rainbowChains";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWatchContractEvent,
} from "wagmi";
import { createPublicClient, formatEther, http } from "viem";
import { useBounty } from "../hooks/useBounty";
import { BOUNTY_ABI } from "../utils/abi";
import { formatAmount } from "../utils/format";
import { BountyDetailSkeleton } from "../components/UI/Skeleton";
import { safeExternalUrl } from "../utils/safeExternalUrl";
import {
  clearDistributionSyncRecord,
  getDistributionSyncStorageKey,
  isValidDistributionSyncRecord,
  readDistributionSyncRecord,
  saveDistributionSyncRecord,
} from "../utils/distributionSync";
import { retryUntilVerified } from "../services/transactionSync";

const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toLocalDateInput = (value) => {
  const date = parseDate(value);
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const formatCountdownParts = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

const getBrowserStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn("Browser storage is unavailable:", error);
    return null;
  }
};

const getPendingClaimSyncKey = (bountyId, walletAddress) =>
  `happy-bounty:pending-claim:${String(bountyId)}:${walletAddress.toLowerCase()}`;

const readPendingClaimSync = (storage, key) => {
  try {
    return storage?.getItem(key) || null;
  } catch (error) {
    console.warn("Could not read pending claim synchronization:", error);
    return null;
  }
};

const clearPendingClaimSync = (storage, key) => {
  try {
    storage?.removeItem(key);
  } catch (error) {
    console.warn("Could not clear pending claim synchronization:", error);
  }
};

const getSubmissionDraftKey = (bountyId, walletAddress) =>
  `happy-bounty:submission-draft:${String(bountyId)}:${walletAddress.toLowerCase()}`;

const fetchContributorJourney = async (walletAddress, bountyId) =>
  Promise.allSettled([
    apiClient.get(`/user/get-enrollment/${walletAddress}`, {
      params: { bountyId },
    }),
    apiClient.get(`/bounty/user/submissions/${walletAddress}`, {
      params: { bountyId },
    }),
  ]);

const BountyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const {
    claimReward,
    assignSingleWinner,
    assignMultipleWinners,
    useClaimableReward,
    useClaimedStatus,
    fetchBountyIdFromTx,
    isPending: isContractPending,
    isConfirming: isContractConfirming,
  } = useBounty();

  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasUserSubmitted, setHasUserSubmitted] = useState(false);
  const [userSubmission, setUserSubmission] = useState(null);
  const [winnersData, setWinnersData] = useState(null);
  const [offChainClaimable, setOffChainClaimable] = useState("0");
  const [hasUserClaimedOffChain, setHasUserClaimedOffChain] = useState(false);
  const [pendingClaimSync, setPendingClaimSync] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimSyncing, setIsClaimSyncing] = useState(false);
  const [claimPhase, setClaimPhase] = useState("");
  const [claimSyncError, setClaimSyncError] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [distributionPhase, setDistributionPhase] = useState("");
  const [pendingDistributionSync, setPendingDistributionSync] = useState(null);
  const [isRefreshingReviewQueue, setIsRefreshingReviewQueue] = useState(false);
  const [reviewQueueError, setReviewQueueError] = useState("");
  const [submissionImage, setSubmissionImage] = useState(null);
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [loadedSubmissionDraftKey, setLoadedSubmissionDraftKey] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSizeWarning, setImageSizeWarning] = useState("");
  const [winnerAddresses, setWinnerAddresses] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState("checking");
  const [submissionStatusError, setSubmissionStatusError] = useState(false);
  const [isRefreshingContributorStatus, setIsRefreshingContributorStatus] = useState(false);
  const [contributorStatusError, setContributorStatusError] = useState("");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantPage, setParticipantPage] = useState(1);
  const [participantPagination, setParticipantPagination] = useState(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showEditBountyModal, setShowEditBountyModal] = useState(false);
  const [savingBountyEdits, setSavingBountyEdits] = useState(false);
  const [editBountyForm, setEditBountyForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [editBountyErrors, setEditBountyErrors] = useState({});
  const [createdBountyNotice, setCreatedBountyNotice] = useState(
    () => location.state?.createdBounty || null,
  );
  const bountyLoaded = Boolean(bounty);

  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);
  const editDialogRef = useRef(null);
  const editTitleInputRef = useRef(null);
  const editTriggerRef = useRef(null);
  const savingBountyEditsRef = useRef(savingBountyEdits);
  savingBountyEditsRef.current = savingBountyEdits;
  const pendingClaimSyncRef = useRef(null);
  const claimActionRef = useRef(false);
  const claimSyncInFlightRef = useRef(false);
  const contributorStatusRefreshRef = useRef(null);
  const reviewRefreshRef = useRef(0);
  const submissionDraftKey = id && address ? getSubmissionDraftKey(id, address) : null;

  useEffect(() => {
    if (!showEditBountyModal) return undefined;
    editTitleInputRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !savingBountyEditsRef.current) {
        setShowEditBountyModal(false);
        return;
      }
      if (event.key !== "Tab" || !editDialogRef.current) return;
      const focusable = [...editDialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      editTriggerRef.current?.focus();
    };
  }, [showEditBountyModal]);

  useEffect(() => {
    setSubmissionDescription("");
    setSubmissionLink("");
    setSubmissionImage(null);
    setImagePreview(null);
    setImageSizeWarning("");
    setLoadedSubmissionDraftKey(null);
    if (!submissionDraftKey || hasUserSubmitted) return;
    const storage = getBrowserStorage();
    try {
      const saved = JSON.parse(storage?.getItem(submissionDraftKey) || "null");
      if (saved && typeof saved === "object") {
        setSubmissionDescription(typeof saved.description === "string" ? saved.description : "");
        setSubmissionLink(typeof saved.projectLink === "string" ? saved.projectLink : "");
      }
    } catch (error) {
      console.warn("Could not restore submission draft:", error);
    }
    setLoadedSubmissionDraftKey(submissionDraftKey);
  }, [submissionDraftKey, hasUserSubmitted]);

  useEffect(() => {
    if (!submissionDraftKey || loadedSubmissionDraftKey !== submissionDraftKey || hasUserSubmitted) return;
    try {
      getBrowserStorage()?.setItem(
        submissionDraftKey,
        JSON.stringify({ description: submissionDescription, projectLink: submissionLink }),
      );
    } catch (error) {
      console.warn("Could not save submission draft:", error);
    }
  }, [submissionDraftKey, loadedSubmissionDraftKey, hasUserSubmitted, submissionDescription, submissionLink]);

  useEffect(() => {
    if (!location.state?.createdBounty) return;
    setCreatedBountyNotice(location.state.createdBounty);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const copyBountyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast.success("Bounty link copied.");
    } catch (error) {
      console.warn("Could not copy bounty link:", error);
      showToast.error("Could not copy the link. Copy it from your browser address bar.");
    }
  };

  useEffect(() => {
    if (!bounty?.network || !id) return;
    const key = getDistributionSyncStorageKey(Number(bounty.network), id);
    const record = readDistributionSyncRecord(getBrowserStorage(), key);
    if (
      record &&
      record.bountyId === String(id) &&
      record.chainId === Number(bounty.network) &&
      String(record.blockchainId) === String(bounty.blockchainId)
    ) {
      setPendingDistributionSync(record);
    }
  }, [bounty, id]);

  const blockchainId =
    bounty?.blockchainId !== null && bounty?.blockchainId !== undefined
      ? Number(bounty.blockchainId)
      : null;
  const parsedBountyChainId =
    bounty?.network != null ? Number(bounty.network) : undefined;
  const bountyChainId = Number.isInteger(parsedBountyChainId)
    ? parsedBountyChainId
    : undefined;

  const { data: onChainClaimable, refetch: refetchClaimable } =
    useClaimableReward(blockchainId, address, bountyChainId);

  const { data: onChainClaimed, refetch: refetchOnChainClaimed } = useClaimedStatus(
    blockchainId,
    address,
    bountyChainId,
  );

  useEffect(() => {
    if (blockchainId !== null && address) refetchClaimable();
  }, [blockchainId, address, bountyChainId, refetchClaimable]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 350);

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Refresh the countdown every second.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const handleGoBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/dashboard");
  };

  const getHostname = (url) => {
    const safeUrl = safeExternalUrl(url);
    return safeUrl ? new URL(safeUrl).hostname : "";
  };

  const shortenAddress = (value) =>
    value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Unknown";

  const formatDate = (value) => {
    const date = parseDate(value);

    if (!date) return "Not set";

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatDateTime = (value) => {
    const date = parseDate(value);

    if (!date) return "";

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const isValidUrl = (value) => {
    if (!value) return "";
    if (value.length > 2048) return "URL must be 2048 characters or fewer.";
    let url;

    try {
      url = new URL(value);
    } catch {
      return "Enter a complete URL, e.g. https://github.com/user/repo";
    }

    if (!["http:", "https:"].includes(url.protocol))
      return "Only HTTP and HTTPS links are allowed";

    if (url.username || url.password)
      return "URLs containing embedded credentials are not allowed";

    if (
      !/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*\.[A-Za-z]{2,}$/.test(
        url.hostname,
      )
    ) {
      return "Enter a valid domain, e.g. github.com or figma.com";
    }

    return "";
  };

  const compressImage = (file, maxWidth = 1024, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context)
            return reject(new Error("Image processing unavailable"));

          context.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Image compression failed"));

              resolve(
                new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }),
              );
            },
            "image/jpeg",
            quality,
          );
        };

        img.onerror = () => reject(new Error("Unable to read this image"));
        img.src = event.target.result;
      };

      reader.onerror = () => reject(new Error("Unable to read this file"));
      reader.readAsDataURL(file);
    });

  const loadParticipants = async (bountyId, page = 1) => {
    setParticipantsLoading(true);
    try {
      const { data } = await apiClient.get(`/bounty/${bountyId}/participants`, {
        params: { page, limit: 20 },
      });
      setParticipants(data.participants || []);
      setParticipantPagination(data.pagination || null);
      setParticipantPage(page);
    } catch (error) {
      console.error("Error loading bounty participants:", error);
      setParticipants([]);
      setParticipantPagination(null);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const loadWinnersData = useCallback(async (bountyId) => {
    try {
      const { data } = await axios.get(`${API_URL}/bounty/${bountyId}/winners`);

      setWinnersData(data);

      if (address && data.isDistributed) {
        const [{ data: claimable }, { data: claimed }] = await Promise.all([
          axios.get(`${API_URL}/bounty/${bountyId}/claimable/${address}`),
          axios.get(`${API_URL}/bounty/${bountyId}/has-claimed/${address}`),
        ]);

        setOffChainClaimable(claimable.claimableFormatted || "0");
        setHasUserClaimedOffChain(Boolean(claimed.hasClaimed));
      }
      return true;
    } catch (error) {
      console.error("Error loading winners:", error);
      return false;
    }
  }, [API_URL, address]);

  const refreshCreatorReview = useCallback(async (force = false) => {
    if (!id || (reviewRefreshRef.current && !force)) return false;
    const requestId = reviewRefreshRef.current + 1;
    reviewRefreshRef.current = requestId;
    setIsRefreshingReviewQueue(true);
    const [bountyResult, winnersResult] = await Promise.allSettled([
      apiClient.get(`/bounty/${id}`),
      loadWinnersData(id),
    ]);

    if (reviewRefreshRef.current !== requestId) return false;

    const bountyLoaded = bountyResult.status === "fulfilled";
    if (bountyLoaded) {
      const updated = bountyResult.value.data.bounty || bountyResult.value.data;
      setBounty((previous) => ({ ...previous, ...updated }));
      setAllSubmissions(updated.submissions?.items || []);
    }
    const winnersLoaded = winnersResult.status === "fulfilled" && winnersResult.value;
    const failed = !bountyLoaded || !winnersLoaded;
    setReviewQueueError(failed ? "Some review or reward information could not be refreshed. Try again." : "");
    setIsRefreshingReviewQueue(false);
    reviewRefreshRef.current = 0;
    return !failed;
  }, [id, loadWinnersData]);

  const refreshRewardStatus = useCallback(async () => {
    if (!id) return;
    const [bountyResult] = await Promise.allSettled([
      apiClient.get(`/bounty/${id}`),
      loadWinnersData(id),
      refetchClaimable(),
      refetchOnChainClaimed(),
    ]);
    if (bountyResult.status === "fulfilled") {
      const updated = bountyResult.value.data.bounty || bountyResult.value.data;
      setBounty((previous) => ({ ...previous, ...updated }));
    }
  }, [id, loadWinnersData, refetchClaimable, refetchOnChainClaimed]);

  const refreshAfterBountyEvent = useCallback((logs) => {
    if (!logs.some((log) => String(log.args?.bountyId) === String(blockchainId))) {
      return;
    }
    // Chain events reach every open bounty page, so all viewers refresh the
    // database projection as soon as winner assignment or a claim is confirmed.
    const refresh = () => {
      void Promise.allSettled([
        refreshCreatorReview(true),
        refreshRewardStatus(),
      ]);
    };
    refresh();
    // The event can arrive just before the backend finishes projecting it.
    // Follow up shortly so other viewers pick up the committed DB state too.
    window.setTimeout(refresh, 1500);
    window.setTimeout(refresh, 5000);
  }, [blockchainId, refreshCreatorReview, refreshRewardStatus]);

  const bountyContractAddress = bounty
    ? getBountyContract(Number(bounty.network))
    : undefined;
  const bountyEventWatchEnabled = Boolean(
    bountyContractAddress && blockchainId !== null,
  );

  useWatchContractEvent({
    address: bountyContractAddress,
    abi: BOUNTY_ABI,
    chainId: bounty?.network ? Number(bounty.network) : undefined,
    eventName: "RewardsAssigned",
    enabled: bountyEventWatchEnabled,
    onLogs: refreshAfterBountyEvent,
    onError: (error) => console.warn("Could not watch reward assignment events:", error),
  });

  useWatchContractEvent({
    address: bountyContractAddress,
    abi: BOUNTY_ABI,
    chainId: bounty?.network ? Number(bounty.network) : undefined,
    eventName: "RewardClaimed",
    enabled: bountyEventWatchEnabled,
    onLogs: refreshAfterBountyEvent,
    onError: (error) => console.warn("Could not watch reward claim events:", error),
  });

  const syncClaimRecord = useCallback(async (record, { automatic = false } = {}) => {
    if (!record || !address || !isAuthenticated || claimSyncInFlightRef.current) return false;
    claimSyncInFlightRef.current = true;
    setIsClaimSyncing(true);
    setClaimSyncError("");

    const storage = getBrowserStorage();
    const storageKey = getPendingClaimSyncKey(record.bountyId, record.walletAddress);
    let currentRecord = { ...record, status: record.status || "pending_sync" };

    try {
      if (currentRecord.status === "pending_confirmation") {
        setClaimPhase("Checking transaction confirmation");
        const chain = supportedChains.find(
          (supportedChain) => supportedChain.id === Number(currentRecord.chainId),
        );
        if (!chain) throw new Error("The claim network is unavailable. Select its supported network and check again.");

        let receipt;
        try {
          const client = createPublicClient({
            chain,
            transport: http(chain.rpcUrls.default.http[0]),
          });
          receipt = await client.getTransactionReceipt({ hash: currentRecord.txHash });
        } catch (error) {
          if (error.name === "TransactionReceiptNotFoundError" || error.name === "TimeoutError") {
            setClaimSyncError("The network has not confirmed this claim yet. Check again shortly; this will not submit another transaction.");
            return false;
          }
          throw error;
        }

        if (receipt.status !== "success") {
          clearPendingClaimSync(storage, storageKey);
          setPendingClaimSync(null);
          pendingClaimSyncRef.current = null;
          setClaimSyncError("The claim transaction reverted on-chain. No reward was claimed.");
          showToast.error("The claim transaction reverted on-chain.");
          return false;
        }

        currentRecord = { ...currentRecord, status: "pending_sync" };
        try {
          storage?.setItem(storageKey, JSON.stringify(currentRecord));
        } catch (error) {
          console.warn("Could not update claim recovery status:", error);
        }
        setPendingClaimSync(currentRecord);
      }

      setClaimPhase("Updating your account");
      await retryUntilVerified(
        () => apiClient.post(`/bounty/${currentRecord.bountyId}/claim`, { txHash: currentRecord.txHash }),
        { maxAttempts: automatic ? 3 : 6, intervalMs: 2000 },
      );

      clearPendingClaimSync(storage, storageKey);
      pendingClaimSyncRef.current = null;
      setPendingClaimSync(null);
      setClaimSyncError("");
      await refreshRewardStatus();
      if (!automatic) showToast.success("Reward claimed and synchronized successfully.");
      return true;
    } catch (error) {
      console.warn("Claim synchronization is still pending:", error);
      if ([401, 403].includes(error.response?.status)) {
        pendingClaimSyncRef.current = null;
      }
      setClaimSyncError(
        [401, 403].includes(error.response?.status)
          ? "Sign in with the wallet that claimed this reward, then retry synchronization."
          : currentRecord.status === "pending_confirmation"
            ? "The claim transaction has not been confirmed yet. Check again shortly; this will not submit another transaction."
            : "Your claim is confirmed on-chain, but your account is still waiting to update. Retry safely with the same transaction.",
      );
      return false;
    } finally {
      setIsClaimSyncing(false);
      setClaimPhase("");
      claimSyncInFlightRef.current = false;
    }
  }, [address, isAuthenticated, refreshRewardStatus]);

  const refreshContributorStatus = useCallback(async () => {
    if (!address || !isAuthenticated || !id) return;
    const requestKey = `${String(id)}:${address.toLowerCase()}`;
    if (contributorStatusRefreshRef.current === requestKey) return;
    contributorStatusRefreshRef.current = requestKey;
    setIsRefreshingContributorStatus(true);
    const [enrollmentResult, submissionResult] = await fetchContributorJourney(address, id);
    if (contributorStatusRefreshRef.current !== requestKey) return;

    if (enrollmentResult.status === "fulfilled") {
      const enrolled = (enrollmentResult.value.data?.enrollments || []).some(
        (entry) => String(entry.bountyId) === String(id),
      );
      setEnrollmentStatus(enrolled ? "enrolled" : "not-enrolled");
    } else {
      setEnrollmentStatus((previous) => previous === "checking" ? "unavailable" : previous);
    }

    if (submissionResult.status === "fulfilled") {
      const existing = (submissionResult.value.data?.submissions || []).find(
        (submission) => String(submission.bountyId) === String(id),
      );
      setHasUserSubmitted(Boolean(existing));
      setUserSubmission(existing || null);
      setSubmissionStatusError(false);
      if (existing) {
        try {
          getBrowserStorage()?.removeItem(getSubmissionDraftKey(id, address));
        } catch (error) {
          console.warn("Could not clear an already-submitted draft:", error);
        }
      }
    } else {
      setSubmissionStatusError(true);
    }

    setContributorStatusError(
      enrollmentResult.status === "rejected" || submissionResult.status === "rejected"
        ? "Your participation status could not be refreshed. Retry to check for updates."
        : "",
    );
    setIsRefreshingContributorStatus(false);
    contributorStatusRefreshRef.current = null;
  }, [address, id, isAuthenticated]);

  useEffect(() => {
    if (!id || !address || !isAuthenticated) return;
    const storage = getBrowserStorage();
    const key = getPendingClaimSyncKey(id, address);
    if (pendingClaimSyncRef.current === key) return;

    let savedRecord;
    try {
      savedRecord = JSON.parse(readPendingClaimSync(storage, key) || "null");
    } catch (error) {
      console.error("Could not read pending claim synchronization:", error);
      setClaimSyncError("Saved claim recovery information could not be read. Refresh the page and try again.");
      return;
    }
    if (!savedRecord) return;

    const record = {
      ...savedRecord,
      status: savedRecord.status || "pending_sync",
      chainId: Number(savedRecord.chainId || bountyChainId || 0),
    };
    if (
      record.bountyId !== String(id) ||
      record.walletAddress !== address.toLowerCase() ||
      !/^0x[a-fA-F0-9]{64}$/.test(record.txHash || "")
    ) {
      setClaimSyncError("Saved claim recovery information is invalid. Do not submit another claim until it is checked.");
      return;
    }

    pendingClaimSyncRef.current = key;
    setPendingClaimSync(record);
    syncClaimRecord(record, { automatic: true });
  }, [id, address, isAuthenticated, bountyChainId, syncClaimRecord]);

  const loadComments = async (bountyId) => {
    try {
      const { data } = await axios.get(`${API_URL}/comments/${bountyId}`);

      setComments(data.comments || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchBounty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setEnrollmentStatus("checking");
      setContributorStatusError("");
      setSubmissionStatusError(false);
      setReviewQueueError("");
      setIsCreator(false);
      setHasUserSubmitted(false);
      setUserSubmission(null);
      setWinnersData(null);
      setOffChainClaimable("0");
      setHasUserClaimedOffChain(false);
      setAllSubmissions([]);
      setParticipants([]);
      setParticipantPage(1);
      setParticipantPagination(null);
      setParticipantSearch("");
      setParticipantFilter("all");
      setSelectedWinners([]);
      setShowFullDescription(false);

      try {
        let detailResponse;
        try {
          detailResponse = await apiClient.get(`/bounty/${id}`);
        } catch (error) {
          if (error.response?.status !== 401) throw error;
          detailResponse = await axios.get(`${API_URL}/bounty/${id}`);
        }
        const { data } = detailResponse;

        let bountyData = data.bounty || data;

        if (
          (bountyData.blockchainId === null ||
            bountyData.blockchainId === undefined) &&
          bountyData.txHash
        ) {
          if (Number(currentChainId) !== Number(bountyData.network)) {
            try {
              await switchChainAsync({
                chainId: Number(bountyData.network),
              });
            } catch {
              showToast.error("Please switch network manually in your wallet");
            }
          }

          const fetchedId = await fetchBountyIdFromTx(bountyData.txHash);

          if (fetchedId !== undefined && fetchedId !== null) {
            bountyData = { ...bountyData, blockchainId: fetchedId };
          }
        }

        if (cancelled) return;

        if (bountyData.deadlineExtendedFrom) {
          const storage = getBrowserStorage();
          const noticeKey = `happy-bounty:seen-deadline-extension:${id}`;
          const extensionKey = new Date(
            bountyData.deadlineExtendedFrom,
          ).toISOString();
          try {
            if (storage?.getItem(noticeKey) !== extensionKey) {
              showToast.info(
                `The bounty deadline was extended to ${formatDateTime(bountyData.deadline)}.`,
                6000,
              );
              storage?.setItem(noticeKey, extensionKey);
            }
          } catch (error) {
            console.warn("Could not save deadline extension notice:", error);
          }
        }

        setBounty(bountyData);
        setAllSubmissions(bountyData.submissions?.items || []);

        if (address) {
          setIsCreator(Boolean(bountyData.submissions?.isCreatorView));
          if (!isAuthenticated) setEnrollmentStatus("unavailable");
        } else {
          setEnrollmentStatus("not-enrolled");
        }

        await Promise.all([loadWinnersData(id), loadParticipants(id, 1)]);
        await loadComments(id);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          showToast.error("Failed to load bounty details");
          navigate("/");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBounty();

    return () => {
      cancelled = true;
    };
  }, [id, address, isAuthenticated]);

  useEffect(() => {
    if (!bounty || !address || !isAuthenticated || isCreator) return undefined;
    let cancelled = false;
    const refreshIfVisible = () => {
      if (!cancelled && document.visibilityState === "visible") {
        refreshContributorStatus();
      }
    };
    refreshIfVisible();
    window.addEventListener("focus", refreshIfVisible);
    const interval = window.setInterval(refreshIfVisible, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshIfVisible);
      window.clearInterval(interval);
    };
  }, [bounty, address, isAuthenticated, isCreator, refreshContributorStatus]);

  useEffect(() => {
    if (!bountyLoaded || !isCreator) return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refreshCreatorReview();
    };
    window.addEventListener("focus", refreshIfVisible);
    const interval = window.setInterval(refreshIfVisible, 60_000);
    return () => {
      window.removeEventListener("focus", refreshIfVisible);
      window.clearInterval(interval);
    };
  }, [bountyLoaded, isCreator, refreshCreatorReview]);

  useEffect(() => {
    if (!bountyLoaded || isCreator) return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refreshRewardStatus();
    };
    window.addEventListener("focus", refreshIfVisible);
    const interval = window.setInterval(refreshIfVisible, 60_000);
    return () => {
      window.removeEventListener("focus", refreshIfVisible);
      window.clearInterval(interval);
    };
  }, [bountyLoaded, isCreator, refreshRewardStatus]);

  const submissionLinkError = isValidUrl(submissionLink);

  const handleEnroll = async () => {
    if (!address) return showToast.error("Please connect your wallet");
    if (!isAuthenticated)
      return showToast.error("Sign in with your wallet before enrolling.");

    setIsEnrolling(true);

    const toastId = showToast.loading("Enrolling in bounty...");

    try {
      await apiClient.post("/user/enrollment", {
        bountyId: id,
      });

      showToast.success("Successfully enrolled!", {
        id: toastId,
      });

      setEnrollmentStatus("enrolled");
      setContributorStatusError("");
    } catch (error) {
      const alreadyEnrolled =
        error.response?.status === 400 &&
        error.response.data?.error?.toLowerCase().includes("already");

      if (alreadyEnrolled) {
        setEnrollmentStatus("enrolled");

        showToast.success("You're already enrolled", {
          id: toastId,
        });
      } else {
        setContributorStatusError("Enrollment could not be confirmed. Retry enrollment or refresh your status.");
        await refreshContributorStatus();
        showToast.error(error.response?.data?.error || "Enrollment could not be confirmed. You can safely retry.", {
          id: toastId,
        });
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageSizeWarning("Please select a JPEG, PNG, or WebP image.");
      setSubmissionImage(null);
      setImagePreview(null);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageSizeWarning("Image must be 5MB or smaller.");
      setSubmissionImage(null);
      setImagePreview(null);
      event.target.value = "";
      return;
    }

    setImageSizeWarning("");
    setSubmissionImage(file);

    const reader = new FileReader();

    reader.onload = (result) => setImagePreview(result.target.result);
    reader.readAsDataURL(file);
  };

  const resetSubmissionForm = () => {
    setSubmissionImage(null);
    setSubmissionDescription("");
    setSubmissionLink("");
    setImagePreview(null);
    setImageSizeWarning("");
    try {
      if (submissionDraftKey) getBrowserStorage()?.removeItem(submissionDraftKey);
    } catch (error) {
      console.warn("Could not clear submission draft:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!address) return showToast.error("Please connect your wallet");
    if (!isAuthenticated)
      return showToast.error("Sign in with your wallet before submitting.");
    if (!submissionDescription.trim() || !submissionLink.trim())
      return showToast.error("Please provide a description and proof link");

    const urlError = isValidUrl(submissionLink);

    if (urlError) return showToast.error(urlError);
    if (imageSizeWarning) return showToast.error(imageSizeWarning);

    setSubmitting(true);

    const toastId = showToast.loading("Submitting your work...");

    try {
      const formData = new FormData();

      formData.append("bountyId", id);
      formData.append("description", submissionDescription.trim());
      formData.append("projectLink", submissionLink.trim());

      if (submissionImage) {
        const compressed = await compressImage(submissionImage);
        formData.append("image", compressed);
      }

      const { data } = await apiClient.post("/bounty/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.success("Submission received. Pending review.", {
        id: toastId,
      });

      setHasUserSubmitted(true);

      setUserSubmission({
        ...data,
        bountyId: id,
        user: address,
        description: submissionDescription.trim(),
        projectLink: submissionLink.trim(),
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      setSubmissionStatusError(false);
      setContributorStatusError("");

      setShowSubmitModal(false);
      resetSubmissionForm();
    } catch (error) {
      const alreadySubmitted = error.response?.status === 400 &&
        typeof error.response?.data?.error === "string" &&
        error.response.data.error.toLowerCase().includes("already submitted");
      if (alreadySubmitted) {
        await refreshContributorStatus();
        setShowSubmitModal(false);
        resetSubmissionForm();
        showToast.info("A submission already exists for this bounty. Its latest status is shown on the page.", { id: toastId });
        return;
      }
      const submitErrorMessage = error.response?.status === 409
        ? "This bounty is no longer accepting submissions. Your saved description and proof link remain on this device."
        : error.response?.data?.code === "ENROLLMENT_REQUIRED"
          ? "Enroll in this bounty before submitting. Your saved description and proof link are still here."
          : error.response?.status === 401
            ? "Your sign-in expired. Sign in again, then retry; your saved description and proof link remain here."
            : error.response?.data?.error || "Submission failed. Your saved description and link are still here so you can retry.";
      showToast.error(
        submitErrorMessage,
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimReward = async () => {
    if (claimActionRef.current || claimSyncInFlightRef.current) return;
    if (!address) return showToast.error("Please connect your wallet");
    if (!isAuthenticated)
      return showToast.error(
        "Sign in with your wallet before claiming rewards.",
      );
    if (blockchainId === null)
      return showToast.error("This bounty is not on-chain");

    if (pendingClaimSync) {
      await syncClaimRecord(pendingClaimSync);
      return;
    }

    const storage = getBrowserStorage();
    const pendingKey = getPendingClaimSyncKey(id, address);
    const savedPending = readPendingClaimSync(storage, pendingKey);
    if (savedPending) {
      try {
        const record = JSON.parse(savedPending);
        setPendingClaimSync(record);
        await syncClaimRecord(record);
      } catch (error) {
        console.error("Saved claim recovery information is invalid:", error);
        setClaimSyncError("Saved claim recovery information is invalid. Do not submit another claim until it is checked.");
      }
      return;
    }

    if (Number(currentChainId) !== Number(bounty.network)) {
      try {
        await switchChainAsync({ chainId: Number(bounty.network) });
        showToast.info(
          "Network switched. Sign in again on this network, then continue.",
        );
      } catch {
        return showToast.error("Please switch network manually in your wallet");
      }
      return;
    }

    if (!onChainClaimable || onChainClaimable === 0n) {
      return showToast.error("No reward available");
    }

    if (onChainClaimed) {
      return showToast.error("This reward has already been claimed");
    }

    claimActionRef.current = true;
    setIsClaiming(true);
    setClaimSyncError("");
    setClaimPhase("Confirm in wallet");

    const persistClaimRecord = (record) => {
      setPendingClaimSync(record);
      pendingClaimSyncRef.current = pendingKey;
      try {
        storage?.setItem(pendingKey, JSON.stringify(record));
        return Boolean(storage);
      } catch (error) {
        console.error("Could not persist pending claim synchronization:", error);
        return false;
      }
    };

    let submittedHash = null;
    try {
      const { hash } = await claimReward(blockchainId, {
        onSubmitted: () => setClaimPhase("Waiting for chain confirmation"),
      });
      submittedHash = hash;
      const record = {
        bountyId: String(id),
        walletAddress: address.toLowerCase(),
        txHash: hash,
        chainId: Number(bounty.network),
        status: "pending_sync",
      };
      const stored = persistClaimRecord(record);
      if (!stored) {
        setClaimSyncError("The claim is confirmed, but this browser cannot save recovery data. Keep this page open while account synchronization finishes.");
      }
      await syncClaimRecord(record);
    } catch (error) {
      if (error.transactionStatus === "reverted") {
        showToast.error("The claim transaction reverted on-chain. No reward was claimed.");
        return;
      }
      const txHash = error.transactionHash || submittedHash;
      if (txHash) {
        const record = {
          bountyId: String(id),
          walletAddress: address.toLowerCase(),
          txHash,
          chainId: Number(bounty.network),
          status: error.transactionConfirmed ? "pending_sync" : "pending_confirmation",
        };
        const stored = persistClaimRecord(record);
        setClaimSyncError(
          error.transactionConfirmed
            ? "The claim is confirmed on-chain, but your account still needs to sync. Retry with the same transaction."
            : "The transaction was submitted, but its confirmation is unknown. Check its status before doing anything else.",
        );
        showToast.info(
          stored
            ? error.transactionConfirmed
              ? "Reward claim succeeded on-chain. Account synchronization is still pending."
              : "Claim transaction confirmation is unknown. Check its status before retrying."
            : "Claim transaction was submitted, but recovery data could not be saved in this browser.",
          6000,
        );
      } else {
        showToast.error(
          error.response?.data?.error || error.shortMessage || error.message || "Claim failed",
        );
      }
    } finally {
      claimActionRef.current = false;
      setIsClaiming(false);
      setClaimPhase("");
    }
  };

  const persistPendingDistribution = (record) => {
    try {
      saveDistributionSyncRecord(getBrowserStorage(), record);
      setPendingDistributionSync(record);
      return true;
    } catch (error) {
      console.error("Could not persist pending distribution sync:", error);
      const saved = readDistributionSyncRecord(
        getBrowserStorage(),
        getDistributionSyncStorageKey(record.chainId, record.bountyId),
      );
      setPendingDistributionSync(saved || record);
      showToast.error(
        "Could not save recovery information in this browser. Keep this page open while synchronization is pending.",
      );
      return false;
    }
  };

  const synchronizeRewardAssignment = async (record) => {
    let data;
    try {
      ({ data } = await retryUntilVerified(() =>
        apiClient.post(`/bounty/${record.bountyId}/distribute`, {
          txHash: record.txHash,
          blockchainId: record.blockchainId,
          chainId: record.chainId,
        }),
      ));
    } catch (error) {
      if (error.response?.data?.code === "TRANSACTION_REVERTED") {
        clearDistributionSyncRecord(getBrowserStorage(), record);
        setPendingDistributionSync(null);
      }
      throw error;
    }

    if (data.status !== "synced") {
      throw new Error(
        data.code === "SYNC_PENDING"
          ? "Synchronization is still processing. Retry in a moment."
          : data.error || "Distribution synchronization is incomplete.",
      );
    }

    clearDistributionSyncRecord(getBrowserStorage(), record);
    setPendingDistributionSync(null);
    setSelectedWinners([]);
    setShowDistributeModal(false);
    await refreshCreatorReview(true);
    showToast.success("Rewards distributed and synchronized successfully.");
  };

  const executeRewardAssignment = async (valid) => {
    const options = {
      onSubmitted: () => setDistributionPhase("Confirming on-chain"),
    };
    if (valid.length === 1) {
      return assignSingleWinner(blockchainId, valid[0], options);
    }

    const percentages =
      bounty.payoutType === "MULTI_PERCENTAGE" ? bounty.percentages : [];
    return assignMultipleWinners(blockchainId, valid, percentages, options);
  };

  const handleDistributeReward = async () => {
    if (!canDistribute()) return showToast.info(getDistributionBlockReason());
    if (!hasEnoughSelections()) return showToast.info(getDistributionBlockReason());
    if (!isAuthenticated)
      return showToast.error(
        "Sign in with your wallet before distributing rewards.",
      );

    const valid = winnerAddresses.map((value) => value.trim());

    if (
      !valid.length ||
      valid.length !== (bounty.payoutType === "SINGLE" ? 1 : Number(bounty.winnersAllowed)) ||
      valid.some((value) => !/^0x[a-fA-F0-9]{40}$/.test(value)) ||
      new Set(valid.map((value) => value.toLowerCase())).size !== valid.length
    ) {
      return showToast.error(
        "Enter unique, valid wallet addresses for all winners",
      );
    }

    if (blockchainId === null) {
      return showToast.error("This bounty is not on-chain");
    }

    if (pendingDistributionSync) {
      return showToast.error(
        "A previous distribution is still synchronizing. Retry synchronization instead of submitting another transaction.",
      );
    }

    const chainId = Number(bounty.network);
    const bountyContract = getBountyContract(chainId);
    if (!bountyContract) {
      return showToast.error(`Contract not configured for chain ${chainId}`);
    }

    const storageKey = getDistributionSyncStorageKey(chainId, id);
    const unresolvedRecord = readDistributionSyncRecord(
      getBrowserStorage(),
      storageKey,
    );
    if (unresolvedRecord) {
      setPendingDistributionSync(unresolvedRecord);
      return showToast.error(
        "A previous distribution is still unresolved. Retry its synchronization first.",
      );
    }

    if (Number(currentChainId) !== chainId) {
      try {
        await switchChainAsync({ chainId });
        showToast.info(
          "Network switched. Sign in again on this network, then distribute rewards.",
        );
      } catch {
        return showToast.error("Please switch network manually in your wallet");
      }
      return;
    }

    setDistributing(true);
    setDistributionPhase("Confirm in wallet");

    const toastId = showToast.loading("Assigning winners on-chain...");
    let tx;
    try {
      tx = await executeRewardAssignment(valid);
      setDistributionPhase("Recording reward claims");
    } catch (error) {
      const txHash = error.transactionHash;
      if (txHash && error.transactionStatus === "reverted") {
        showToast.error(
          "The winner-assignment transaction reverted on-chain.",
          {
            id: toastId,
          },
        );
      } else if (txHash) {
        const pendingRecord = {
          bountyId: String(id),
          blockchainId: String(blockchainId),
          chainId,
          bountyContract,
          txHash,
          status: error.transactionConfirmed
            ? "pending_sync"
            : "pending_confirmation",
          createdAt: new Date().toISOString(),
        };
        persistPendingDistribution(pendingRecord);
        showToast.info(
          error.transactionConfirmed
            ? "Winner assignment succeeded on-chain. The reward records still need to sync; do not submit the distribution again."
            : "The transaction was submitted, but its confirmation is still unknown. Check its status before taking further action.",
          6000,
          { id: toastId },
        );
      } else {
        showToast.error(
          error.shortMessage ||
            error.message ||
            "Transaction submission failed",
          { id: toastId },
        );
      }
      setDistributing(false);
      setDistributionPhase("");
      return;
    }

    const pendingRecord = {
      bountyId: String(id),
      blockchainId: String(blockchainId),
      chainId,
      bountyContract,
      txHash: tx.hash,
      status: "pending_sync",
      createdAt: new Date().toISOString(),
    };
    persistPendingDistribution(pendingRecord);
    // The chain has confirmed the distribution. Close the review modal even if
    // the MongoDB projection needs a retry; recovery remains available below.
    setShowDistributeModal(false);

    try {
      await synchronizeRewardAssignment(pendingRecord);
    } catch (error) {
      console.error("Distribution synchronization failed:", error);
      showToast.info(
        `Distribution succeeded on-chain. Reward records still need to sync.`,
        6000,
        { id: toastId },
      );
    } finally {
      setDistributing(false);
      setDistributionPhase("");
    }
  };

  const retryDistributionSync = async () => {
    if (!pendingDistributionSync || distributing) return;
    if (!isAuthenticated)
      return showToast.error(
        "Sign in with your wallet before syncing rewards.",
      );
    let record = pendingDistributionSync;
    setDistributing(true);
    setDistributionPhase(record.status === "pending_confirmation" ? "Checking transaction confirmation" : "Recording reward claims");
    try {
      if (!isValidDistributionSyncRecord(record)) {
        throw new Error("Pending distribution recovery data is invalid.");
      }

      if (record.status === "pending_confirmation") {
        const chain = supportedChains.find(
          (supportedChain) => supportedChain.id === record.chainId,
        );
        if (!chain) {
          throw new Error(
            `No wallet chain configuration for ${record.chainId}`,
          );
        }
        const client = createPublicClient({
          chain,
          transport: http(chain.rpcUrls.default.http[0]),
        });
        const receipt = await client.getTransactionReceipt({
          hash: record.txHash,
        });
        if (receipt.status !== "success") {
          clearDistributionSyncRecord(getBrowserStorage(), record);
          setPendingDistributionSync(null);
          throw new Error(
            "The winner-assignment transaction reverted on-chain.",
          );
        }
        record = { ...record, status: "pending_sync" };
        persistPendingDistribution(record);
      }

      await synchronizeRewardAssignment(record);
    } catch (error) {
      console.error("Could not retry distribution synchronization:", error);
      if (
        record.status === "pending_confirmation" &&
        !error.message?.includes("reverted on-chain")
      ) {
        showToast.info(
          "No confirmed transaction receipt is available yet. Check again once the network has processed it.",
          6000,
        );
      } else {
        showToast.error(
          error.response?.data?.error ||
            error.message ||
            "Reward records are still waiting to sync. You can safely retry.",
        );
      }
    } finally {
      setDistributing(false);
      setDistributionPhase("");
    }
  };

  const toggleWinnerSelection = (submission) => {
    const addr = submission.user.toLowerCase();

    setSelectedWinners((previous) => {
      if (previous.some((item) => item.address === addr)) {
        return previous.filter((item) => item.address !== addr);
      }

      if (bounty.payoutType === "SINGLE") {
        return [
          {
            address: addr,
            submissionId: submission._id,
          },
        ];
      }

      if (previous.length >= bounty.winnersAllowed) {
        showToast.error(
          `You can select up to ${bounty.winnersAllowed} winners`,
        );

        return previous;
      }

      return [
        ...previous,
        {
          address: addr,
          submissionId: submission._id,
        },
      ];
    });
  };

  const isSelected = (addr) =>
    selectedWinners.some((item) => item.address === addr?.toLowerCase());

  const requiredWinnerCount =
    bounty?.payoutType === "SINGLE" ? 1 : Number(bounty?.winnersAllowed) || 1;

  const hasEnoughSelections = () =>
    selectedWinners.length === requiredWinnerCount;

  const openDistributeModal = () => {
    if (!hasEnoughSelections()) {
      const remaining = Math.max(0, requiredWinnerCount - selectedWinners.length);
      showToast.info(`Select ${remaining} more submission${remaining === 1 ? "" : "s"} before reviewing distribution.`);
      return;
    }
    setWinnerAddresses(selectedWinners.map((item) => item.address));
    setShowDistributeModal(true);
  };

  const handleAddComment = async () => {
    if (!address) return showToast.error("Please connect your wallet");
    if (!isAuthenticated)
      return showToast.error("Sign in with your wallet before commenting.");
    if (!newComment.trim()) return showToast.error("Write a comment first");

    setCommentSubmitting(true);

    try {
      const { data } = await apiClient.post(`/comments/add/${id}`, {
        text: newComment.trim(),
      });

      setNewComment("");

      showToast.success("Comment added");
    } catch (error) {
      showToast.error(error.response?.data?.error || "Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const openEditBountyModal = () => {
    editTriggerRef.current = document.activeElement;
    setEditBountyErrors({});
    setEditBountyForm({
      title: bounty.title || "",
      description: bounty.description || "",
      deadline: toLocalDateInput(bounty.deadline),
    });
    setShowEditBountyModal(true);
  };

  const handleUpdateBounty = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!editBountyForm.title.trim()) {
      errors.title = "Enter a bounty title.";
    }
    if (!editBountyForm.description.trim()) {
      errors.description = "Enter a bounty description.";
    }
    const currentDeadline = parseDate(bounty.deadline);
    if (!currentDeadline || !editBountyForm.deadline) {
      errors.deadline = "Choose a valid deadline.";
    }
    if (Object.keys(errors).length) {
      setEditBountyErrors(errors);
      return;
    }

    const isCompleted =
      String(bounty.status || "").toLowerCase() === "completed";

    const currentDeadlineDay = toLocalDateInput(currentDeadline);
    const deadlineChanged = editBountyForm.deadline !== currentDeadlineDay;
    if (isCompleted && deadlineChanged) {
      errors.deadline = "The deadline cannot be changed because this bounty is completed.";
    }
    const nextDeadline = new Date(`${editBountyForm.deadline}T00:00:00`);
    if (
      !isCompleted &&
      deadlineChanged &&
      nextDeadline.getTime() <= currentDeadline.getTime()
    ) {
      errors.deadline = "Choose a later date. The deadline can only be extended.";
    }
    if (Object.keys(errors).length) {
      setEditBountyErrors(errors);
      return;
    }

    setEditBountyErrors({});
    setSavingBountyEdits(true);
    try {
      const updates = {
        title: editBountyForm.title.trim(),
        description: editBountyForm.description.trim(),
      };
      if (deadlineChanged && !isCompleted) {
        updates.deadline = nextDeadline.toISOString();
      }
      const { data } = await apiClient.patch(`/bounty/update/${id}`, updates);
      const updatedBounty = data.bounty || data;
      setBounty((previous) => ({ ...previous, ...updatedBounty }));
      setEditBountyForm({
        title: updatedBounty.title || editBountyForm.title.trim(),
        description: updatedBounty.description || editBountyForm.description.trim(),
        deadline: toLocalDateInput(updatedBounty.deadline || bounty.deadline),
      });
      setShowEditBountyModal(false);
      showToast.success("Bounty details updated");
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to update bounty details",
      );
    } finally {
      setSavingBountyEdits(false);
    }
  };

  const winnerAddressesSet = new Set(
    [...(winnersData?.winners || []), ...(winnersData?.claimed || [])]
      .map((winner) => winner.address?.toLowerCase())
      .filter(Boolean),
  );
  const pendingReviewCount = allSubmissions.filter(
    (submission) => (submission.status || "pending") === "pending",
  ).length;
  const reviewSubmissions = isCreator
    ? [...allSubmissions].sort((first, second) => {
        const firstPending = (first.status || "pending") === "pending";
        const secondPending = (second.status || "pending") === "pending";
        if (firstPending !== secondPending) return firstPending ? -1 : 1;
        return new Date(second.submittedAt || 0) - new Date(first.submittedAt || 0);
      })
    : allSubmissions;

  // Keep the connected user's entry visible on the first page even when their
  // submission is older than the current page window.
  const participantRows = [...participants];
  if (
    participantPage === 1 &&
    address &&
    userSubmission?.user &&
    !participantRows.some(
      (person) => person.walletAddress?.toLowerCase() === address.toLowerCase(),
    )
  ) {
    participantRows.unshift({
      walletAddress: userSubmission.user,
      submittedAt: userSubmission.submittedAt,
    });
  }

  const canClaim = () => {
    if (
      isCreator ||
      hasUserClaimedOffChain ||
      pendingClaimSync ||
      isClaiming ||
      isClaimSyncing
    ) return false;

    if (blockchainId !== null) {
      return Boolean(
        onChainClaimable && onChainClaimable > 0n && !onChainClaimed,
      );
    }

    return Number(offChainClaimable) > 0;
  };

  const canDistribute = () => {
    if (!isCreator || !bounty?.deadline || winnersData?.isDistributed || pendingDistributionSync) {
      return false;
    }

    const deadline = parseDate(bounty.deadline);

    return Boolean(deadline && deadline.getTime() <= currentTime);
  };

  const getDistributionBlockReason = () => {
    if (winnersData?.isDistributed) return "Rewards have already been distributed.";
    if (pendingDistributionSync) return "A previous distribution is still being confirmed or synchronized. Resolve it above before starting another.";
    const deadline = parseDate(bounty?.deadline);
    if (!deadline || deadline.getTime() > currentTime) {
      return `You can review and select submissions now. Distribution opens after the deadline${bounty?.deadline ? ` on ${formatDate(bounty.deadline)}` : ""}.`;
    }
    if (!hasEnoughSelections()) {
      const remaining = Math.max(0, requiredWinnerCount - selectedWinners.length);
      return allSubmissions.length === 0
        ? "There are no submissions to review yet."
        : `Select ${remaining} more submission${remaining === 1 ? "" : "s"} to complete the ${requiredWinnerCount}-winner payout.`;
    }
    return "All winners are selected. Review the recipients and payout amounts before confirming.";
  };

  const displayClaimable = () => {
    if (blockchainId !== null && onChainClaimable !== undefined) {
      return formatAmount(formatEther(onChainClaimable));
    }

    return formatAmount(offChainClaimable);
  };

  const cardClass =
    "relative overflow-hidden rounded-3xl border border-[#e3e5df] dark:border-white/[0.08] bg-white dark:bg-[#101311] shadow-[0_12px_45px_rgba(20,30,24,0.045)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.15)]";

  const inputClass =
    "w-full rounded-xl border border-[#dfe3dc] dark:border-white/10 bg-white dark:bg-[#151915] px-4 py-3 text-sm text-[#171b18] dark:text-white placeholder:text-[#929a92] outline-none transition focus:border-[#00D6A0] focus:ring-4 focus:ring-[#00D6A0]/10";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-bold text-[#06271e] transition hover:bg-[#00bd8e] focus:outline-none focus:ring-4 focus:ring-[#00D6A0]/20 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe3dc] dark:border-white/10 bg-white dark:bg-[#151915] px-5 py-3 text-sm font-semibold text-[#303a33] dark:text-white transition hover:border-[#00D6A0] hover:text-[#008a66] dark:hover:text-[#00D6A0] disabled:opacity-50";

  const statusStyles = {
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    upcoming:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    ended:
      "border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60",
    completed:
      "border-[#00D6A0]/30 bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]",
    cancelled:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f7f4] dark:bg-[#080b09] text-[#171b18] dark:text-white">
        <NavBar />

        <main className="flex-grow pt-24">
          <BountyDetailSkeleton />
        </main>

        <Footer />
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f7f4] dark:bg-[#080b09] text-[#171b18] dark:text-white">
        <NavBar />

        <main className="flex flex-1 items-center justify-center px-4 pt-24">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#dfe3dc] dark:border-white/10 bg-white dark:bg-[#101311] text-[#00a87d]">
              <FiSearch size={28} />
            </div>

            <h1 className="text-2xl font-bold">Bounty not found</h1>

            <p className="mt-2 text-sm leading-6 text-[#737c74] dark:text-white/50">
              This bounty may have been removed or the link may be incorrect.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className={`${primaryButton} mt-6`}
            >
              <FiArrowLeft size={16} />
              Back to dashboard
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const networkName =
    supportedChains.find((chain) => chain.id === Number(bounty.network))
      ?.name || `Chain ${bounty.network}`;

  const token =
    bounty.token || getNativeToken(bounty.network)?.symbol || "Token";

  // Date values are instants; format them in the viewer's local time zone.
  const startDate = parseDate(bounty.startDate);
  const deadlineDate = parseDate(bounty.deadline);

  const startTimestamp = startDate?.getTime() ?? null;
  const deadlineTimestamp = deadlineDate?.getTime() ?? null;

  const originalStatus = String(bounty.status || "").toLowerCase();

  // Completed and cancelled are final statuses.
  // Otherwise, the dates determine whether the bounty is upcoming, active, or ended.
  const displayStatus = ["completed", "cancelled"].includes(originalStatus)
    ? originalStatus
    : startTimestamp !== null && currentTime < startTimestamp
      ? "upcoming"
      : deadlineTimestamp !== null && currentTime >= deadlineTimestamp
        ? "ended"
        : "active";

  // Upcoming: count down to the start date.
  // Active: count down to the deadline.
  const countdownTarget =
    displayStatus === "upcoming"
      ? startTimestamp
      : displayStatus === "active"
        ? deadlineTimestamp
        : null;

  const timeRemaining =
    countdownTarget !== null && countdownTarget > currentTime
      ? formatCountdownParts(countdownTarget - currentTime)
      : null;

  const deadlinePassed =
    deadlineTimestamp !== null && deadlineTimestamp <= currentTime;

  const countdownDateLabel =
    displayStatus === "upcoming" ? "Starts" : "Deadline";

  const countdownHeading =
    displayStatus === "upcoming"
      ? "Starts in"
      : displayStatus === "active"
        ? "Time remaining"
        : "Bounty schedule";

  const contributorJourneyLabel = !address
    ? "Not started"
    : hasUserSubmitted
      ? userSubmission?.status === "accepted"
        ? "Selected"
        : userSubmission?.status === "rejected"
          ? "Not selected"
          : "Under review"
      : enrollmentStatus === "checking"
        ? "Checking your status"
        : enrollmentStatus === "unavailable"
          ? "Status unavailable"
          : enrollmentStatus === "enrolled"
            ? "Enrolled"
            : "Not started";

  const contributorJourneyDescription = contributorJourneyLabel === "Not started"
    ? "Start task records your participation in the app. It does not send a blockchain transaction or ask for another wallet signature."
    : contributorJourneyLabel === "Enrolled"
      ? "You are enrolled. Complete the task, then submit your description and proof link before the deadline."
      : contributorJourneyLabel === "Under review"
        ? "Your submission is with the creator for review. This page checks for status changes when you return and about once a minute while it is visible."
        : contributorJourneyLabel === "Selected"
          ? "The creator selected your submission. Check the reward section below for distribution and claim status."
          : contributorJourneyLabel === "Not selected"
            ? "The creator reviewed your submission and did not select it for a reward."
            : "Refresh your participation status to see whether you are enrolled or have a submission on file.";

  const displayDate =
    displayStatus === "upcoming" ? bounty.startDate : bounty.deadline;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f4] dark:bg-[#080b09] text-[#171b18] dark:text-white transition-colors duration-300">
      <NavBar />

      <main className="relative flex-grow px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-gradient-to-b from-[#00D6A0]/[0.07] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {createdBountyNotice && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#00D6A0]/30 bg-[#00D6A0]/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-[#00A87D]">Your bounty is published</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/60">
                  {createdBountyNotice.title || bounty?.title || "It is now available to contributors."} Share its link to invite people to participate.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyBountyLink} className="inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-4 py-2.5 text-sm font-bold text-[#07120D] transition hover:bg-[#32E5B8]">
                  <FiCopy size={15} /> Copy bounty link
                </button>
                <button type="button" onClick={() => navigate("/dashboard")} className="rounded-xl border border-[#00A87D]/30 px-4 py-2.5 text-sm font-semibold text-[#008A66] transition hover:bg-[#00D6A0]/10">
                  Back to dashboard
                </button>
                <button type="button" aria-label="Dismiss published bounty notice" onClick={() => setCreatedBountyNotice(null)} className="rounded-xl px-3 py-2.5 text-gray-500 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5">
                  <FiX size={17} />
                </button>
              </div>
            </div>
          )}
          <div className="mb-7 flex items-center justify-between gap-3">
            <button
              onClick={handleGoBack}
              className={`${secondaryButton} !px-4 !py-2.5`}
            >
              <FiArrowLeft size={16} />
              Back
            </button>

            <span className="rounded-full border border-[#dfe3dc] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#737c74] dark:text-white/45">
              Bounty #{id}
            </span>
          </div>

          {pendingDistributionSync &&
            (pendingDistributionSync.status === "pending_confirmation" ||
              !distributing) && (
            <section
              className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-50 p-4 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100"
              aria-live="polite"
            >
              <h2 className="font-bold">
                {pendingDistributionSync.status === "pending_confirmation"
                  ? "Winner assignment confirmation is pending"
                  : distributing
                    ? "Distribution succeeded on-chain"
                    : "Distribution succeeded on-chain; reward records need syncing"}
              </h2>
              <p className="mt-1 text-sm leading-6">
                {pendingDistributionSync.status === "pending_confirmation"
                  ? "The transaction outcome is not confirmed yet. Check its status before retrying anything."
                  : distributing
                    ? "The app is syncing reward records now. You do not need to submit the distribution again."
                    : "Rewards were assigned on the blockchain, but the app has not finished recording them. Syncing will not submit another blockchain transaction."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={
                    getExplorerUrl(
                      pendingDistributionSync.chainId,
                      pendingDistributionSync.txHash,
                    ) || undefined
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 break-all font-mono text-xs underline"
                >
                  {pendingDistributionSync.txHash}
                  <FiExternalLink size={13} />
                </a>
                {(pendingDistributionSync.status === "pending_confirmation" ||
                  !distributing) && (
                  <button
                    type="button"
                    onClick={retryDistributionSync}
                    disabled={distributing}
                    className={`${primaryButton} !px-4 !py-2.5`}
                  >
                    {distributing
                      ? "Checking..."
                      : pendingDistributionSync.status === "pending_confirmation"
                        ? "Check transaction status"
                        : "Sync reward records"}
                  </button>
                )}
              </div>
            </section>
          )}

          {(isClaiming || pendingClaimSync) && (
            <section
              className="mb-6 rounded-2xl border border-sky-400/40 bg-sky-50 p-4 text-sky-950 dark:bg-sky-500/10 dark:text-sky-100"
              aria-live="polite"
            >
              <h2 className="font-bold">
                {pendingClaimSync?.status === "pending_confirmation"
                  ? "Claim transaction confirmation is pending"
                  : isClaiming
                    ? claimPhase || "Claim in progress"
                    : "Reward claimed on-chain; your account still needs syncing"}
              </h2>
              <p className="mt-1 text-sm leading-6">
                {pendingClaimSync?.status === "pending_confirmation"
                  ? "The transaction outcome is not known yet. Check its status before trying again."
                  : isClaiming
                    ? "Follow the wallet prompt and wait for the blockchain confirmation."
                    : "Your reward is already claimed on the blockchain. Retrying updates your app account with the same transaction and will not send another claim."}
              </p>
              {(pendingClaimSync || claimSyncError) && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {pendingClaimSync?.txHash && (
                    <a
                      href={getExplorerUrl(pendingClaimSync.chainId || bounty.network, pendingClaimSync.txHash) || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 break-all font-mono text-xs underline"
                    >
                      {pendingClaimSync.txHash}
                      <FiExternalLink size={13} />
                    </a>
                  )}
                  {claimSyncError && <p className="basis-full text-sm">{claimSyncError}</p>}
                  {pendingClaimSync && (
                    <button
                      type="button"
                      onClick={() => syncClaimRecord(pendingClaimSync)}
                      disabled={isClaimSyncing}
                      className={`${primaryButton} !px-4 !py-2.5`}
                    >
                      {isClaimSyncing
                        ? claimPhase || "Checking..."
                        : pendingClaimSync.status === "pending_confirmation"
                          ? "Check transaction status"
                          : "Retry account sync"}
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
            <div className="min-w-0 space-y-6">
              <section className={cardClass}>
                <div className="h-1 w-full bg-gradient-to-r from-[#00D6A0] via-[#00A87D] to-transparent" />

                <div className="p-5 sm:p-8 lg:p-9">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/25 bg-[#00D6A0]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
                      Bounty details
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                        statusStyles[displayStatus] || statusStyles.ended
                      }`}
                    >
                      {displayStatus}
                    </span>
                    {isCreator && (
                      <button
                        type="button"
                        onClick={openEditBountyModal}
                        aria-label="Edit bounty title, description, or deadline"
                        className={`${secondaryButton} ml-auto !px-3 !py-2 text-xs`}
                      >
                        <FiEdit2 size={14} /> Edit bounty
                      </button>
                    )}
                  </div>

                  <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
                    {bounty.title}
                  </h1>

                  <div className="mt-5 rounded-2xl border border-[#dfe5df] bg-[#f8faf7] p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.025]">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                      About this bounty
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#515b52] dark:text-white/70 sm:text-base">
                      {showFullDescription
                        ? bounty.description || "No description provided."
                        : (bounty.description || "No description provided.")
                              .length > 280
                          ? `${bounty.description.slice(0, 280).trimEnd()}…`
                          : bounty.description || "No description provided."}
                    </p>
                  </div>

                  {(bounty.description || "").length > 280 && (
                    <button
                      onClick={() =>
                        setShowFullDescription((previous) => !previous)
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#008a66] hover:text-[#00a87d] dark:text-[#00D6A0]"
                      aria-expanded={showFullDescription}
                    >
                      {showFullDescription
                        ? "Show less"
                        : "Read full description"}

                      {showFullDescription ? (
                        <FiChevronUp size={15} />
                      ) : (
                        <FiChevronDown size={15} />
                      )}
                    </button>
                  )}

                  {bounty.tags?.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {bounty.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-lg border border-[#e0e5df] dark:border-white/10 bg-[#f7f9f6] dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#69736a] dark:text-white/65"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#00D6A0]/25 bg-gradient-to-br from-[#00D6A0]/10 to-transparent p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66736a] dark:text-white/50">
                        <FiShield className="text-[#008a66] dark:text-[#00D6A0]" />
                        Total reward
                      </div>

                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        <span className="break-all text-3xl font-extrabold tracking-tight text-[#087b5c] dark:text-[#00D6A0] sm:text-4xl">
                          {formatAmount(bounty.reward)}
                        </span>

                        <span className="text-sm font-bold text-[#087b5c] dark:text-[#00D6A0]">
                          {token}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#737c74] dark:text-white/45">
                        {bounty.payoutType === "SINGLE"
                          ? "One selected winner"
                          : `${bounty.winnersAllowed || 1} potential winners`}
                      </p>
                    </div>

                    {/* Viewer-local countdown */}
                    <div className="rounded-2xl border border-[#e0e5df] dark:border-white/10 bg-[#fafbf9] dark:bg-[#141814] p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66736a] dark:text-white/50">
                          <FiCalendar className="text-[#008a66] dark:text-[#00D6A0]" />
                          {countdownDateLabel}
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            displayStatus === "ended" ||
                            displayStatus === "cancelled"
                              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                              : displayStatus === "upcoming"
                                ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                                : "bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]"
                          }`}
                        >
                          {displayStatus === "ended"
                            ? "Closed"
                            : displayStatus === "upcoming"
                              ? "Upcoming"
                              : timeRemaining
                                ? "Live"
                                : "Schedule"}
                        </span>
                      </div>

                      <p className="mt-3 text-2xl font-bold">
                        {formatDate(displayDate)}
                      </p>

                      {bounty.deadlineExtendedFrom && (
                        <details className="mt-3 rounded-xl border border-amber-400/30 bg-amber-50/70 px-3 py-2 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                          <summary className="cursor-pointer list-none text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
                            <span className="mr-2 rounded-full bg-amber-200/70 px-2 py-1 uppercase tracking-wide dark:bg-amber-400/20">Deadline extended</span>
                            <span>Now {formatDateTime(bounty.deadline)}</span>
                          </summary>
                          <p className="mt-2 text-xs leading-5">Previous deadline: {formatDateTime(bounty.deadlineExtendedFrom)}</p>
                        </details>
                      )}

                      <p className="mt-1 text-xs text-[#778077] dark:text-white/45">
                        {countdownHeading} · Your local time
                      </p>

                      {timeRemaining ? (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {[
                            ["Days", timeRemaining.days],
                            ["Hours", timeRemaining.hours],
                            ["Mins", timeRemaining.minutes],
                            ["Secs", timeRemaining.seconds],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="min-w-0 rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#0e110e] p-2 text-center"
                            >
                              <p className="text-lg font-extrabold tabular-nums text-[#008a66] dark:text-[#00D6A0]">
                                {String(value).padStart(2, "0")}
                              </p>

                              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#7b847b] dark:text-white/40">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs leading-5 text-[#778077] dark:text-white/45">
                          {displayStatus === "upcoming"
                            ? "The bounty start time has arrived or is not available."
                            : deadlinePassed
                              ? "The submission deadline has passed."
                              : "No active countdown available."}
                        </p>
                      )}
                    </div>
                  </div>

                  {(displayStatus === "completed" ||
                    displayStatus === "ended") && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dfe5dd] dark:border-white/10 bg-[#f7f9f6] dark:bg-white/[0.03] p-4">
                      <FiInfo
                        className="mt-0.5 shrink-0 text-[#008a66] dark:text-[#00D6A0]"
                        size={18}
                      />

                      <div>
                        <p className="text-sm font-bold">
                          {displayStatus === "completed"
                            ? "Bounty completed"
                            : "Submission period ended"}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#727c73] dark:text-white/50">
                          {displayStatus === "completed"
                            ? "The creator has completed the winner selection process."
                            : "The submission period has closed. Check the reward distribution status below."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-7 border-t border-[#e5e9e3] dark:border-white/[0.08] pt-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                          Created by
                        </p>

                        <p className="break-all font-mono text-sm font-semibold">
                          {shortenAddress(bounty.creator)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                          Category
                        </p>

                        <p className="flex items-center gap-2 break-words text-sm font-semibold">
                          <FiTag
                            className="shrink-0 text-[#008a66] dark:text-[#00D6A0]"
                            size={15}
                          />
                          {bounty.category || "Uncategorized"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                          Winner structure
                        </p>

                        <p className="text-sm font-semibold">
                          {bounty.payoutType === "SINGLE"
                            ? "Single winner"
                            : bounty.payoutType === "MULTI_EQUAL"
                              ? `Equal split · ${bounty.winnersAllowed} winners`
                              : bounty.payoutType === "MULTI_PERCENTAGE"
                                ? `Custom split · ${bounty.winnersAllowed} winners`
                                : "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                          Network
                        </p>

                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#00D6A0]" />
                          {networkName}
                        </p>
                      </div>

                      {safeExternalUrl(bounty.originLink) && (
                        <div className="min-w-0 rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025] sm:col-span-2">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                            Project resources
                          </p>
                          <a
                            href={safeExternalUrl(bounty.originLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open project resources in a new tab"
                            className="inline-flex max-w-full items-center gap-2 text-sm font-semibold text-[#008a66] hover:underline dark:text-[#00D6A0]"
                          >
                            <FiGlobe size={15} className="shrink-0" />
                            <span className="break-all">
                              {getHostname(bounty.originLink)}
                            </span>
                            <FiExternalLink size={13} className="shrink-0" />
                          </a>
                        </div>
                      )}

                      {bounty.txHash && (
                        <div className="min-w-0 rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                            Transaction
                          </p>

                          <a
                            href={
                              getExplorerUrl(
                                bounty.network,
                                bounty.txHash,
                                "tx",
                              ) || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 break-all font-mono text-xs text-[#008a66] hover:underline dark:text-[#00D6A0]"
                          >
                            {shortenAddress(bounty.txHash)}
                            <FiExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {bounty.bountyContract && (
                        <div className="min-w-0 rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                            Contract
                          </p>

                          <a
                            href={
                              getExplorerUrl(
                                bounty.network,
                                bounty.bountyContract,
                                "address",
                              ) || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 break-all font-mono text-xs text-[#008a66] hover:underline dark:text-[#00D6A0]"
                          >
                            {shortenAddress(bounty.bountyContract)}
                            <FiExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isCreator && address && (
                    <section className="mt-6 rounded-2xl border border-[#dfe5dd] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]" aria-live="polite">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">Your participation</p>
                          <h3 className="mt-1 text-base font-bold">{contributorJourneyLabel}</h3>
                          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#727c73] dark:text-white/55">{contributorJourneyDescription}</p>
                        </div>
                        <button type="button" onClick={() => refreshContributorStatus()} disabled={isRefreshingContributorStatus} className={`${secondaryButton} !px-3 !py-2`}>
                          {isRefreshingContributorStatus ? "Checking…" : "Refresh status"}
                        </button>
                      </div>
                      {contributorStatusError && (
                        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-700 dark:text-amber-200" role="status">
                          {contributorStatusError}
                        </p>
                      )}
                    </section>
                  )}

                  <div className="mt-7 flex flex-col gap-3 border-t border-[#e5e9e3] dark:border-white/[0.08] pt-6 sm:flex-row sm:flex-wrap">
                    {!address && displayStatus === "active" && (
                      <p className="w-full rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-[#f7f9f6] dark:bg-white/[0.03] px-4 py-3 text-sm text-[#6d776e] dark:text-white/55">
                        Connect your wallet to participate in this bounty.
                      </p>
                    )}

                    {!isCreator && address && displayStatus === "active" && (
                      <>
                        {enrollmentStatus === "checking" && (
                          <div className="rounded-xl border border-[#dfe5dd] dark:border-white/10 px-4 py-3 text-sm text-[#7a837a] dark:text-white/50">
                            Checking your participation status…
                          </div>
                        )}

                        {enrollmentStatus === "unavailable" && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                            We could not confirm your enrollment. Refresh your status before starting the task.
                          </div>
                        )}

                        {enrollmentStatus === "not-enrolled" && (
                          <div className="flex flex-col items-start gap-2">
                            <button
                              onClick={handleEnroll}
                              disabled={isEnrolling}
                              className={`${primaryButton} w-full sm:w-auto`}
                            >
                              <FiZap size={16} />
                              {isEnrolling ? "Recording enrollment…" : "Start task"}
                            </button>
                            <p className="text-xs text-[#727c73] dark:text-white/50">This records your participation in the app; it is not an on-chain transaction.</p>
                          </div>
                        )}

                        {enrollmentStatus === "enrolled" && submissionStatusError && (
                          <div className="flex flex-col items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                            Could not check whether you have already submitted. Refresh your status before submitting again.
                            <button type="button" onClick={() => refreshContributorStatus()} disabled={isRefreshingContributorStatus} className="font-semibold underline">
                              {isRefreshingContributorStatus ? "Checking…" : "Check submission status"}
                            </button>
                          </div>
                        )}

                        {enrollmentStatus === "enrolled" && !submissionStatusError &&
                          !hasUserSubmitted && (
                            <button
                              onClick={() => setShowSubmitModal(true)}
                              className={`${primaryButton} w-full sm:w-auto`}
                            >
                              <FiSend size={16} />
                              Submit your work
                            </button>
                          )}

                        {enrollmentStatus === "enrolled" && !submissionStatusError &&
                          hasUserSubmitted && (
                            <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/10 px-4 py-3 text-sm font-semibold text-[#008a66] dark:text-[#00D6A0]">
                              <FiCheckCircle />
                              Submission received
                            </span>
                          )}
                      </>
                    )}

                    {canClaim() && (
                      <button
                        onClick={handleClaimReward}
                        disabled={isClaiming || isClaimSyncing || Boolean(pendingClaimSync) || isContractPending || isContractConfirming}
                        className={`${primaryButton} w-full sm:w-auto`}
                      >
                        <FiAward size={16} />

                        {isClaiming
                          ? claimPhase || "Claiming..."
                          : isContractPending
                          ? "Confirm in wallet..."
                          : isContractConfirming
                            ? "Confirming..."
                            : `Claim ${displayClaimable()} ${token}`}
                      </button>
                    )}

                    {canDistribute() && (
                      <button
                        onClick={openDistributeModal}
                        disabled={!hasEnoughSelections()}
                        title={!hasEnoughSelections() ? getDistributionBlockReason() : undefined}
                        className={`${primaryButton} w-full sm:w-auto`}
                      >
                        <FiUsers />
                        {hasEnoughSelections()
                          ? "Review distribution"
                          : `Select ${Math.max(0, requiredWinnerCount - selectedWinners.length)} more winner${requiredWinnerCount - selectedWinners.length === 1 ? "" : "s"}`}
                      </button>
                    )}
                  </div>

                  {isCreator && !winnersData?.isDistributed && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dfe5dd] dark:border-white/10 bg-[#f8faf7] dark:bg-white/[0.025] p-4">
                      <FiInfo
                        size={17}
                        className="mt-0.5 shrink-0 text-[#008a66] dark:text-[#00D6A0]"
                      />

                      <div>
                        <p className="text-sm font-semibold">
                          Reward distribution
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#727c73] dark:text-white/50">
                          {getDistributionBlockReason()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {hasUserSubmitted && userSubmission && (
                <section className={cardClass}>
                  <div className="p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]">
                        <FiCheckCircle size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold">Your submission</h2>

                        <p className="mt-1 text-xs text-[#778077] dark:text-white/45">
                          Your work and proof of completion
                        </p>
                      </div>

                      <span className="rounded-full border border-[#dfe5dd] dark:border-white/10 px-3 py-1.5 text-xs font-semibold">
                        {userSubmission.status === "accepted"
                          ? "Selected"
                          : userSubmission.status === "rejected"
                            ? "Not selected"
                            : "Under review"}
                      </span>
                    </div>

                    <p className="mb-4 text-xs leading-5 text-[#727c73] dark:text-white/50">
                      Submitted {userSubmission.submittedAt ? `on ${formatDateTime(userSubmission.submittedAt)}` : "successfully"}. Each contributor can submit once per bounty; editing or resubmitting is not currently available.
                    </p>

                    <div className="rounded-xl border border-[#dfe5df] bg-white p-4 dark:border-white/10 dark:bg-black/10">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                        Work description
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#515b52] dark:text-white/70">
                        {userSubmission.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {safeExternalUrl(userSubmission.projectLink) && (
                        <a
                          href={safeExternalUrl(userSubmission.projectLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open project link in a new tab"
                          className={`${secondaryButton} min-w-0 justify-start`}
                        >
                          <FiLink className="shrink-0 text-[#008a66] dark:text-[#00D6A0]" />
                          <span className="truncate">
                            {getHostname(userSubmission.projectLink)}
                          </span>
                          <FiExternalLink className="shrink-0" />
                        </a>
                      )}
                      {safeExternalUrl(userSubmission.image, {
                        httpsOnly: true,
                      }) && (
                        <a
                          href={safeExternalUrl(userSubmission.image, {
                            httpsOnly: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open submission image in a new tab"
                          className={`${secondaryButton} justify-start`}
                        >
                          <FiExternalLink className="text-[#008a66] dark:text-[#00D6A0]" />
                          View submission image
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section className={cardClass}>
                <div className="p-5 sm:p-7">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-bold">
                        <FiUsers className="text-[#008a66] dark:text-[#00D6A0]" />
                        Participants
                        <span className="rounded-lg bg-[#f0f4ef] dark:bg-white/[0.05] px-2 py-1 text-xs font-semibold text-[#69736a] dark:text-white/60">
                          {participantPagination?.total ??
                            bounty?.submissions?.count ??
                            0}
                        </span>
                      </h2>
                      <p className="mt-2 text-sm text-[#778077] dark:text-white/50">
                        Everyone who submitted work to this bounty. Your wallet
                        is highlighted when you participated.
                      </p>
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#899189]" />
                      <input
                        value={participantSearch}
                        onChange={(event) =>
                          setParticipantSearch(event.target.value)
                        }
                        placeholder="Filter visible wallets"
                        className={`${inputClass} pl-9`}
                        aria-label="Search participants by wallet address"
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "Everyone" },
                      { value: "winners", label: "Winners" },
                      { value: "others", label: "Other participants" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setParticipantFilter(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${participantFilter === filter.value ? "bg-[#00D6A0] text-[#06271e]" : "border border-[#dfe3dc] dark:border-white/10 text-[#687269] dark:text-white/60 hover:border-[#00D6A0]"}`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {participantsLoading ? (
                    <div className="py-8 text-center text-sm text-[#899189]">
                      Loading participants…
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#dfe3dc] dark:border-white/10 px-4 py-10 text-center">
                      <FiUsers className="mx-auto mb-2 text-2xl text-[#899189]" />
                      <p className="font-semibold">No participants yet</p>
                      <p className="mt-1 text-sm text-[#899189]">
                        Submitted entries will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e5e9e3] dark:divide-white/[0.08]">
                      {participantRows
                        .filter((person) => {
                          const isWinner = winnerAddressesSet.has(
                            person.walletAddress?.toLowerCase(),
                          );
                          const matchesSearch = person.walletAddress
                            ?.toLowerCase()
                            .includes(participantSearch.trim().toLowerCase());
                          return (
                            matchesSearch &&
                            (participantFilter === "all" ||
                              (participantFilter === "winners"
                                ? isWinner
                                : !isWinner))
                          );
                        })
                        .map((person) => {
                          const wallet = person.walletAddress?.toLowerCase();
                          const isCurrent = Boolean(
                            address && wallet === address.toLowerCase(),
                          );
                          const isWinner = winnerAddressesSet.has(wallet);
                          return (
                            <div
                              key={wallet}
                              className={`flex flex-wrap items-center justify-between gap-3 py-3 ${isCurrent ? "rounded-xl bg-[#00D6A0]/[0.06] px-3" : ""}`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f4ef] dark:bg-white/[0.06] text-[#008a66] dark:text-[#00D6A0]">
                                  <FiUsers size={15} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-sm font-semibold">
                                      {shortenAddress(person.walletAddress)}
                                    </span>
                                    {isCurrent && (
                                      <span className="rounded-full border border-[#00D6A0]/30 px-2 py-0.5 text-[10px] font-bold text-[#008a66] dark:text-[#00D6A0]">
                                        YOU
                                      </span>
                                    )}
                                    {isWinner && (
                                      <span className="rounded-full bg-[#00D6A0]/10 px-2 py-0.5 text-[10px] font-bold text-[#008a66] dark:text-[#00D6A0]">
                                        WINNER
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-[#899189]">
                                    Submitted{" "}
                                    {formatDateTime(person.submittedAt)}
                                  </p>
                                </div>
                              </div>
                              {isWinner && (
                                <span className="text-xs font-semibold text-[#008a66] dark:text-[#00D6A0]">
                                  Selected winner
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {!participantsLoading &&
                    participants.length > 0 &&
                    participantRows.filter((person) => {
                      const isWinner = winnerAddressesSet.has(
                        person.walletAddress?.toLowerCase(),
                      );
                      const matchesSearch = person.walletAddress
                        ?.toLowerCase()
                        .includes(participantSearch.trim().toLowerCase());
                      return (
                        matchesSearch &&
                        (participantFilter === "all" ||
                          (participantFilter === "winners"
                            ? isWinner
                            : !isWinner))
                      );
                    }).length === 0 && (
                      <p className="rounded-xl bg-[#f8faf7] dark:bg-white/[0.03] px-4 py-6 text-center text-sm text-[#899189]">
                        No participants match this search or filter.
                      </p>
                    )}

                  {participantPagination && participantPagination.pages > 1 && (
                    <div className="mt-5 flex items-center justify-between border-t border-[#e5e9e3] dark:border-white/[0.08] pt-4">
                      <span className="text-xs text-[#899189]">
                        Page {participantPagination.page} of{" "}
                        {participantPagination.pages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={
                            !participantPagination.hasPrev ||
                            participantsLoading
                          }
                          onClick={() =>
                            loadParticipants(id, participantPage - 1)
                          }
                          className={secondaryButton}
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={
                            !participantPagination.hasNext ||
                            participantsLoading
                          }
                          onClick={() =>
                            loadParticipants(id, participantPage + 1)
                          }
                          className={secondaryButton}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {winnersData?.isDistributed &&
                (winnersData.winners?.length > 0 ||
                  winnersData.claimed?.length > 0) && (
                  <section className={cardClass}>
                    <div className="p-5 sm:p-7">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]">
                          <FiAward size={21} />
                        </div>

                        <div>
                          <h2 className="text-lg font-bold">
                            Rewards distributed
                          </h2>

                          <p className="mt-1 text-xs text-[#778077] dark:text-white/45">
                            Winner and claim status
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-[#e5e9e3] dark:divide-white/[0.08]">
                        {[
                          ...(winnersData.winners || []),
                          ...(winnersData.claimed || []),
                        ].map((winner, index) => {
                          const current =
                            address?.toLowerCase() ===
                            winner.address?.toLowerCase();

                          const claimed = winnersData.claimed?.some(
                            (item) =>
                              item.address?.toLowerCase() ===
                              winner.address?.toLowerCase(),
                          );

                          return (
                            <div
                              key={`${winner.address}-${index}`}
                              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-[#f8faf7] dark:bg-white/[0.03] text-xs font-bold">
                                  {index + 1}
                                </div>

                                <div>
                                  <p className="font-mono text-sm font-semibold">
                                    {shortenAddress(winner.address)}
                                  </p>

                                  <p className="mt-1 text-xs text-[#778077] dark:text-white/45">
                                    {current ? "Your wallet" : "Winner"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-bold text-[#008a66] dark:text-[#00D6A0]">
                                  {formatAmount(winner.amount)} {token}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    claimed
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                      : "bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]"
                                  }`}
                                >
                                  {claimed ? (
                                    <FiCheck size={13} />
                                  ) : (
                                    <FiClock size={13} />
                                  )}

                                  {claimed
                                    ? "Claimed"
                                    : current
                                      ? "Ready to claim"
                                      : "Awaiting claim"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                )}

              {(allSubmissions.length > 0 || isCreator) && (
                <section className={cardClass}>
                  <div className="p-5 sm:p-7">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                          <FiUsers className="text-[#008a66] dark:text-[#00D6A0]" />
                          Submissions
                          <span className="rounded-lg bg-[#f0f4ef] dark:bg-white/[0.05] px-2 py-1 text-xs font-semibold text-[#69736a] dark:text-white/60">
                            {allSubmissions.length}
                          </span>
                        </h2>

                        <p className="mt-2 text-sm text-[#778077] dark:text-white/50">
                          {isCreator
                            ? `${pendingReviewCount} submission${pendingReviewCount === 1 ? "" : "s"} awaiting review. Review the task requirements and proof before selecting winners.`
                            : "Work submitted by bounty participants."}
                        </p>
                      </div>

                      {isCreator && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-fit rounded-full border border-[#00D6A0]/25 bg-[#00D6A0]/10 px-3 py-1.5 text-xs font-bold text-[#008a66] dark:text-[#00D6A0]">
                            {selectedWinners.length} / {requiredWinnerCount} winners selected
                          </span>
                          <button type="button" onClick={() => refreshCreatorReview()} disabled={isRefreshingReviewQueue} className={`${secondaryButton} !px-3 !py-2 text-xs`}>
                            {isRefreshingReviewQueue ? "Refreshing…" : "Refresh reviews"}
                          </button>
                        </div>
                      )}
                    </div>

                    {isCreator && (
                      <div className="mb-5 rounded-xl border border-[#dfe5dd] bg-[#f8faf7] p-4 text-xs leading-5 text-[#727c73] dark:border-white/10 dark:bg-white/[0.025] dark:text-white/55">
                        <p>Use the bounty requirements above and each contributor’s proof to review submissions. Selections can be changed until you confirm distribution.</p>
                        {reviewQueueError && <p className="mt-2 text-amber-700 dark:text-amber-200" role="status">{reviewQueueError}</p>}
                        <details className="mt-2">
                          <summary className="cursor-pointer font-semibold text-[#008a66] dark:text-[#00D6A0]">View full evaluation requirements</summary>
                          <p className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap">{bounty.description || "No additional requirements were provided."}</p>
                        </details>
                      </div>
                    )}

                    {isCreator &&
                      selectedWinners.length > 0 &&
                      bounty.payoutType === "MULTI_PERCENTAGE" &&
                      bounty.percentages?.length > 0 && (
                        <div className="mb-5 rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-[#f8faf7] dark:bg-white/[0.025] p-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7c867d] dark:text-white/45">
                            Payout order
                          </p>

                          <div className="space-y-2">
                            {selectedWinners.map((winner, index) => (
                              <div
                                key={winner.address}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="font-mono text-[#606b61] dark:text-white/65">
                                  {index + 1}. {shortenAddress(winner.address)}
                                </span>

                                <span className="font-bold text-[#008a66] dark:text-[#00D6A0]">
                                  {bounty.percentages[index]}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {allSubmissions.length === 0 && (
                      <p className="rounded-xl border border-dashed border-[#dfe5dd] px-4 py-8 text-center text-sm text-[#899189] dark:border-white/10">
                        No submissions have been received yet. Once contributors submit their work, you can review it here.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {reviewSubmissions.map((submission) => {
                        const selected =
                          isCreator && isSelected(submission.user);

                        const winner = winnerAddressesSet.has(
                          submission.user?.toLowerCase(),
                        );

                        const selectionIndex = selectedWinners.findIndex(
                          (item) =>
                            item.address === submission.user?.toLowerCase(),
                        );

                        const current =
                          address?.toLowerCase() ===
                          submission.user?.toLowerCase();

                        return (
                          <article
                            key={submission._id}
                            className={`min-w-0 rounded-2xl border p-4 transition-colors ${
                              selected
                                ? "border-[#00D6A0]/60 bg-[#00D6A0]/[0.06]"
                                : "border-[#e2e7e0] dark:border-white/10 bg-[#fafbf9] dark:bg-[#141814] hover:border-[#00D6A0]/35"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-bold">
                                {shortenAddress(submission.user)}
                              </span>

                              {winner && (
                                <span className="rounded-full bg-[#00D6A0]/10 px-2 py-1 text-[10px] font-bold text-[#008a66] dark:text-[#00D6A0]">
                                  WINNER
                                </span>
                              )}

                              {current && (
                                <span className="rounded-full border border-[#dfe5dd] dark:border-white/10 px-2 py-1 text-[10px] font-bold">
                                  YOU
                                </span>
                              )}

                              {selected && (
                                <span className="rounded-full bg-[#00D6A0]/10 px-2 py-1 text-[10px] font-bold text-[#008a66] dark:text-[#00D6A0]">
                                  #{selectionIndex + 1}
                                </span>
                              )}
                              {isCreator && (
                                <span className="rounded-full border border-[#dfe5dd] px-2 py-1 text-[10px] font-semibold text-[#69736a] dark:border-white/10 dark:text-white/55">
                                  {submission.status === "accepted"
                                    ? "Selected"
                                    : submission.status === "rejected"
                                      ? "Not selected"
                                      : "Pending review"}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs text-[#899189] dark:text-white/40">
                              {formatDateTime(submission.submittedAt)}
                            </p>

                            {isCreator && (
                              <>
                                <div className="mt-4 rounded-xl border border-[#dfe5df] bg-white p-4 dark:border-white/10 dark:bg-black/10">
                                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                                    Work description
                                  </p>

                                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#515b52] dark:text-white/70">
                                    {submission.description ||
                                      "No description provided."}
                                  </p>
                                </div>

                                {(submission.projectLink ||
                                  submission.image) && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {safeExternalUrl(
                                      submission.projectLink,
                                    ) && (
                                      <a
                                        href={safeExternalUrl(
                                          submission.projectLink,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Open project link in a new tab"
                                        className={`${secondaryButton} min-w-0 flex-1 !px-3 !py-2.5`}
                                      >
                                        <FiLink className="shrink-0" />

                                        <span className="truncate">
                                          {getHostname(submission.projectLink)}
                                        </span>

                                        <FiExternalLink className="shrink-0" />
                                      </a>
                                    )}
                                    {safeExternalUrl(submission.image, {
                                      httpsOnly: true,
                                    }) && (
                                      <a
                                        href={safeExternalUrl(
                                          submission.image,
                                          { httpsOnly: true },
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Open submission image in a new tab"
                                        className={`${secondaryButton} !px-3 !py-2.5`}
                                      >
                                        <FiExternalLink /> View image
                                      </a>
                                    )}
                                  </div>
                                )}

                                <div className="mt-4 border-t border-[#e2e7e0] dark:border-white/10 pt-3">
                                  <button
                                    onClick={() =>
                                      toggleWinnerSelection(submission)
                                    }
                                    disabled={
                                      Boolean(winner) ||
                                      Boolean(winnersData?.isDistributed)
                                    }
                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                      selected
                                        ? "bg-[#00D6A0] text-[#06271e]"
                                        : "border border-[#dfe3dc] dark:border-white/10 bg-white dark:bg-[#101310] hover:border-[#00D6A0] hover:text-[#008a66] dark:hover:text-[#00D6A0]"
                                    }`}
                                  >
                                    {winner ? (
                                      "Already a winner"
                                    ) : selected ? (
                                      <>
                                        <FiCheck className="mr-1 inline" />
                                        Selected as winner
                                      </>
                                    ) : (
                                      "Select winner"
                                    )}
                                  </button>
                                </div>
                              </>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {isCreator && selectedWinners.length > 0 && (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => setSelectedWinners([])}
                          className="text-sm font-semibold text-[#778077] hover:text-red-500"
                        >
                          Clear selection
                        </button>

                        {canDistribute() && (
                          <button
                            onClick={openDistributeModal}
                            disabled={!hasEnoughSelections()}
                            title={!hasEnoughSelections() ? getDistributionBlockReason() : undefined}
                            className={primaryButton}
                          >
                            <FiAward />
                            {hasEnoughSelections() ? "Review distribution" : `Select ${Math.max(0, requiredWinnerCount - selectedWinners.length)} more winner${requiredWinnerCount - selectedWinners.length === 1 ? "" : "s"}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className={cardClass}>
                <div className="p-5 sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]">
                      <FiMessageCircle size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">Discussion</h2>

                      <p className="mt-1 text-xs text-[#778077] dark:text-white/45">
                        Ask questions and share useful information
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 max-h-96 space-y-3 overflow-y-auto">
                    {comments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#dfe5dd] dark:border-white/10 py-8 text-center">
                        <FiMessageCircle
                          className="mx-auto mb-3 text-[#a2aba2]"
                          size={23}
                        />

                        <p className="text-sm font-semibold">
                          Start the conversation
                        </p>

                        <p className="mt-1 text-xs text-[#899189] dark:text-white/40">
                          No comments yet.
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment._id || comment.id}
                          className="rounded-xl border border-[#e2e7e0] dark:border-white/10 bg-[#fafbf9] dark:bg-[#141814] p-4"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-[#008a66] dark:text-[#00D6A0]">
                              {shortenAddress(comment.user)}
                            </span>

                            <span className="text-[10px] text-[#899189] dark:text-white/40">
                              {formatDateTime(
                                comment.createdAt || comment.timestamp,
                              )}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#566057] dark:text-white/70">
                            {comment.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleAddComment();
                    }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder={
                        address
                          ? "Write a comment..."
                          : "Connect your wallet to comment"
                      }
                      disabled={!address || commentSubmitting}
                      className={inputClass}
                    />

                    <button
                      type="submit"
                      disabled={
                        !address || !newComment.trim() || commentSubmitting
                      }
                      className={`${primaryButton} sm:shrink-0`}
                    >
                      <FiSend size={15} />
                      {commentSubmitting ? "Sending..." : "Comment"}
                    </button>
                  </form>
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <section className={cardClass}>
                <div className="border-b border-[#e5e9e3] dark:border-white/[0.08] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                    Bounty overview
                  </p>

                  <h2 className="mt-2 text-lg font-bold">At a glance</h2>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">
                      Status
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                        statusStyles[displayStatus] || statusStyles.ended
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">
                      Network
                    </span>

                    <span className="text-right text-sm font-semibold">
                      {networkName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">
                      Category
                    </span>

                    <span className="text-right text-sm font-semibold">
                      {bounty.category || "General"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">
                      Payout
                    </span>

                    <span className="text-right text-sm font-semibold">
                      {bounty.payoutType === "SINGLE"
                        ? "Single winner"
                        : bounty.payoutType === "MULTI_EQUAL"
                          ? "Equal split"
                          : bounty.payoutType === "MULTI_PERCENTAGE"
                            ? "Custom split"
                            : "Not specified"}
                    </span>
                  </div>

                  <div className="border-t border-[#e5e9e3] dark:border-white/[0.08] pt-4">
                    <p className="text-xs text-[#778077] dark:text-white/50">
                      Total reward
                    </p>

                    <p className="mt-1 break-words text-2xl font-extrabold text-[#008a66] dark:text-[#00D6A0]">
                      {formatAmount(bounty.reward)}{" "}
                      <span className="text-sm">{token}</span>
                    </p>
                  </div>

                  {safeExternalUrl(bounty.originLink) && (
                    <a
                      href={safeExternalUrl(bounty.originLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open project website in a new tab"
                      className={`${secondaryButton} w-full`}
                    >
                      <FiGlobe size={16} /> Visit project{" "}
                      <FiExternalLink size={13} />
                    </a>
                  )}
                </div>
              </section>

              <section className={`${cardClass} !border-[#00D6A0]/20`}>
                <div className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]">
                    <FiShield size={19} />
                  </div>

                  <h3 className="font-bold">Work. Earn. Grow.</h3>

                  <p className="mt-2 text-sm leading-6 text-[#778077] dark:text-white/50">
                    Complete the task, submit your proof, and get rewarded when
                    your work is approved.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {showEditBountyModal && bounty && (
        <div
          className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => !savingBountyEdits && setShowEditBountyModal(false)}
        >
          <div
            className="app-modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#101310] shadow-2xl"
          ref={editDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-bounty-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#e5e9e3] dark:border-white/[0.08] p-5 sm:p-6">
              <div>
                <h2 id="edit-bounty-title" className="text-xl font-extrabold">Edit bounty</h2>
                <p className="mt-1 text-sm text-[#778077] dark:text-white/50">
                  Update the title, description, or extend the deadline.
                </p>
              </div>
              <button
                type="button"
                disabled={savingBountyEdits}
                onClick={() => setShowEditBountyModal(false)}
                className={`${secondaryButton} !h-9 !w-9 !p-0`}
                aria-label="Close edit bounty dialog"
              >
                <FiX size={17} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateBounty}
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label htmlFor="edit-bounty-title-input" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                  Bounty title
                </label>
                <input
                  type="text"
                  id="edit-bounty-title-input"
                  ref={editTitleInputRef}
                  maxLength={160}
                  required
                  value={editBountyForm.title}
                  onChange={(event) =>
                    setEditBountyForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  className={inputClass}
                  aria-invalid={Boolean(editBountyErrors.title)}
                  aria-describedby={editBountyErrors.title ? "edit-bounty-title-error" : undefined}
                />
                {editBountyErrors.title && <p id="edit-bounty-title-error" className="mt-1 text-sm text-red-600" role="alert">{editBountyErrors.title}</p>}
              </div>

              <div>
                <label htmlFor="edit-bounty-description" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                  Description
                </label>
                <textarea
                  maxLength={20000}
                  id="edit-bounty-description"
                  required
                  rows={6}
                  value={editBountyForm.description}
                  onChange={(event) =>
                    setEditBountyForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  className={`${inputClass} resize-y`}
                  aria-invalid={Boolean(editBountyErrors.description)}
                  aria-describedby={editBountyErrors.description ? "edit-bounty-description-error" : undefined}
                />
                {editBountyErrors.description && <p id="edit-bounty-description-error" className="mt-1 text-sm text-red-600" role="alert">{editBountyErrors.description}</p>}
              </div>

              <div>
                <label htmlFor="edit-bounty-deadline" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                  Deadline
                </label>
                <input
                  type="date"
                  id="edit-bounty-deadline"
                  required
                  min={toLocalDateInput(bounty.deadline)}
                  disabled={
                    String(bounty.status || "").toLowerCase() === "completed"
                  }
                  value={editBountyForm.deadline}
                  onChange={(event) =>
                    setEditBountyForm((previous) => ({
                      ...previous,
                      deadline: event.target.value,
                    }))
                  }
                  className={inputClass}
                  aria-invalid={Boolean(editBountyErrors.deadline)}
                  aria-describedby={editBountyErrors.deadline ? "edit-bounty-deadline-error" : "edit-bounty-deadline-help"}
                />
                {editBountyErrors.deadline && <p id="edit-bounty-deadline-error" className="mt-1 text-sm text-red-600" role="alert">{editBountyErrors.deadline}</p>}
                <p id="edit-bounty-deadline-help" className="mt-2 text-xs text-[#899189] dark:text-white/40">
                  {String(bounty.status || "").toLowerCase() === "completed"
                    ? "The deadline cannot be changed because this bounty is completed."
                    : "The start date cannot be changed. You may keep the current deadline or choose a later date."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={savingBountyEdits}
                  onClick={() => setShowEditBountyModal(false)}
                  className={`${secondaryButton} flex-1`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBountyEdits}
                  className={`${primaryButton} flex-1`}
                >
                  {savingBountyEdits ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div
          className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => {
            if (submitting) return;
            setShowSubmitModal(false);
          }}
        >
          <div
            className="app-modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#101310] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#e5e9e3] dark:border-white/[0.08] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-extrabold">Submit your work</h2>

                <p className="mt-1 text-sm text-[#778077] dark:text-white/50">
                  Share your completed task and proof.
                </p>
                <p className="mt-2 text-xs text-[#899189] dark:text-white/40">
                  Your description and proof link are saved on this device. The optional image must be selected again if you leave this page.
                </p>
                {bounty && (
                  <div className="mt-3 rounded-xl border border-[#dfe5dd] bg-[#f8faf7] p-3 text-xs dark:border-white/10 dark:bg-white/[0.025]">
                    <p className="font-semibold">{bounty.title}</p>
                    <p className="mt-1 text-[#727c73] dark:text-white/50">
                      Reward: {formatAmount(bounty.reward)} {token} · Deadline: {formatDateTime(bounty.deadline)} · {networkName} · {bounty.winnersAllowed || 1} winner{Number(bounty.winnersAllowed || 1) === 1 ? "" : "s"}
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-semibold text-[#008a66] dark:text-[#00D6A0]">Review task requirements</summary>
                      <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap leading-5 text-[#727c73] dark:text-white/55">{bounty.description}</p>
                    </details>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  if (submitting) return;
                  setShowSubmitModal(false);
                }}
                disabled={submitting}
                className={`${secondaryButton} !h-9 !w-9 !p-0`}
              >
                <FiX size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                  Screenshot or image proof{" "}
                  <span className="font-normal normal-case">
                    (optional, max 5MB)
                  </span>
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd8ce] dark:border-white/15 bg-[#f8faf7] dark:bg-white/[0.025] px-4 py-6 text-center transition hover:border-[#00D6A0]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Submission preview"
                      className="max-h-44 max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <>
                      <FiUploadCloud
                        size={27}
                        className="mb-3 text-[#008a66] dark:text-[#00D6A0]"
                      />
                      <span className="text-sm font-semibold">
                        Choose an image
                      </span>
                      <span className="mt-1 text-xs text-[#899189] dark:text-white/40">
                        JPEG, PNG, or WebP
                      </span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionImage(null);
                      setImagePreview(null);
                      setImageSizeWarning("");

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="mt-2 text-xs font-semibold text-red-500"
                  >
                    Remove image
                  </button>
                )}

                {imageSizeWarning && (
                  <p className="mt-2 text-xs text-red-500">
                    {imageSizeWarning}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="submission-description" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                  What did you complete?
                </label>

                <textarea
                  id="submission-description"
                  value={submissionDescription}
                  onChange={(event) =>
                    setSubmissionDescription(event.target.value)
                  }
                  placeholder="Describe the work you completed..."
                  rows={5}
                  maxLength={5000}
                  required
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className="mt-1 text-right text-[10px] text-[#899189] dark:text-white/40">
                  {submissionDescription.length}/5000
                </p>
              </div>

              <div>
                <label htmlFor="submission-proof-link" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                  Proof link
                </label>

                <input
                  id="submission-proof-link"
                  type="url"
                  value={submissionLink}
                  onChange={(event) => setSubmissionLink(event.target.value)}
                  placeholder="https://github.com/..."
                  required
                  className={`${inputClass} ${
                    submissionLinkError && submissionLink
                      ? "!border-red-400"
                      : ""
                  }`}
                />

                {submissionLinkError && submissionLink.length > 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    {submissionLinkError}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    resetSubmissionForm();
                    setShowSubmitModal(false);
                  }}
                  className={`${secondaryButton} flex-1`}
                >Discard draft</button>
                <button
                  type="submit"
                  disabled={submitting || Boolean(imageSizeWarning)}
                  className={`${primaryButton} flex-1`}
                >
                  {submitting ? "Submitting your work…" : <><FiSend size={16} /> Submit for review</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDistributeModal && bounty && (
        <div
          className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => !distributing && setShowDistributeModal(false)}
        >
          <div
            className="app-modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#101310] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#e5e9e3] dark:border-white/[0.08] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-extrabold">Distribute rewards</h2>

                <p className="mt-1 text-sm text-[#778077] dark:text-white/50">
                  Final review of the selected contributors and their payouts.
                </p>
              </div>

              <button
                type="button"
                disabled={distributing}
                onClick={() => setShowDistributeModal(false)}
                className={`${secondaryButton} !h-9 !w-9 !p-0`}
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4">
                <p className="text-xs text-[#778077] dark:text-white/50">
                  Bounty
                </p>

                <p className="mt-1 break-words font-bold">{bounty.title}</p>

                <p className="mt-3 text-xs text-[#778077] dark:text-white/50">
                  Total reward
                </p>

                <p className="mt-1 text-2xl font-extrabold text-[#008a66] dark:text-[#00D6A0]">
                  {formatAmount(bounty.reward)} {token}
                </p>
                <div className="mt-3 grid gap-2 border-t border-[#00D6A0]/15 pt-3 text-xs text-[#727c73] dark:text-white/55 sm:grid-cols-2">
                  <p>Network: <span className="font-semibold text-[#171b18] dark:text-white">{networkName}</span></p>
                  <p>Winners: <span className="font-semibold text-[#171b18] dark:text-white">{winnerAddresses.length} of {requiredWinnerCount}</span></p>
                  <p className="sm:col-span-2">Payout: <span className="font-semibold text-[#171b18] dark:text-white">{bounty.payoutType === "SINGLE" ? "Single winner receives the full reward" : bounty.payoutType === "MULTI_EQUAL" ? `Equal split across ${requiredWinnerCount} winners` : `Custom split: ${bounty.percentages?.join("% / ")}%`}</span></p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#dfe5dd] bg-[#f8faf7] px-4 py-3 text-xs dark:border-white/10 dark:bg-white/[0.025]" role="status" aria-live="polite">
                <p className="font-bold">{distributionPhase || "Ready to confirm"}</p>
                <p className="mt-1 text-[#727c73] dark:text-white/50">
                  {distributionPhase === "Confirm in wallet"
                    ? "Approve the winner assignment in your wallet."
                    : distributionPhase === "Confirming on-chain"
                      ? "The transaction was submitted. Waiting for its on-chain confirmation."
                      : distributionPhase === "Recording reward claims"
                        ? "The chain confirmed the distribution. The app is recording each reward claim."
                        : distributionPhase === "Checking transaction confirmation"
                          ? "Checking the existing transaction before retrying app synchronization."
                          : "Check each recipient and amount. You can change selected submissions before confirming."}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {winnerAddresses.map((addr, index) => {
                  let amount = Number(bounty.reward) || 0;

                  if (bounty.payoutType === "MULTI_EQUAL") {
                    amount /= Number(bounty.winnersAllowed) || 1;
                  } else if (bounty.payoutType === "MULTI_PERCENTAGE") {
                    amount =
                      (amount * (Number(bounty.percentages?.[index]) || 0)) /
                      100;
                  }

                  return (
                    <div key={index}>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">
                        Winner {index + 1} wallet
                      </label>

                      <input
                        type="text"
                        value={addr}
                        readOnly
                        className={inputClass}
                      />

                      <p className="mt-2 text-xs text-[#008a66] dark:text-[#00D6A0]">
                        Estimated allocation: {formatAmount(amount)} {token}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={distributing}
                  onClick={() => setShowDistributeModal(false)}
                  className={`${secondaryButton} flex-1`}
                >
                  Cancel
                </button>

                <button
                  disabled={
                    distributing || isContractPending || isContractConfirming
                  }
                  onClick={handleDistributeReward}
                  className={`${primaryButton} flex-1`}
                >
                  {distributing || isContractPending || isContractConfirming ? (
                    distributionPhase || (isContractPending ? "Confirm in wallet" : isContractConfirming ? "Confirming on-chain" : "Recording reward claims")
                  ) : (
                    <>
                      <FiShield size={16} />
                      Confirm distribution
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#899189] dark:text-white/40">
                Confirming this action may require a wallet transaction. Check
                every address before approving it.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <button
        type="button"
        onClick={handleScrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
        className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00D6A0]/30 bg-white text-[#008a66] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#00D6A0]/10 dark:bg-[#151915] dark:text-[#00D6A0] ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <FiArrowUp size={20} />
      </button>
    </div>
  );
};

export default BountyDetail;
