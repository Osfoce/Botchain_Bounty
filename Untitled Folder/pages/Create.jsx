
import { useState, useEffect, useMemo } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../components/UI/Toast";
import NavBar from "../components/Layout/NavBar";
import Footer from "../components/Layout/Footer";
import axios from "axios";

import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiCheck,
  FiCheckCircle,
  FiDollarSign,
  FiGlobe,
  FiInfo,
  FiShield,
  FiTag,
  FiUsers,
  FiX,
  FiZap,
  FiCalendar,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";

import {
  BOUNTY_CATEGORIES,
  TAGS_BY_CATEGORY,
  DEFAULT_TAGS,
} from "../constants/categories";
import { supportedChains } from "../rainbowChains";
import { useBounty } from "../hooks/useBounty";
import { listTokensForChain } from "../utils/enums";
import { formatAmount } from "../utils/format";
import {
  getBountyContract,
  getNativeToken,
} from "../utils/chains.address";

const STEPS = [
  { id: 1, label: "Network", description: "Choose your network", icon: FiGlobe },
  { id: 2, label: "Details", description: "Describe the task", icon: FiFileText },
  { id: 3, label: "Reward", description: "Set the payout", icon: FiDollarSign },
  { id: 4, label: "Review", description: "Confirm everything", icon: FiCheckCircle },
];

function Create() {
  const API_URL = import.meta.env.VITE_API_URL;
  const totalSteps = STEPS.length;
  const navigate = useNavigate();

  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const {
    createBounty,
    fetchBountyIdFromTx,
    isPending: isContractPending,
    isConfirming,
  } = useBounty();

  const [currentStep, setCurrentStep] = useState(1);
  const [customTag, setCustomTag] = useState("");
  const [percentageInput, setPercentageInput] = useState("");
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const [showScrollTop, setShowScrollTop] = useState(false);

  const [multipleWinner, setMultipleWinner] = useState(false);
  const [selectedPayoutType, setSelectedPayoutType] = useState("MULTI_EQUAL");
  const [winnerCount, setWinnerCount] = useState(2);
  const [percentageArray, setPercentageArray] = useState([]);

  const [showEqualModal, setShowEqualModal] = useState(false);
  const [showPercentModal, setShowPercentModal] = useState(false);
  const [showInfoMenu, setShowInfoMenu] = useState(false);

  const [bountyData, setBountyData] = useState({
    title: "",
    description: "",
    category: "",
    network: supportedChains[0]?.id ?? "",
    tags: [],
    startDate: "",
    deadline: "",
    originLink: "",
    reward: 0,
    token: "",
    winnersAllowed: 1,
    payoutType: "SINGLE",
    percentages: [],
    rewardType: "self-fund",
    creator: "",
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (isConnected && address) {
      setBountyData((prev) => ({ ...prev, creator: address }));
    }
  }, [address, isConnected]);

  const availableTokens = useMemo(() => {
    if (!currentChainId) return [];
    return listTokensForChain(currentChainId);
  }, [currentChainId]);

  const selectedChain = supportedChains.find(
    (chain) => chain.id === Number(bountyData.network),
  );

  const selectedNativeSymbol =
    getNativeToken(bountyData.network)?.symbol || "native token";

  useEffect(() => {
    if (!availableTokens.length) return;

    const valid = availableTokens.some(
      (token) =>
        token.key.toUpperCase() === (bountyData.token || "").toUpperCase() ||
        token.label.toUpperCase() === (bountyData.token || "").toUpperCase(),
    );

    if (!valid) {
      setBountyData((prev) => ({
        ...prev,
        token: availableTokens[0].key,
      }));
    }
  }, [availableTokens, bountyData.token]);

  const updateBountyData = (field, value) => {
    setBountyData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidUrl = (value) => {
    if (!value) return "";

    try {
      const url = new URL(value);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "Only HTTP and HTTPS links are allowed.";
      }

      if (
        !/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*\.[A-Za-z]{2,}$/.test(
          url.hostname,
        )
      ) {
        return "Enter a valid domain, such as github.com.";
      }

      return "";
    } catch {
      return "Enter a full URL, e.g. https://github.com/user/repo";
    }
  };

  const originLinkError = isValidUrl(bountyData.originLink);

  const handleChainChange = async (event) => {
    const chainId = Number(event.target.value);
    updateBountyData("network", chainId);

    if (!switchChainAsync) return;

    try {
      await switchChainAsync({ chainId });
      showToast.success("Network switched!");
    } catch (error) {
      console.warn("Network switch failed:", error);
      showToast.error(
        "Wallet switch rejected. Please switch network manually.",
      );
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!bountyData.network) {
        showToast.error("Please select a network.");
        return false;
      }

      if (!bountyData.category) {
        showToast.error("Please select a category.");
        return false;
      }
    }

    if (step === 2) {
      if (bountyData.title.trim().length < 5) {
        showToast.error("Title must be at least 5 characters.");
        return false;
      }

      if (bountyData.description.trim().length < 20) {
        showToast.error("Description must be at least 20 characters.");
        return false;
      }

      if (!bountyData.tags.length) {
        showToast.error("Please select at least one tag.");
        return false;
      }

      if (!bountyData.startDate || !bountyData.deadline) {
        showToast.error("Please select start and end dates.");
        return false;
      }

      const start = new Date(`${bountyData.startDate}T00:00:00`);
      const end = new Date(`${bountyData.deadline}T00:00:00`);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        showToast.error("Please enter valid dates.");
        return false;
      }

      if (end.getTime() - start.getTime() < 86400000) {
        showToast.error(
          "End date must be at least one day after the start date.",
        );
        return false;
      }

      if (originLinkError) {
        showToast.error(originLinkError);
        return false;
      }
    }

    if (step === 3) {
      if (
        !Number.isFinite(Number(bountyData.reward)) ||
        bountyData.reward <= 0
      ) {
        showToast.error("Please enter a valid reward amount.");
        return false;
      }

      if (!bountyData.token) {
        showToast.error("Please select a reward token.");
        return false;
      }

      if (
        multipleWinner &&
        selectedPayoutType === "MULTI_PERCENTAGE"
      ) {
        if (
          percentageArray.length < 2 ||
          percentageArray.length > 5 ||
          percentageArray.some(
            (percentage) =>
              !Number.isFinite(percentage) ||
              percentage <= 0 ||
              percentage > 100,
          ) ||
          percentageArray.reduce((sum, percentage) => sum + percentage, 0) !== 100
        ) {
          showToast.error(
            "Use 2–5 positive percentages that add up to 100.",
          );
          return false;
        }
      }
    }

    return true;
  };

  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleTag = (tag) => {
    setBountyData((prev) => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter((item) => item !== tag),
        };
      }

      if (prev.tags.length >= 5) {
        showToast.error("You can select a maximum of 5 tags.");
        return prev;
      }

      return { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const addCustomTag = () => {
    const tag = customTag.trim();

    if (!tag) return;

    if (bountyData.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      showToast.error("That tag has already been added.");
      return;
    }

    if (bountyData.tags.length >= 5) {
      showToast.error("You can select a maximum of 5 tags.");
      return;
    }

    setBountyData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));

    setCustomTag("");
  };

  const removeTag = (tag) => {
    setBountyData((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const handleEqualSplitConfirm = () => {
    const count = Number(winnerCount);

    if (!Number.isInteger(count) || count < 2 || count > 5) {
      showToast.error("Choose between 2 and 5 winners.");
      return;
    }

    setWinnerCount(count);
    setSelectedPayoutType("MULTI_EQUAL");
    setPercentageArray([]);
    setPercentageInput("");
    setShowEqualModal(false);
    showToast.success(`${count} winners selected for an equal split.`);
  };

  const handlePresetSelect = (preset) => {
    setPercentageArray(preset);
    setPercentageInput(preset.join(","));
  };

  const handlePercentSplitConfirm = () => {
    const values = percentageInput.split(",").map((value) => value.trim());

    if (
      values.length < 2 ||
      values.length > 5 ||
      values.some((value) => value === "" || !/^\d+$/.test(value))
    ) {
      showToast.error("Enter 2–5 whole-number percentages.");
      return;
    }

    const percentages = values.map(Number);

    if (
      percentages.some((value) => value < 1 || value > 100) ||
      percentages.reduce((sum, value) => sum + value, 0) !== 100
    ) {
      showToast.error("Percentages must be positive and add up to 100.");
      return;
    }

    setPercentageArray(percentages);
    setWinnerCount(percentages.length);
    setSelectedPayoutType("MULTI_PERCENTAGE");
    setShowPercentModal(false);
    showToast.success("Custom winner percentages saved.");
  };

  const fee = Number(bountyData.reward || 0) * 0.07;
  const totalAmount = Number(bountyData.reward || 0) + fee;

  const rewardDisplay = formatAmount(Number(bountyData.reward || 0));
  const feeDisplay = formatAmount(fee);
  const totalAmountDisplay = formatAmount(totalAmount);

  const formatDate = (value) => {
    if (!value) return "Not set";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "Not set";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const minDeadline = bountyData.startDate
    ? (() => {
        const date = new Date(`${bountyData.startDate}T00:00:00`);
        date.setDate(date.getDate() + 1);

        return `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      })()
    : localToday;

  const handleFinalSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      if (!validateStep(1)) setCurrentStep(1);
      else if (!validateStep(2)) setCurrentStep(2);
      else setCurrentStep(3);

      return;
    }

    if (!isConnected || !address) {
      showToast.error("Please connect your wallet.");
      return;
    }

    const selectedChainId = Number(bountyData.network);
    const chain = supportedChains.find(
      (item) => item.id === selectedChainId,
    );

    const contractAddress = getBountyContract(selectedChainId);

    if (
      !contractAddress ||
      contractAddress === "Loading..."
    ) {
      showToast.error(
        `Contract not deployed on ${chain?.name || "the selected network"}.`,
      );
      return;
    }

    if (currentChainId !== selectedChainId) {
      showToast.loading(`Switching to ${chain?.name || "selected network"}...`);

      try {
        await switchChainAsync({ chainId: selectedChainId });
      } catch (error) {
        console.warn("Network switch failed:", error);
        showToast.error("Please switch networks in your wallet and try again.");
        return;
      }
    }

    const finalWinnersAllowed = multipleWinner ? winnerCount : 1;
    const finalPayoutType = multipleWinner
      ? selectedPayoutType
      : "SINGLE";

    const finalPercentages =
      multipleWinner && selectedPayoutType === "MULTI_PERCENTAGE"
        ? percentageArray
        : [];

    const backendData = {
      ...bountyData,
      creator: address,
      network: selectedChainId,
      winnersAllowed: finalWinnersAllowed,
      payoutType: finalPayoutType,
      percentages: finalPercentages,
      status: "upcoming",
    };

    try {
      const { eventData, hash } = await createBounty({
        reward: Number(bountyData.reward),
        token: bountyData.token,
        winnersAllowed: finalWinnersAllowed,
        payoutType: finalPayoutType,
        percentages: finalPercentages,
      });

      let blockchainId =
        eventData?.bountyId != null
          ? Number(eventData.bountyId)
          : null;

      if (blockchainId === null || blockchainId === undefined) {
        blockchainId = await fetchBountyIdFromTx(hash);
      }

      if (
        blockchainId === null ||
        blockchainId === undefined ||
        !Number.isFinite(Number(blockchainId))
      ) {
        showToast.error(
          "The transaction succeeded, but the bounty ID could not be read. Check the block explorer or contact support.",
        );
        return;
      }

      if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        showToast.error("Invalid transaction hash. The bounty cannot be linked.");
        return;
      }

      const response = await axios.post(`${API_URL}/bounty/create`, {
        ...backendData,
        blockchainId,
        txHash: hash,
        isOnChain: true,
        bountyContract: getBountyContract(selectedChainId),
      });

      if (response.status === 201) {
        showToast.success("Bounty created and saved successfully!");
        navigate("/dashboard");
      } else {
        throw new Error("The bounty was created on-chain, but saving failed.");
      }
    } catch (error) {
      console.error("Bounty creation failed:", error);
      showToast.error(
        error.response?.data?.message ||
          error.message ||
          "Bounty creation failed.",
      );
    }
  };

  const isProcessing = isContractPending || isConfirming;

  const page = dark
    ? "bg-[#080B0D] text-white"
    : "bg-[#F5F7F5] text-[#171A18]";

  const card = dark
    ? "border border-white/[0.09] bg-[#101411]"
    : "border border-[#E2E7E1] bg-white";

  const field = dark
    ? "border border-white/10 bg-[#0B0E0C] text-white placeholder:text-white/30 focus:border-[#00D6A0]"
    : "border border-[#DDE3DC] bg-white text-[#171A18] placeholder:text-[#969E95] focus:border-[#00A87D]";

  const muted = dark ? "text-white/55" : "text-[#737B73]";
  const label = dark ? "text-white/70" : "text-[#505950]";
  const divider = dark ? "border-white/10" : "border-[#E7EBE5]";

  const greenText = dark ? "text-[#00D6A0]" : "text-[#008A66]";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-bold text-[#07120D] transition hover:bg-[#32E5B8] disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton = dark
    ? "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-[#00D6A0]/50 hover:text-[#00D6A0]"
    : "inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE3DC] bg-white px-5 py-3 text-sm font-semibold text-[#414941] transition hover:border-[#00A87D] hover:text-[#008A66]";

  const panel = dark
    ? "rounded-2xl border border-white/10 bg-[#0B0E0C] p-5"
    : "rounded-2xl border border-[#E2E7E1] bg-[#F9FBF8] p-5";

  const inputClass =
    `w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#00D6A0]/10 ${field}`;

  const sectionHeading = "text-xl font-bold tracking-tight";
  const smallLabel =
    `mb-2 block text-xs font-bold uppercase tracking-[0.13em] ${label}`;

  const dateInputClass = inputClass;

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 ${page}`}>
      <NavBar dark={dark} setDark={setDark} />

      <main className="relative flex-1 overflow-hidden pb-16 pt-28 sm:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 right-[-100px] h-80 w-80 rounded-full bg-[#00D6A0]/[0.07] blur-[100px]"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                to="/dashboard"
                className={`mb-5 inline-flex items-center gap-2 text-sm font-medium transition ${muted} hover:text-[#00D6A0]`}
              >
                <FiArrowLeft size={16} />
                Back to dashboard
              </Link>

              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D6A0]/10 text-[#00D6A0]">
                  <FiZap size={17} />
                </span>
                <span className={`text-xs font-bold uppercase tracking-[0.2em] ${greenText}`}>
                  Bounty Studio
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Create a bounty<span className={greenText}>.</span>
              </h1>

              <p className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${muted}`}>
                Turn your next idea into an opportunity. Define the task,
                choose the reward, and invite contributors to get involved.
              </p>
            </div>

            <div className={`hidden items-center gap-3 rounded-2xl border px-4 py-3 sm:flex ${divider}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                <FiShield size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold">On-chain creation</p>
                <p className={`mt-0.5 text-xs ${muted}`}>Wallet approval required</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className={`mb-7 rounded-2xl border p-4 sm:p-6 ${card}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${muted}`}>
                  Creation progress
                </p>
                <p className="mt-1 text-sm font-bold">
                  Step {currentStep} of {totalSteps}
                  <span className={`ml-2 font-normal ${muted}`}>
                    · {STEPS[currentStep - 1].description}
                  </span>
                </p>
              </div>
              <span className={`text-sm font-bold ${greenText}`}>
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>

            <div className={`mb-5 h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-[#E8EDE7]"}`}>
              <div
                className="h-full rounded-full bg-[#00D6A0] transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {STEPS.map((step) => {
                const StepIcon = step.icon;
                const active = currentStep === step.id;
                const complete = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                    disabled={step.id >= currentStep}
                    aria-label={`Step ${step.id}: ${step.label}`}
                    aria-current={active ? "step" : undefined}
                    className={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl p-2 text-center transition sm:flex-row sm:items-center sm:justify-start sm:gap-2 sm:p-3 sm:text-left ${
                      active
                        ? "bg-[#00D6A0]/10"
                        : complete
                          ? "opacity-90"
                          : "opacity-50"
                    }`}
                  >
                    {/* Mobile: numbers only */}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition sm:hidden ${
                        active
                          ? "bg-[#00D6A0] text-[#07120D]"
                          : complete
                            ? "border border-[#00D6A0]/40 bg-[#00D6A0]/10 text-[#00D6A0]"
                            : dark
                              ? "border border-white/15 bg-white/[0.03] text-white/60"
                              : "border border-[#DDE3DC] bg-[#F2F5F0] text-[#737B73]"
                      }`}
                    >
                      {step.id}
                    </span>

                    {/* Desktop: original icons */}
                    <span
                      className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition sm:flex sm:h-10 sm:w-10 ${
                        active
                          ? "bg-[#00D6A0] text-[#07120D]"
                          : complete
                            ? "bg-[#00D6A0]/15 text-[#00D6A0]"
                            : dark
                              ? "bg-white/5 text-white/60"
                              : "bg-[#EDF1EB] text-[#737B73]"
                      }`}
                    >
                      {complete ? <FiCheck size={17} /> : <StepIcon size={17} />}
                    </span>

                    {/* Desktop: original step labels */}
                    <span className="hidden min-w-0 sm:block">
                      <span className={`block text-xs uppercase tracking-wider ${muted}`}>
                        Step {step.id}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-bold">
                        {step.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form and summary */}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
            <section className={`min-w-0 overflow-hidden rounded-2xl ${card}`}>
              <div className="h-1 bg-gradient-to-r from-[#00D6A0] via-[#00A87D] to-transparent" />

              <div className="p-5 sm:p-8 lg:p-9">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div>
                    <div className="mb-8 flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                        <FiGlobe size={21} />
                      </span>
                      <div>
                        <h2 className={sectionHeading}>Network & category</h2>
                        <p className={`mt-1 text-sm leading-6 ${muted}`}>
                          Choose where your bounty will live and the kind of work you need.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={smallLabel}>Blockchain network *</label>
                        <select
                          value={bountyData.network}
                          onChange={handleChainChange}
                          className={inputClass}
                        >
                          {supportedChains.map((chain) => (
                            <option key={chain.id} value={chain.id}>
                              {chain.name} ({chain.nativeCurrency?.symbol || "NATIVE"})
                            </option>
                          ))}
                        </select>
                        <p className={`mt-2 text-xs ${muted}`}>
                          Selected network: {selectedChain?.name || "Not selected"}
                        </p>
                      </div>

                      <div>
                        <label className={smallLabel}>Bounty category *</label>
                        <select
                          value={bountyData.category}
                          onChange={(event) => {
                            updateBountyData("category", event.target.value);
                            updateBountyData("tags", []);
                            setCustomTag("");
                          }}
                          className={inputClass}
                        >
                          <option value="">Select a category</option>
                          {BOUNTY_CATEGORIES.map(({ group, values }) => (
                            <optgroup key={group} label={group}>
                              {values.map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className={panel}>
                        <div className="flex items-start gap-3">
                          <FiInfo className={`mt-0.5 shrink-0 ${greenText}`} size={18} />
                          <div>
                            <p className="text-sm font-semibold">Before you continue</p>
                            <p className={`mt-1 text-xs leading-5 ${muted}`}>
                              Your wallet must support the selected network. Gas fees are paid
                              separately from the bounty reward, according to your wallet and
                              network.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div>
                    <div className="mb-8 flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                        <FiFileText size={21} />
                      </span>
                      <div>
                        <h2 className={sectionHeading}>Task details</h2>
                        <p className={`mt-1 text-sm leading-6 ${muted}`}>
                          Explain the work clearly so contributors know exactly what to deliver.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={smallLabel}>Bounty title *</label>
                        <input
                          value={bountyData.title}
                          maxLength={120}
                          onChange={(event) => updateBountyData("title", event.target.value)}
                          className={inputClass}
                          placeholder="e.g. Build a DeFi analytics dashboard"
                        />
                        <div className={`mt-1.5 text-right text-xs ${muted}`}>
                          {bountyData.title.length}/120
                        </div>
                      </div>

                      <div>
                        <label className={smallLabel}>Description *</label>
                        <textarea
                          value={bountyData.description}
                          maxLength={5000}
                          onChange={(event) => updateBountyData("description", event.target.value)}
                          className={`${inputClass} min-h-44 resize-y leading-6`}
                          placeholder="Describe the task, requirements, expected deliverables, and how the submission will be evaluated."
                        />
                        <div className={`mt-1.5 flex justify-between text-xs ${muted}`}>
                          <span>Minimum 20 characters</span>
                          <span>{bountyData.description.length}/5000</span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label className={smallLabel}>Tags *</label>
                          <span className={`text-xs ${muted}`}>
                            {bountyData.tags.length}/5 selected
                          </span>
                        </div>

                        {!bountyData.category ? (
                          <p className={`text-sm ${muted}`}>
                            Choose a category in Step 1 to see relevant tags.
                          </p>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {(TAGS_BY_CATEGORY[bountyData.category] || DEFAULT_TAGS).map((tag) => {
                                const selected = bountyData.tags.includes(tag);

                                return (
                                  <button
                                    type="button"
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                                      selected
                                        ? "border-[#00D6A0]/50 bg-[#00D6A0]/10 text-[#00D6A0]"
                                        : dark
                                          ? "border-white/10 bg-white/[0.02] text-white/65 hover:border-[#00D6A0]/50"
                                          : "border-[#DDE3DC] bg-white text-[#5B645B] hover:border-[#00A87D]"
                                    }`}
                                  >
                                    {selected && <span className="mr-1">✓</span>}
                                    {tag}
                                  </button>
                                );
                              })}
                            </div>

                            {bountyData.category === "Other" && (
                              <div className="mt-4 flex gap-2">
                                <input
                                  value={customTag}
                                  maxLength={24}
                                  onChange={(event) => setCustomTag(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      addCustomTag();
                                    }
                                  }}
                                  className={inputClass}
                                  placeholder="Add a custom tag"
                                />
                                <button
                                  type="button"
                                  onClick={addCustomTag}
                                  disabled={!customTag.trim() || bountyData.tags.length >= 5}
                                  className={primaryButton}
                                >
                                  Add
                                </button>
                              </div>
                            )}

                            {bountyData.tags.length > 0 && (
                              <div className="mt-4">
                                <p className={`mb-2 text-xs font-semibold ${muted}`}>
                                  Selected tags
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {bountyData.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-2 rounded-lg border border-[#00D6A0]/25 bg-[#00D6A0]/[0.07] px-3 py-2 text-xs font-medium text-[#00D6A0]"
                                    >
                                      {tag}
                                      <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`Remove ${tag}`}
                                        className="hover:text-white"
                                      >
                                        <FiX size={13} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={smallLabel}>
                            <FiCalendar className="mr-1 inline" size={13} />
                            Start date *
                          </label>
                          <input
                            type="date"
                            value={bountyData.startDate}
                            min={localToday}
                            onChange={(event) => {
                              const value = event.target.value;
                              setBountyData((prev) => ({
                                ...prev,
                                startDate: value,
                                deadline:
                                  prev.deadline && prev.deadline <= value
                                    ? ""
                                    : prev.deadline,
                              }));
                            }}
                            className={dateInputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabel}>
                            <FiCalendar className="mr-1 inline" size={13} />
                            End date *
                          </label>
                          <input
                            type="date"
                            value={bountyData.deadline}
                            min={minDeadline}
                            onChange={(event) => updateBountyData("deadline", event.target.value)}
                            className={dateInputClass}
                          />
                          <p className={`mt-1.5 text-xs ${muted}`}>
                            At least one day after the start date.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className={smallLabel}>Reference link</label>
                        <div className="relative">
                          <FiExternalLink className={`absolute left-4 top-3.5 ${muted}`} size={16} />
                          <input
                            type="url"
                            value={bountyData.originLink}
                            onChange={(event) => updateBountyData("originLink", event.target.value)}
                            className={`${inputClass} pl-10 ${
                              originLinkError
                                ? "!border-red-500 focus:!border-red-500"
                                : ""
                            }`}
                            placeholder="https://github.com/your-project"
                          />
                        </div>
                        {originLinkError && (
                          <p className="mt-2 text-xs text-red-500">{originLinkError}</p>
                        )}
                        <p className={`mt-1.5 text-xs ${muted}`}>
                          Optional. Link to project resources, a repository, or design files.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div>
                    <div className="mb-8 flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                        <FiDollarSign size={21} />
                      </span>
                      <div>
                        <h2 className={sectionHeading}>Reward & payouts</h2>
                        <p className={`mt-1 text-sm leading-6 ${muted}`}>
                          Set the reward amount and decide how winners will share it.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className={panel}>
                        <div className="flex items-start gap-3">
                          <FiShield className={`mt-0.5 shrink-0 ${greenText}`} size={19} />
                          <div>
                            <h3 className="text-sm font-bold">Self-funded bounty</h3>
                            <p className={`mt-1 text-xs leading-5 ${muted}`}>
                              You provide the reward for this task. Make sure you review the
                              amount, token, and network before approving the transaction.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={smallLabel}>Reward token *</label>
                        <select
                          value={bountyData.token}
                          onChange={(event) => updateBountyData("token", event.target.value)}
                          className={inputClass}
                        >
                          {availableTokens.length === 0 ? (
                            <option value="">No tokens available for this wallet network</option>
                          ) : (
                            availableTokens.map((token) => (
                              <option key={token.key} value={token.key}>
                                {token.label}{token.kind === "native" ? " (Native)" : ""}
                              </option>
                            ))
                          )}
                        </select>
                        <p className={`mt-2 text-xs ${muted}`}>
                          Available tokens are based on your connected wallet network.
                        </p>
                      </div>

                      <div>
                        <label className={smallLabel}>Reward amount *</label>
                        <div className={`flex items-center gap-3 rounded-xl border px-4 py-1 focus-within:border-[#00D6A0] ${field}`}>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={String(bountyData.reward || "")}
                            onChange={(event) => {
                              const raw = event.target.value.replace(/,/g, "");
                              if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
                              updateBountyData(
                                "reward",
                                raw === "" ? 0 : Number(raw),
                              );
                            }}
                            placeholder="0.00"
                            className="w-full bg-transparent py-3 text-lg font-semibold outline-none"
                          />
                          <span className="rounded-lg bg-[#00D6A0]/10 px-3 py-2 text-sm font-bold text-[#00D6A0]">
                            {bountyData.token || "TOKEN"}
                          </span>
                        </div>
                      </div>

                      <div className={`rounded-2xl border p-5 ${divider}`}>
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-bold">Multiple winners</h3>
                            <p className={`mt-1 text-xs ${muted}`}>
                              Let contributors share the reward.
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={multipleWinner}
                            onClick={() => setMultipleWinner((prev) => !prev)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                              multipleWinner ? "bg-[#00D6A0]" : dark ? "bg-white/20" : "bg-[#D5DDD4]"
                            }`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                multipleWinner ? "left-6" : "left-1"
                              }`}
                            />
                          </button>
                        </div>

                        {multipleWinner && (
                          <div className="space-y-4 border-t border-dashed border-white/10 pt-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setShowEqualModal(true)}
                                className={secondaryButton}
                              >
                                <FiUsers size={15} />
                                Equal split
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPercentageInput(
                                    percentageArray.length
                                      ? percentageArray.join(",")
                                      : "",
                                  );
                                  setShowPercentModal(true);
                                }}
                                className={secondaryButton}
                              >
                                % Custom split
                              </button>
                              <button
                                type="button"
                                aria-label="Explain payout types"
                                onClick={() => setShowInfoMenu((prev) => !prev)}
                                className={secondaryButton}
                              >
                                <FiInfo size={15} />
                              </button>
                            </div>

                            {showInfoMenu && (
                              <div className={panel}>
                                <p className="text-sm font-semibold">Payout options</p>
                                <p className={`mt-2 text-xs leading-5 ${muted}`}>
                                  Equal split distributes the reward evenly. Custom split
                                  assigns each winner a percentage. Percentages must total 100%.
                                </p>
                              </div>
                            )}

                            {selectedPayoutType === "MULTI_EQUAL" && (
                              <div className="rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4">
                                <p className="text-sm font-semibold text-[#00D6A0]">
                                  {winnerCount} winners · Equal split
                                </p>
                                <p className={`mt-1 text-xs ${muted}`}>
                                  Each winner receives approximately{" "}
                                  {formatAmount(Number(bountyData.reward || 0) / winnerCount)}{" "}
                                  {bountyData.token || "TOKEN"}.
                                </p>
                              </div>
                            )}

                            {selectedPayoutType === "MULTI_PERCENTAGE" && percentageArray.length > 0 && (
                              <div className="rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4">
                                <p className="text-sm font-semibold text-[#00D6A0]">
                                  Custom percentage split
                                </p>
                                <div className="mt-3 space-y-2">
                                  {percentageArray.map((percentage, index) => (
                                    <div key={`${percentage}-${index}`}>
                                      <div className="mb-1 flex justify-between text-xs">
                                        <span className={muted}>Winner {index + 1}</span>
                                        <span className="font-semibold">{percentage}%</span>
                                      </div>
                                      <div className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-[#E5EBE3]"}`}>
                                        <div
                                          className="h-full rounded-full bg-[#00D6A0]"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={smallLabel}>Reward funding type</label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => updateBountyData("rewardType", "self-fund")}
                            className={`rounded-xl border p-4 text-left transition ${
                              bountyData.rewardType === "self-fund"
                                ? "border-[#00D6A0]/50 bg-[#00D6A0]/[0.07]"
                                : divider
                            }`}
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              <FiShield className={greenText} size={17} />
                              Self-fund
                            </span>
                            <span className={`mt-2 block text-xs leading-5 ${muted}`}>
                              Fund the bounty yourself.
                            </span>
                          </button>

                          <div className={`rounded-xl border p-4 opacity-60 ${divider}`}>
                            <span className="text-sm font-semibold">Seek funding</span>
                            <span className={`mt-2 block text-xs ${muted}`}>
                              Coming soon
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`space-y-3 border-t pt-5 ${divider}`}>
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-sm ${muted}`}>Bounty reward</span>
                          <span className="text-sm font-semibold">
                            {rewardDisplay} {bountyData.token}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-sm ${muted}`}>Service fee (7%)</span>
                          <span className="text-sm font-semibold">
                            {feeDisplay} {bountyData.token}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.07] p-4">
                          <div>
                            <p className="text-sm font-bold">Total amount</p>
                            <p className={`mt-1 text-xs ${muted}`}>Reward + service fee</p>
                          </div>
                          <p className="text-lg font-bold text-[#00D6A0]">
                            {totalAmountDisplay} {bountyData.token}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div>
                    <div className="mb-8 flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                        <FiCheckCircle size={21} />
                      </span>
                      <div>
                        <h2 className={sectionHeading}>Review your bounty</h2>
                        <p className={`mt-1 text-sm leading-6 ${muted}`}>
                          Check your details and payout settings before submitting.
                        </p>
                      </div>
                    </div>

                    <div className={`mb-5 rounded-2xl border p-5 ${divider}`}>
                      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${greenText}`}>
                        Bounty preview
                      </p>
                      <h3 className="mt-3 break-words text-2xl font-bold">
                        {bountyData.title || "Untitled bounty"}
                      </h3>
                      <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 ${muted}`}>
                        {bountyData.description || "No description provided."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {bountyData.tags.map((tag) => (
                          <span key={tag} className={`rounded-full border px-3 py-1.5 text-xs ${divider}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`overflow-hidden rounded-2xl border ${divider}`}>
                      {[
                        ["Network", selectedChain?.name || "Not selected"],
                        ["Category", bountyData.category || "Not selected"],
                        ["Start date", formatDate(bountyData.startDate)],
                        ["End date", formatDate(bountyData.deadline)],
                        ["Reward type", bountyData.rewardType.replace("-", " ")],
                        ["Winner setup", !multipleWinner ? "Single winner" : selectedPayoutType === "MULTI_EQUAL" ? `${winnerCount} winners · Equal split` : `${percentageArray.length} winners · ${percentageArray.join("% / ")}%`],
                      ].map(([name, value], index) => (
                        <div
                          key={name}
                          className={`flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 ${
                            index !== 5 ? `border-b ${divider}` : ""
                          }`}
                        >
                          <span className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>
                            {name}
                          </span>
                          <span className="break-words text-sm font-semibold sm:text-right">
                            {value}
                          </span>
                        </div>
                      ))}

                      <div className={`border-t ${divider}`}>
                        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                          <span className={`text-sm ${muted}`}>Reward</span>
                          <span className="text-sm font-semibold">
                            {rewardDisplay} {bountyData.token}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                          <span className={`text-sm ${muted}`}>Service fee (7%)</span>
                          <span className="text-sm font-semibold">
                            {feeDisplay} {bountyData.token}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] px-4 py-5 sm:px-5">
                          <span className="text-sm font-bold">Total amount</span>
                          <span className="text-lg font-bold text-[#00D6A0]">
                            {totalAmountDisplay} {bountyData.token}
                          </span>
                        </div>
                      </div>
                    </div>

                    {bountyData.originLink && (
                      <a
                        href={bountyData.originLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm ${greenText} hover:underline`}
                      >
                        <FiExternalLink className="shrink-0" size={15} />
                        {bountyData.originLink}
                      </a>
                    )}

                    <div className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${divider}`}>
                      <FiShield className={`mt-0.5 shrink-0 ${greenText}`} size={18} />
                      <p className={`text-xs leading-5 ${muted}`}>
                        Creating this bounty requires wallet confirmation and an on-chain
                        transaction. Verify the network, token, reward, and service fee
                        before approving it.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step navigation */}
                <div className={`mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between ${divider}`}>
                  {currentStep === 1 ? (
                    <Link to="/dashboard" className={secondaryButton}>
                      <FiX size={16} />
                      Cancel
                    </Link>
                  ) : (
                    <button type="button" onClick={prevStep} className={secondaryButton}>
                      <FiArrowLeft size={16} />
                      Previous
                    </button>
                  )}

                  {currentStep < totalSteps ? (
                    <button type="button" onClick={nextStep} className={primaryButton}>
                      Continue
                      <FiArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isProcessing}
                      className={primaryButton}
                    >
                      {isProcessing ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07120D]/30 border-t-[#07120D]" />
                          Processing transaction...
                        </>
                      ) : (
                        <>
                          Create bounty
                          <FiCheck size={17} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Side summary */}
            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className={`rounded-2xl p-5 ${card}`}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                    <FiZap size={19} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">Bounty summary</h3>
                    <p className={`mt-1 text-xs ${muted}`}>Updates as you create</p>
                  </div>
                </div>

                <div className={`space-y-4 border-t pt-4 ${divider}`}>
                  <div>
                    <p className={`text-xs ${muted}`}>Network</p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {selectedChain?.name || "Choose a network"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${muted}`}>Category</p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {bountyData.category || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${muted}`}>Task title</p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {bountyData.title || "Your bounty title"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${muted}`}>Selected tags</p>
                    <p className="mt-1 text-sm font-semibold">
                      {bountyData.tags.length ? bountyData.tags.length : "None"} / 5
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-5 ${card}`}>
                <p className={`text-xs font-bold uppercase tracking-[0.14em] ${greenText}`}>
                  Payment breakdown
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${muted}`}>Reward</span>
                    <span className="text-xs font-semibold">
                      {rewardDisplay} {bountyData.token}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${muted}`}>Fee · 7%</span>
                    <span className="text-xs font-semibold">
                      {feeDisplay} {bountyData.token}
                    </span>
                  </div>
                  <div className={`border-t pt-3 ${divider}`}>
                    <p className={`text-xs ${muted}`}>Estimated total</p>
                    <p className="mt-1 break-words text-xl font-bold text-[#00D6A0]">
                      {totalAmountDisplay}{" "}
                      <span className="text-sm">{bountyData.token}</span>
                    </p>
                  </div>
                </div>

                <p className={`mt-4 text-xs leading-5 ${muted}`}>
                  Network gas may be charged separately by your wallet.
                </p>
              </div>

              <div className={`rounded-2xl p-5 ${card}`}>
                <div className="flex items-start gap-3">
                  <FiShield className={`mt-0.5 shrink-0 ${greenText}`} size={18} />
                  <div>
                    <h3 className="text-sm font-bold">Your bounty, your rules</h3>
                    <p className={`mt-2 text-xs leading-5 ${muted}`}>
                      Make your requirements specific, explain what counts as a successful
                      submission, and set a realistic deadline.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer dark={dark} />

      {/* Floating scroll-to-top button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        tabIndex={showScrollTop ? 0 : -1}
        className={`fixed bottom-6 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#00D6A0]/30 bg-[#00D6A0] text-[#07120D] shadow-[0_8px_30px_rgba(0,214,160,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#32E5B8] hover:shadow-[0_12px_35px_rgba(0,214,160,0.35)] focus:outline-none focus:ring-4 focus:ring-[#00D6A0]/25 sm:bottom-8 sm:right-8 ${
          showScrollTop
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-90 opacity-0"
        }`}
      >
        <FiArrowUp size={21} strokeWidth={2.5} />
      </button>

      {/* Equal split modal */}
      {showEqualModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowEqualModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="equal-split-title"
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              dark ? "border-white/10 bg-[#101411]" : "border-[#E2E7E1] bg-white"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                  <FiUsers size={19} />
                </span>
                <h3 id="equal-split-title" className="text-xl font-bold">
                  Equal reward split
                </h3>
                <p className={`mt-1 text-sm ${muted}`}>
                  Choose between two and five winners.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEqualModal(false)}
                className={secondaryButton}
                aria-label="Close equal split dialog"
              >
                <FiX size={16} />
              </button>
            </div>

            <label className={smallLabel}>Number of winners</label>
            <input
              type="number"
              min="2"
              max="5"
              step="1"
              value={winnerCount}
              onChange={(event) => setWinnerCount(event.target.value === "" ? "" : Number(event.target.value))}
              className={inputClass}
            />

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEqualModal(false)}
                className={`${secondaryButton} flex-1`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEqualSplitConfirm}
                className={`${primaryButton} flex-1`}
              >
                Confirm split
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Percentage split modal */}
      {showPercentModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowPercentModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="percentage-split-title"
            className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border p-6 shadow-2xl ${
              dark ? "border-white/10 bg-[#101411]" : "border-[#E2E7E1] bg-white"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00D6A0]">
                  <FiDollarSign size={19} />
                </span>
                <h3 id="percentage-split-title" className="text-xl font-bold">
                  Custom percentage split
                </h3>
                <p className={`mt-1 text-sm ${muted}`}>
                  Choose a preset or enter your own percentages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPercentModal(false)}
                className={secondaryButton}
                aria-label="Close percentage split dialog"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {[
                [40, 30, 20, 5, 5],
                [40, 30, 20, 10],
                [50, 30, 20],
                [50, 50],
              ].map((preset) => (
                <button
                  key={preset.join("-")}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                    percentageInput === preset.join(",")
                      ? "border-[#00D6A0] bg-[#00D6A0]/10"
                      : divider
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {preset.join(" / ")}%
                  </span>
                  <span className={`text-xs ${muted}`}>
                    {preset.length} winners
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label className={smallLabel}>Custom percentages</label>
              <input
                type="text"
                value={percentageInput}
                onChange={(event) => setPercentageInput(event.target.value)}
                className={inputClass}
                placeholder="e.g. 40,30,20,10"
              />
              <p className={`mt-2 text-xs ${muted}`}>
                Use whole numbers separated by commas. The total must equal 100.
              </p>
              {percentageInput.trim() !== "" && (
                <p className={`mt-2 text-xs font-semibold ${
                  percentageInput.split(",").every((value) => /^\s*\d+\s*$/.test(value))
                    && percentageInput.split(",").map(Number).reduce((sum, value) => sum + value, 0) === 100
                    ? "text-[#00D6A0]"
                    : "text-amber-500"
                }`}>
                  Total: {percentageInput.split(",").reduce((sum, value) => {
                    const parsed = value.trim();
                    return parsed !== "" && /^\d+$/.test(parsed) ? sum + Number(parsed) : sum;
                  }, 0)}%
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPercentModal(false)}
                className={`${secondaryButton} flex-1`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePercentSplitConfirm}
                className={`${primaryButton} flex-1`}
              >
                Confirm split
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create;
