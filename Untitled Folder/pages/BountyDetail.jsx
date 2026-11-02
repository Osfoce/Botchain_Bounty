
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "react-icons/fi";
import NavBar from "../components/Layout/NavBar";
import Footer from "../components/Layout/Footer";
import {
  getBountyContract,
  getNativeToken,
  getExplorerUrl,
} from "../utils/chains.address";
import { supportedChains } from "../rainbowChains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { formatEther } from "viem";
import { useBounty } from "../hooks/useBounty";
import { formatAmount } from "../utils/format";
import { BountyDetailSkeleton } from "../components/UI/Skeleton";

const BountyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
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
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasUserSubmitted, setHasUserSubmitted] = useState(false);
  const [userSubmission, setUserSubmission] = useState(null);
  const [winnersData, setWinnersData] = useState(null);
  const [offChainClaimable, setOffChainClaimable] = useState("0");
  const [hasUserClaimedOffChain, setHasUserClaimedOffChain] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [submissionImage, setSubmissionImage] = useState(null);
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSizeWarning, setImageSizeWarning] = useState("");
  const [winnerAddresses, setWinnerAddresses] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState("checking");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);

  const blockchainId =
    bounty?.blockchainId !== null && bounty?.blockchainId !== undefined
      ? Number(bounty.blockchainId)
      : null;

  const { data: onChainClaimable, refetch: refetchClaimable } =
    useClaimableReward(blockchainId, address);

  const { data: onChainClaimed } = useClaimedStatus(blockchainId, address);

  useEffect(() => {
    if (blockchainId !== null && address) refetchClaimable();
  }, [blockchainId, address, refetchClaimable]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 350);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown logic preserved exactly as provided.
  useEffect(() => {
    if (!bounty?.deadline) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const deadline = new Date(bounty.deadline).getTime();
      const difference = deadline - Date.now();

      if (!Number.isFinite(deadline) || difference <= 0) {
        setTimeRemaining(null);
        return;
      }

      setTimeRemaining({
        days: Math.floor(difference / 86400000),
        hours: Math.floor((difference % 86400000) / 3600000),
        minutes: Math.floor((difference % 3600000) / 60000),
        seconds: Math.floor((difference % 60000) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [bounty?.deadline]);

  const handleScrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const handleGoBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/dashboard");
  };

  const getHostname = (url) => {
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const shortenAddress = (value) =>
    value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Unknown";

  const formatDate = (value) => {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not set";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isValidUrl = (value) => {
    if (!value) return "";
    let url;

    try {
      url = new URL(value);
    } catch {
      return "Enter a complete URL, e.g. https://github.com/user/repo";
    }

    if (!["http:", "https:"].includes(url.protocol))
      return "Only HTTP and HTTPS links are allowed";

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
          if (!context) return reject(new Error("Image processing unavailable"));

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

  const checkUserEnrollment = async (wallet, bountyId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/user/get-enrollment/${wallet}`,
      );

      return (data.enrollments || []).some(
        (entry) => String(entry.bountyId) === String(bountyId),
      );
    } catch {
      return false;
    }
  };

  const checkUserSubmission = async (wallet, bountyId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/bounty/user/submissions/${wallet}`,
      );

      const existing = (data.submissions || []).find(
        (submission) => String(submission.bountyId) === String(bountyId),
      );

      setHasUserSubmitted(Boolean(existing));
      setUserSubmission(existing || null);
    } catch (error) {
      console.error("Error checking submission:", error);
    }
  };

  const loadWinnersData = async (bountyId) => {
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
    } catch (error) {
      console.error("Error loading winners:", error);
    }
  };

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
      setIsCreator(false);
      setHasUserSubmitted(false);
      setUserSubmission(null);
      setWinnersData(null);
      setOffChainClaimable("0");
      setHasUserClaimedOffChain(false);
      setAllSubmissions([]);
      setSelectedWinners([]);
      setShowFullDescription(false);

      try {
        const { data } = await axios.get(`${API_URL}/bounty/${id}`, {
          params: { wallet: address },
        });

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
            await axios.patch(`${API_URL}/bounty/update/${id}`, {
              blockchainId: fetchedId,
            });

            bountyData = { ...bountyData, blockchainId: fetchedId };
          }
        }

        if (cancelled) return;

        setBounty(bountyData);
        setAllSubmissions(bountyData.submissions?.items || []);

        if (address) {
          setIsCreator(
            bountyData.creator?.toLowerCase() === address.toLowerCase(),
          );

          const enrolled = await checkUserEnrollment(address, id);
          if (!cancelled)
            setEnrollmentStatus(enrolled ? "enrolled" : "not-enrolled");

          await checkUserSubmission(address, id);
          await loadWinnersData(id);
        } else {
          setEnrollmentStatus("not-enrolled");
        }

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
  }, [id, address]);

  const submissionLinkError = isValidUrl(submissionLink);

  const handleEnroll = async () => {
    if (!address) return showToast.error("Please connect your wallet");

    setIsEnrolling(true);
    const toastId = showToast.loading("Enrolling in bounty...");

    try {
      await axios.post(`${API_URL}/user/enrollment`, {
        bountyId: id,
        user: address,
      });

      showToast.success("Successfully enrolled!", { id: toastId });
      setIsEnrolled(true);
      setEnrollmentStatus("enrolled");
    } catch (error) {
      const alreadyEnrolled =
        error.response?.status === 400 &&
        error.response.data?.error?.toLowerCase().includes("already");

      if (alreadyEnrolled) {
        setIsEnrolled(true);
        setEnrollmentStatus("enrolled");
        showToast.success("You're already enrolled", { id: toastId });
      } else {
        showToast.error(
          error.response?.data?.error || "Enrollment failed",
          { id: toastId },
        );
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageSizeWarning("Please select a valid image file.");
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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!address) return showToast.error("Please connect your wallet");
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
      formData.append("user", address);
      formData.append("description", submissionDescription.trim());
      formData.append("projectLink", submissionLink.trim());

      if (submissionImage) {
        const compressed = await compressImage(submissionImage);
        formData.append("image", compressed);
      }

      const { data } = await axios.post(`${API_URL}/bounty/submit`, formData, {
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

      setShowSubmitModal(false);
      resetSubmissionForm();
    } catch (error) {
      showToast.error(
        error.response?.data?.error || "Failed to submit your work",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimReward = async () => {
    if (!address) return showToast.error("Please connect your wallet");
    if (blockchainId === null) return showToast.error("This bounty is not on-chain");

    if (Number(currentChainId) !== Number(bounty.network)) {
      try {
        await switchChainAsync({ chainId: Number(bounty.network) });
      } catch {
        return showToast.error("Please switch network manually in your wallet");
      }
    }

    if (!onChainClaimable || onChainClaimable === 0n)
      return showToast.error("No reward available");
    if (onChainClaimed)
      return showToast.error("This reward has already been claimed");

    try {
      const { hash } = await claimReward(blockchainId);

      await axios.post(`${API_URL}/bounty/${id}/claim`, {
        winnerAddress: address,
        txHash: hash,
      });

      showToast.success("Reward claimed successfully!");
      await loadWinnersData(id);
      await refetchClaimable();
    } catch (error) {
      showToast.error(error.shortMessage || error.message || "Claim failed");
    }
  };

  const handleDistributeReward = async () => {
    const valid = winnerAddresses.map((value) => value.trim());

    if (
      !valid.length ||
      valid.some((value) => !/^0x[a-fA-F0-9]{40}$/.test(value)) ||
      new Set(valid.map((value) => value.toLowerCase())).size !== valid.length
    ) {
      return showToast.error(
        "Enter unique, valid wallet addresses for all winners",
      );
    }

    if (blockchainId === null)
      return showToast.error("This bounty is not on-chain");

    if (Number(currentChainId) !== Number(bounty.network)) {
      try {
        await switchChainAsync({ chainId: Number(bounty.network) });
      } catch {
        return showToast.error("Please switch network manually in your wallet");
      }
    }

    setDistributing(true);
    const toastId = showToast.loading("Distributing rewards...");

    try {
      let tx;

      if (valid.length === 1) {
        tx = await assignSingleWinner(blockchainId, valid[0]);
      } else {
        const percentages =
          bounty.payoutType === "MULTI_PERCENTAGE"
            ? bounty.percentages
            : [];

        tx = await assignMultipleWinners(
          blockchainId,
          valid,
          percentages,
        );
      }

      const bountyContract = getBountyContract(bounty.network);
      if (!bountyContract)
        throw new Error(`Bounty contract not configured for chain ${bounty.network}`);

      await axios.post(`${API_URL}/bounty/${id}/distribute`, {
        txHash: tx.hash,
        blockchainId,
        chainId: Number(bounty.network),
        bountyContract,
      });

      showToast.success("Rewards distributed successfully!", { id: toastId });
      setSelectedWinners([]);
      setShowDistributeModal(false);
      await loadWinnersData(id);
    } catch (error) {
      showToast.error(
        error.shortMessage || error.message || "Distribution failed",
        { id: toastId },
      );
    } finally {
      setDistributing(false);
    }
  };

  const toggleWinnerSelection = (submission) => {
    const addr = submission.user.toLowerCase();

    setSelectedWinners((previous) => {
      if (previous.some((item) => item.address === addr)) {
        return previous.filter((item) => item.address !== addr);
      }

      if (bounty.payoutType === "SINGLE") {
        return [{ address: addr, submissionId: submission._id }];
      }

      if (previous.length >= bounty.winnersAllowed) {
        showToast.error(
          `You can select up to ${bounty.winnersAllowed} winners`,
        );
        return previous;
      }

      return [...previous, { address: addr, submissionId: submission._id }];
    });
  };

  const isSelected = (addr) =>
    selectedWinners.some(
      (item) => item.address === addr?.toLowerCase(),
    );

  const hasEnoughSelections = () =>
    selectedWinners.length === 0 ||
    selectedWinners.length ===
      (bounty?.payoutType === "SINGLE" ? 1 : bounty?.winnersAllowed);

  const openDistributeModal = () => {
    if (selectedWinners.length) {
      setWinnerAddresses(selectedWinners.map((item) => item.address));
    } else {
      const count = bounty?.payoutType === "SINGLE"
        ? 1
        : bounty?.winnersAllowed || 1;
      setWinnerAddresses(Array(count).fill(""));
    }

    setShowDistributeModal(true);
  };

  const handleAddComment = async () => {
    if (!address) return showToast.error("Please connect your wallet");
    if (!newComment.trim()) return showToast.error("Write a comment first");

    setCommentSubmitting(true);

    try {
      const { data } = await axios.post(`${API_URL}/comments/add/${id}`, {
        user: address,
        text: newComment.trim(),
      });

      setComments((previous) => [data.comment, ...previous]);
      setNewComment("");
      showToast.success("Comment added");
    } catch (error) {
      showToast.error(error.response?.data?.error || "Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const winnerAddressesSet = new Set(
    [...(winnersData?.winners || []), ...(winnersData?.claimed || [])]
      .map((winner) => winner.address?.toLowerCase())
      .filter(Boolean),
  );

  const canClaim = () => {
    if (isCreator || hasUserClaimedOffChain) return false;
    if (blockchainId !== null) {
      return Boolean(
        onChainClaimable &&
        onChainClaimable > 0n &&
        !onChainClaimed,
      );
    }

    return Number(offChainClaimable) > 0;
  };

  const canDistribute = () => {
    if (!isCreator || !bounty?.deadline || winnersData?.isDistributed)
      return false;

    return new Date(bounty.deadline).getTime() < Date.now();
  };

  const displayClaimable = () => {
    if (blockchainId !== null && onChainClaimable !== undefined)
      return formatAmount(formatEther(onChainClaimable));

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
    active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    upcoming: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    ended: "border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60",
    completed: "border-[#00D6A0]/30 bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]",
    cancelled: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
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
            <button onClick={() => navigate("/dashboard")} className={`${primaryButton} mt-6`}>
              <FiArrowLeft size={16} /> Back to dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const networkName =
    supportedChains.find((chain) => chain.id === Number(bounty.network))?.name ||
    `Chain ${bounty.network}`;

  const token =
    bounty.token || getNativeToken(bounty.network)?.symbol || "Token";

  const deadlinePassed =
    bounty.deadline &&
    new Date(bounty.deadline).getTime() <= Date.now();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f4] dark:bg-[#080b09] text-[#171b18] dark:text-white transition-colors duration-300">
      <NavBar />

      <main className="relative flex-grow px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-gradient-to-b from-[#00D6A0]/[0.07] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-7 flex items-center justify-between gap-3">
            <button onClick={handleGoBack} className={`${secondaryButton} !px-4 !py-2.5`}>
              <FiArrowLeft size={16} /> Back
            </button>
            <span className="rounded-full border border-[#dfe3dc] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#737c74] dark:text-white/45">
              Bounty #{id}
            </span>
          </div>

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
                    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[bounty.status] || statusStyles.ended}`}>
                      {bounty.status || "Unknown"}
                    </span>
                  </div>

                  <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
                    {bounty.title}
                  </h1>

                  {/* Bordered bounty description */}
                  <div className="mt-5 rounded-2xl border border-[#dfe5df] bg-[#f8faf7] p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.025]">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                      About this bounty
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#515b52] dark:text-white/70 sm:text-base">
                      {showFullDescription
                        ? bounty.description || "No description provided."
                        : (bounty.description || "No description provided.").length > 280
                          ? `${bounty.description.slice(0, 280).trimEnd()}…`
                          : bounty.description || "No description provided."}
                    </p>
                  </div>

                  {(bounty.description || "").length > 280 && (
                    <button
                      onClick={() => setShowFullDescription((previous) => !previous)}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#008a66] hover:text-[#00a87d] dark:text-[#00D6A0]"
                      aria-expanded={showFullDescription}
                    >
                      {showFullDescription ? "Show less" : "Read full description"}
                      {showFullDescription ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                    </button>
                  )}

                  {bounty.tags?.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {bounty.tags.map((tag, index) => (
                        <span key={`${tag}-${index}`} className="rounded-lg border border-[#e0e5df] dark:border-white/10 bg-[#f7f9f6] dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#69736a] dark:text-white/65">
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

                    <div className="rounded-2xl border border-[#e0e5df] dark:border-white/10 bg-[#fafbf9] dark:bg-[#141814] p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66736a] dark:text-white/50">
                          <FiCalendar className="text-[#008a66] dark:text-[#00D6A0]" />
                          Deadline
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${deadlinePassed ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300" : "bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]"}`}>
                          {deadlinePassed ? "Closed" : timeRemaining ? "Time left" : "Deadline"}
                        </span>
                      </div>

                      <p className="mt-3 text-2xl font-bold">
                        {formatDate(bounty.deadline)}
                      </p>

                      {timeRemaining ? (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {[
                            ["Days", timeRemaining.days],
                            ["Hours", timeRemaining.hours],
                            ["Mins", timeRemaining.minutes],
                            ["Secs", timeRemaining.seconds],
                          ].map(([label, value]) => (
                            <div key={label} className="min-w-0 rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#0e110e] p-2 text-center">
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
                          {deadlinePassed ? "The submission deadline has passed." : "No active countdown available."}
                        </p>
                      )}
                    </div>
                  </div>

                  {(bounty.status === "completed" || bounty.status === "ended") && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dfe5dd] dark:border-white/10 bg-[#f7f9f6] dark:bg-white/[0.03] p-4">
                      <FiInfo className="mt-0.5 shrink-0 text-[#008a66] dark:text-[#00D6A0]" size={18} />
                      <div>
                        <p className="text-sm font-bold">
                          {bounty.status === "completed" ? "Bounty completed" : "Submission period ended"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#727c73] dark:text-white/50">
                          {bounty.status === "completed"
                            ? "The creator has completed the winner selection process."
                            : "The submission period has closed. Check the reward distribution status below."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bordered bounty metadata cards */}
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
                          <FiTag className="shrink-0 text-[#008a66] dark:text-[#00D6A0]" size={15} />
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

                      {bounty.originLink && (
                        <div className="min-w-0 rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025] sm:col-span-2">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                            Project resources
                          </p>
                          <a href={bounty.originLink} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 text-sm font-semibold text-[#008a66] hover:underline dark:text-[#00D6A0]">
                            <FiGlobe size={15} className="shrink-0" />
                            <span className="break-all">{getHostname(bounty.originLink)}</span>
                            <FiExternalLink size={13} className="shrink-0" />
                          </a>
                        </div>
                      )}

                      {bounty.txHash && (
                        <div className="min-w-0 rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                            Transaction
                          </p>
                          <a href={getExplorerUrl(bounty.network, bounty.txHash, "tx") || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 break-all font-mono text-xs text-[#008a66] hover:underline dark:text-[#00D6A0]">
                            {shortenAddress(bounty.txHash)} <FiExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {bounty.bountyContract && (
                        <div className="min-w-0 rounded-xl border border-[#dfe5df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">
                            Contract
                          </p>
                          <a href={getExplorerUrl(bounty.network, bounty.bountyContract, "address") || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 break-all font-mono text-xs text-[#008a66] hover:underline dark:text-[#00D6A0]">
                            {shortenAddress(bounty.bountyContract)} <FiExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-3 border-t border-[#e5e9e3] dark:border-white/[0.08] pt-6 sm:flex-row sm:flex-wrap">
                    {!address && bounty.status === "active" && (
                      <p className="w-full rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-[#f7f9f6] dark:bg-white/[0.03] px-4 py-3 text-sm text-[#6d776e] dark:text-white/55">
                        Connect your wallet to participate in this bounty.
                      </p>
                    )}

                    {!isCreator && address && bounty.status === "active" && (
                      <>
                        {enrollmentStatus === "checking" && (
                          <div className="rounded-xl border border-[#dfe5dd] dark:border-white/10 px-4 py-3 text-sm text-[#7a837a] dark:text-white/50">
                            Checking enrollment...
                          </div>
                        )}

                        {enrollmentStatus === "not-enrolled" && (
                          <button onClick={handleEnroll} disabled={isEnrolling} className={`${primaryButton} w-full sm:w-auto`}>
                            <FiZap size={16} />
                            {isEnrolling ? "Enrolling..." : "Start task"}
                          </button>
                        )}

                        {enrollmentStatus === "enrolled" && !hasUserSubmitted && (
                          <button onClick={() => setShowSubmitModal(true)} className={`${primaryButton} w-full sm:w-auto`}>
                            <FiSend size={16} /> Submit your work
                          </button>
                        )}

                        {enrollmentStatus === "enrolled" && hasUserSubmitted && (
                          <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/10 px-4 py-3 text-sm font-semibold text-[#008a66] dark:text-[#00D6A0]">
                            <FiCheckCircle /> Submission received
                          </span>
                        )}
                      </>
                    )}

                    {canClaim() && (
                      <button onClick={handleClaimReward} disabled={isContractPending || isContractConfirming} className={`${primaryButton} w-full sm:w-auto`}>
                        <FiAward size={16} />
                        {isContractPending ? "Confirm in wallet..." : isContractConfirming ? "Confirming..." : `Claim ${displayClaimable()} ${token}`}
                      </button>
                    )}

                    {canDistribute() && (
                      <button onClick={openDistributeModal} disabled={!hasEnoughSelections()} className={`${primaryButton} w-full sm:w-auto`}>
                        <FiUsers size={16} />
                        Distribute rewards
                        {selectedWinners.length > 0 && ` (${selectedWinners.length})`}
                      </button>
                    )}
                  </div>

                  {isCreator && !winnersData?.isDistributed && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dfe5dd] dark:border-white/10 bg-[#f8faf7] dark:bg-white/[0.025] p-4">
                      <FiInfo size={17} className="mt-0.5 shrink-0 text-[#008a66] dark:text-[#00D6A0]" />
                      <div>
                        <p className="text-sm font-semibold">Reward distribution</p>
                        <p className="mt-1 text-xs leading-5 text-[#727c73] dark:text-white/50">
                          {deadlinePassed
                            ? "The deadline has passed. Review the submissions below and select your winners to distribute the reward."
                            : `Winner selection unlocks after the deadline${bounty.deadline ? ` on ${formatDate(bounty.deadline)}` : ""}.`}
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
                        <p className="mt-1 text-xs text-[#778077] dark:text-white/45">Your work and proof of completion</p>
                      </div>
                      <span className="rounded-full border border-[#dfe5dd] dark:border-white/10 px-3 py-1.5 text-xs font-semibold">
                        {userSubmission.status === "accepted" ? "Accepted" : userSubmission.status === "rejected" ? "Not selected" : "Pending review"}
                      </span>
                    </div>

                    {/* Bordered description for the current user's submission */}
                    <div className="rounded-xl border border-[#dfe5df] bg-white p-4 dark:border-white/10 dark:bg-black/10">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                        Work description
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#515b52] dark:text-white/70">
                        {userSubmission.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {userSubmission.projectLink && (
                        <a href={userSubmission.projectLink} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} min-w-0 justify-start`}>
                          <FiLink className="shrink-0 text-[#008a66] dark:text-[#00D6A0]" />
                          <span className="truncate">{getHostname(userSubmission.projectLink)}</span>
                          <FiExternalLink className="shrink-0" />
                        </a>
                      )}
                      {userSubmission.image && (
                        <a href={userSubmission.image} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} justify-start`}>
                          <FiExternalLink className="text-[#008a66] dark:text-[#00D6A0]" />
                          View submission image
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {winnersData?.isDistributed && winnersData.winners?.length > 0 && (
                <section className={cardClass}>
                  <div className="p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]">
                        <FiAward size={21} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">Rewards distributed</h2>
                        <p className="mt-1 text-xs text-[#778077] dark:text-white/45">Winner and claim status</p>
                      </div>
                    </div>

                    <div className="divide-y divide-[#e5e9e3] dark:divide-white/[0.08]">
                      {winnersData.winners.map((winner, index) => {
                        const current = address?.toLowerCase() === winner.address?.toLowerCase();
                        const claimed = winnersData.claimed?.some((item) => item.address?.toLowerCase() === winner.address?.toLowerCase());

                        return (
                          <div key={`${winner.address}-${index}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-[#f8faf7] dark:bg-white/[0.03] text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-mono text-sm font-semibold">{shortenAddress(winner.address)}</p>
                                <p className="mt-1 text-xs text-[#778077] dark:text-white/45">{current ? "Your wallet" : "Winner"}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-bold text-[#008a66] dark:text-[#00D6A0]">{formatAmount(winner.amount)} {token}</span>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${claimed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-[#00D6A0]/10 text-[#008a66] dark:text-[#00D6A0]"}`}>
                                {claimed ? <FiCheck size={13} /> : <FiClock size={13} />}
                                {claimed ? "Claimed" : current ? "Ready to claim" : "Awaiting claim"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {allSubmissions.length > 0 && (
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
                          {isCreator ? "Review submitted work and choose your winners." : "Work submitted by bounty participants."}
                        </p>
                      </div>

                      {isCreator && selectedWinners.length > 0 && (
                        <span className="w-fit rounded-full border border-[#00D6A0]/25 bg-[#00D6A0]/10 px-3 py-1.5 text-xs font-bold text-[#008a66] dark:text-[#00D6A0]">
                          {selectedWinners.length} / {bounty.payoutType === "SINGLE" ? 1 : bounty.winnersAllowed} selected
                        </span>
                      )}
                    </div>

                    {isCreator && selectedWinners.length > 0 && bounty.payoutType === "MULTI_PERCENTAGE" && bounty.percentages?.length > 0 && (
                      <div className="mb-5 rounded-xl border border-[#dfe5dd] dark:border-white/10 bg-[#f8faf7] dark:bg-white/[0.025] p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7c867d] dark:text-white/45">Payout order</p>
                        <div className="space-y-2">
                          {selectedWinners.map((winner, index) => (
                            <div key={winner.address} className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-mono text-[#606b61] dark:text-white/65">{index + 1}. {shortenAddress(winner.address)}</span>
                              <span className="font-bold text-[#008a66] dark:text-[#00D6A0]">{bounty.percentages[index]}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {allSubmissions.map((submission) => {
                        const selected = isCreator && isSelected(submission.user);
                        const winner = winnerAddressesSet.has(submission.user?.toLowerCase());
                        const selectionIndex = selectedWinners.findIndex((item) => item.address === submission.user?.toLowerCase());
                        const current = address?.toLowerCase() === submission.user?.toLowerCase();

                        return (
                          <article key={submission._id} className={`min-w-0 rounded-2xl border p-4 transition-colors ${selected ? "border-[#00D6A0]/60 bg-[#00D6A0]/[0.06]" : "border-[#e2e7e0] dark:border-white/10 bg-[#fafbf9] dark:bg-[#141814] hover:border-[#00D6A0]/35"}`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-bold">{shortenAddress(submission.user)}</span>
                              {winner && <span className="rounded-full bg-[#00D6A0]/10 px-2 py-1 text-[10px] font-bold text-[#008a66] dark:text-[#00D6A0]">WINNER</span>}
                              {current && <span className="rounded-full border border-[#dfe5dd] dark:border-white/10 px-2 py-1 text-[10px] font-bold">YOU</span>}
                              {selected && <span className="rounded-full bg-[#00D6A0]/10 px-2 py-1 text-[10px] font-bold text-[#008a66] dark:text-[#00D6A0]">#{selectionIndex + 1}</span>}
                            </div>

                            <p className="mt-2 text-xs text-[#899189] dark:text-white/40">{formatDateTime(submission.submittedAt)}</p>

                            {isCreator && (
                              <>
                                {/* Bordered work description for each participant */}
                                <div className="mt-4 rounded-xl border border-[#dfe5df] bg-white p-4 dark:border-white/10 dark:bg-black/10">
                                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#008a66] dark:text-[#00D6A0]">
                                    Work description
                                  </p>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#515b52] dark:text-white/70">
                                    {submission.description || "No description provided."}
                                  </p>
                                </div>

                                {(submission.projectLink || submission.image) && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {submission.projectLink && (
                                      <a href={submission.projectLink} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} min-w-0 flex-1 !px-3 !py-2.5`}>
                                        <FiLink className="shrink-0" />
                                        <span className="truncate">{getHostname(submission.projectLink)}</span>
                                        <FiExternalLink className="shrink-0" />
                                      </a>
                                    )}
                                    {submission.image && (
                                      <a href={submission.image} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} !px-3 !py-2.5`}>
                                        <FiExternalLink /> View image
                                      </a>
                                    )}
                                  </div>
                                )}

                                <div className="mt-4 border-t border-[#e2e7e0] dark:border-white/10 pt-3">
                                  <button
                                    onClick={() => toggleWinnerSelection(submission)}
                                    disabled={Boolean(winner) || Boolean(winnersData?.isDistributed)}
                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "bg-[#00D6A0] text-[#06271e]" : "border border-[#dfe3dc] dark:border-white/10 bg-white dark:bg-[#101310] hover:border-[#00D6A0] hover:text-[#008a66] dark:hover:text-[#00D6A0]"}`}
                                  >
                                    {winner ? "Already a winner" : selected ? <><FiCheck className="mr-1 inline" /> Selected as winner</> : "Select winner"}
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
                        <button onClick={() => setSelectedWinners([])} className="text-sm font-semibold text-[#778077] hover:text-red-500">
                          Clear selection
                        </button>
                        {canDistribute() && (
                          <button onClick={openDistributeModal} className={primaryButton}>
                            <FiAward /> Continue to distribution
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
                      <p className="mt-1 text-xs text-[#778077] dark:text-white/45">Ask questions and share useful information</p>
                    </div>
                  </div>

                  <div className="mb-5 max-h-96 space-y-3 overflow-y-auto">
                    {comments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#dfe5dd] dark:border-white/10 py-8 text-center">
                        <FiMessageCircle className="mx-auto mb-3 text-[#a2aba2]" size={23} />
                        <p className="text-sm font-semibold">Start the conversation</p>
                        <p className="mt-1 text-xs text-[#899189] dark:text-white/40">No comments yet.</p>
                      </div>
                    ) : comments.map((comment) => (
                      <div key={comment._id || comment.id} className="rounded-xl border border-[#e2e7e0] dark:border-white/10 bg-[#fafbf9] dark:bg-[#141814] p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#008a66] dark:text-[#00D6A0]">{shortenAddress(comment.user)}</span>
                          <span className="text-[10px] text-[#899189] dark:text-white/40">{formatDateTime(comment.createdAt || comment.timestamp)}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#566057] dark:text-white/70">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(event) => { event.preventDefault(); handleAddComment(); }} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder={address ? "Write a comment..." : "Connect your wallet to comment"}
                      disabled={!address || commentSubmitting}
                      className={inputClass}
                    />
                    <button type="submit" disabled={!address || !newComment.trim() || commentSubmitting} className={`${primaryButton} sm:shrink-0`}>
                      <FiSend size={15} /> {commentSubmitting ? "Sending..." : "Comment"}
                    </button>
                  </form>
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <section className={cardClass}>
                <div className="border-b border-[#e5e9e3] dark:border-white/[0.08] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#899189] dark:text-white/40">Bounty overview</p>
                  <h2 className="mt-2 text-lg font-bold">At a glance</h2>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">Status</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[bounty.status] || statusStyles.ended}`}>{bounty.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">Network</span>
                    <span className="text-right text-sm font-semibold">{networkName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">Category</span>
                    <span className="text-right text-sm font-semibold">{bounty.category || "General"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[#778077] dark:text-white/50">Payout</span>
                    <span className="text-right text-sm font-semibold">{bounty.payoutType === "SINGLE" ? "Single winner" : bounty.payoutType === "MULTI_EQUAL" ? "Equal split" : bounty.payoutType === "MULTI_PERCENTAGE" ? "Custom split" : "Not specified"}</span>
                  </div>

                  <div className="border-t border-[#e5e9e3] dark:border-white/[0.08] pt-4">
                    <p className="text-xs text-[#778077] dark:text-white/50">Total reward</p>
                    <p className="mt-1 break-words text-2xl font-extrabold text-[#008a66] dark:text-[#00D6A0]">{formatAmount(bounty.reward)} <span className="text-sm">{token}</span></p>
                  </div>

                  {bounty.originLink && (
                    <a href={bounty.originLink} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} w-full`}>
                      <FiGlobe size={16} /> Visit project <FiExternalLink size={13} />
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
                    Complete the task, submit your proof, and get rewarded when your work is approved.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {showSubmitModal && (
        <div className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => { setShowSubmitModal(false); resetSubmissionForm(); }}>
          <div className="app-modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#101310] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#e5e9e3] dark:border-white/[0.08] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-extrabold">Submit your work</h2>
                <p className="mt-1 text-sm text-[#778077] dark:text-white/50">Share your completed task and proof.</p>
              </div>
              <button type="button" aria-label="Close modal" onClick={() => { setShowSubmitModal(false); resetSubmissionForm(); }} className={`${secondaryButton} !h-9 !w-9 !p-0`}>
                <FiX size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">Screenshot or image proof <span className="font-normal normal-case">(optional, max 5MB)</span></label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd8ce] dark:border-white/15 bg-[#f8faf7] dark:bg-white/[0.025] px-4 py-6 text-center transition hover:border-[#00D6A0]">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Submission preview" className="max-h-44 max-w-full rounded-xl object-contain" />
                  ) : (
                    <>
                      <FiUploadCloud size={27} className="mb-3 text-[#008a66] dark:text-[#00D6A0]" />
                      <span className="text-sm font-semibold">Choose an image</span>
                      <span className="mt-1 text-xs text-[#899189] dark:text-white/40">PNG, JPG, or another supported image format</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                </label>
                {imagePreview && (
                  <button type="button" onClick={() => { setSubmissionImage(null); setImagePreview(null); setImageSizeWarning(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="mt-2 text-xs font-semibold text-red-500">Remove image</button>
                )}
                {imageSizeWarning && <p className="mt-2 text-xs text-red-500">{imageSizeWarning}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">What did you complete?</label>
                <textarea value={submissionDescription} onChange={(event) => setSubmissionDescription(event.target.value)} placeholder="Describe the work you completed..." rows={5} maxLength={5000} required className={`${inputClass} resize-y leading-6`} />
                <p className="mt-1 text-right text-[10px] text-[#899189] dark:text-white/40">{submissionDescription.length}/5000</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">Proof link</label>
                <input type="url" value={submissionLink} onChange={(event) => setSubmissionLink(event.target.value)} placeholder="https://github.com/..." required className={`${inputClass} ${submissionLinkError && submissionLink ? "!border-red-400" : ""}`} />
                {submissionLinkError && submissionLink.length > 0 && <p className="mt-2 text-xs text-red-500">{submissionLinkError}</p>}
              </div>

              <button type="submit" disabled={submitting || Boolean(imageSizeWarning)} className={`${primaryButton} w-full`}>
                {submitting ? "Submitting..." : <><FiSend size={16} /> Submit for review</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDistributeModal && bounty && (
        <div className="app-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => !distributing && setShowDistributeModal(false)}>
          <div className="app-modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe5dd] dark:border-white/10 bg-white dark:bg-[#101310] shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#e5e9e3] dark:border-white/[0.08] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-extrabold">Distribute rewards</h2>
                <p className="mt-1 text-sm text-[#778077] dark:text-white/50">Confirm the selected winner addresses.</p>
              </div>
              <button type="button" disabled={distributing} onClick={() => setShowDistributeModal(false)} className={`${secondaryButton} !h-9 !w-9 !p-0`}>
                <FiX size={17} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4">
                <p className="text-xs text-[#778077] dark:text-white/50">Bounty</p>
                <p className="mt-1 break-words font-bold">{bounty.title}</p>
                <p className="mt-3 text-xs text-[#778077] dark:text-white/50">Total reward</p>
                <p className="mt-1 text-2xl font-extrabold text-[#008a66] dark:text-[#00D6A0]">{formatAmount(bounty.reward)} {token}</p>
              </div>

              <div className="mt-5 space-y-4">
                {winnerAddresses.map((addr, index) => {
                  let amount = Number(bounty.reward) || 0;

                  if (bounty.payoutType === "MULTI_EQUAL") {
                    amount /= Number(bounty.winnersAllowed) || 1;
                  } else if (bounty.payoutType === "MULTI_PERCENTAGE") {
                    amount = amount * (Number(bounty.percentages?.[index]) || 0) / 100;
                  }

                  return (
                    <div key={index}>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#737c74] dark:text-white/50">Winner {index + 1} wallet</label>
                      <input type="text" value={addr} onChange={(event) => setWinnerAddresses((previous) => previous.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} placeholder="0x..." className={inputClass} />
                      <p className="mt-2 text-xs text-[#008a66] dark:text-[#00D6A0]">Estimated allocation: {formatAmount(amount)} {token}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button disabled={distributing} onClick={() => setShowDistributeModal(false)} className={`${secondaryButton} flex-1`}>Cancel</button>
                <button disabled={distributing || isContractPending || isContractConfirming} onClick={handleDistributeReward} className={`${primaryButton} flex-1`}>
                  {distributing || isContractPending || isContractConfirming ? "Processing..." : <><FiShield size={16} /> Confirm distribution</>}
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#899189] dark:text-white/40">
                Confirming this action may require a wallet transaction. Check every address before approving it.
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
