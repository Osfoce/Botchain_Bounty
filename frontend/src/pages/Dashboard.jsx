import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import axios from "axios";
import apiClient from "../services/apiClient";
import { useAuth } from "../hooks/useAuth";
import { showToast } from "../components/UI/Toast";
import { isConfiguredAdminWallet } from "../utils/admin";

import {
  FiActivity,
  FiArrowRight,
  FiArrowUp,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiDollarSign,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiX,
  FiZap,
  FiSend,
  FiLoader,
  FiMail,
} from "react-icons/fi";

import NavBar from "../components/Layout/NavBar";
import Footer from "../components/Layout/Footer";
import BountyCard from "../components/Bounty/BountyCard";

const SUPPORT_EMAIL = "happybounty9@gmail.com";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hello! 👋 Welcome to Happy Bounty Help Center. I can help you understand how to create bounties, fund tasks, submit work, receive rewards, and use the platform. What would you like to know?",
  source: "welcome",
};

const THANK_YOU_REPLY =
  "You're very welcome! 😊 We're always happy to help. If you have any more questions, feel free to reach us through our Contact Us page or email us at happybounty9@gmail.com.";

const SUGGESTED_QUESTIONS = [
  "What is Happy Bounty?",
  "How do I create a bounty?",
  "How do I fund a bounty?",
  "How can I complete a bounty?",
  "How do I submit my work?",
  "How do I receive my rewards?",
  "Which networks does Happy Bounty support?",
  "What are the platform fees?",
  "Can AI agents complete bounties?",
];

// Recognize common appreciation messages without making an API request.
const isThankYouMessage = (message) => {
  const normalized = message
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]+/g, "")
    .replace(/\s+/g, " ");

  const patterns = [
    /^thanks$/,
    /^thank you$/,
    /^thank u$/,
    /^thanks a lot$/,
    /^thank you so much$/,
    /^thanks so much$/,
    /^many thanks$/,
    /^much appreciated$/,
    /^i appreciate it$/,
    /^really appreciate it$/,
    /^appreciate it$/,
    /^thx$/,
    /^ty$/,
    /^cheers$/,
    /^thanks again$/,
    /^thank you again$/,
    /^i am grateful$/,
    /^im grateful$/,
    /^grateful$/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
};

function Dashboard({ dark, setDark }) {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useAuth();

  const isAdmin =
    isConnected && Boolean(address) && isConfiguredAdminWallet(address);

  const [loading, setLoading] = useState(true);
  const [bounties, setBounties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    earningsUsd: null,
    earningsUsdStatus: "unavailable",
  });

  const [enrolledBountyIds, setEnrolledBountyIds] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Help Center state
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState("");

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Privacy and data controls
  const [dataExporting, setDataExporting] = useState(false);
  const [dataRequestLoading, setDataRequestLoading] = useState(false);
  const [dataRequestSubmitting, setDataRequestSubmitting] = useState(false);
  const [dataDeletionRequest, setDataDeletionRequest] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const bountyApi = `${API_URL}/bounty/bounties`;
  const userInfoApi = `${API_URL}/user/details/${address}`;

  const surface = dark
    ? "border-white/[0.08] bg-[#101512]"
    : "border-black/[0.07] bg-white";

  const muted = dark ? "text-white/45" : "text-black/45";
  const subtle = dark ? "text-white/65" : "text-black/65";

  const heroSurface = dark
    ? "border-[#00A87D]/20 bg-[#0D1713] text-white"
    : "border-[#00A87D]/20 bg-white text-[#111311] shadow-sm";

  const heroMuted = dark ? "text-white/60" : "text-black/60";
  const heroSubtle = dark ? "text-white/50" : "text-black/55";

  const heroBadgeText = dark ? "text-[#77E5C2]" : "text-[#008F6A]";

  const heroSecondaryButton = dark
    ? "border-white/15 bg-white/[0.04] text-white/85"
    : "border-black/[0.09] bg-black/[0.02] text-[#111311]";

  const panelSurface = dark
    ? "border-white/10 bg-black/20"
    : "border-black/[0.08] bg-[#F7F9F7]";

  const panelBorder = dark ? "border-white/10" : "border-black/[0.08]";
  const panelMuted = dark ? "text-white/45" : "text-black/45";
  const panelSecondary = dark ? "text-white/55" : "text-black/55";
  const panelValue = dark ? "text-white" : "text-[#111311]";

  const walletNotice = dark
    ? "border-white/10 bg-white/[0.035] text-white/50"
    : "border-black/[0.08] bg-black/[0.025] text-black/55";

  // Scroll to top visibility
  useEffect(() => {
    const updateScrollState = () => {
      setShowScrollTop(window.scrollY > 360);
    };

    updateScrollState();

    window.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  // Load bounties
  const loadBounties = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(bountyApi, {
        params: {
          page: currentPage,
          limit: 6,
          status: filter !== "all" ? filter : undefined,
        },
      });

      setBounties(response.data.bounties || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error loading bounties:", err);
      showToast.error("Couldn't fetch bounties");
    } finally {
      setLoading(false);
    }
  }, [bountyApi, currentPage, filter]);

  // Load dashboard statistics
  const loadDashboardStats = useCallback(async () => {
    if (!isConnected || !address || !isAuthenticated) return;

    try {
      const { data } = await apiClient.get(userInfoApi);

      setStats({
        completed: data.user?.tasksCompleted || 0,
        inProgress: data.submissions?.pending || 0,
        earningsUsd: data.user?.totalEarningsUsd ?? null,
        earningsUsdStatus: data.user?.earningsUsdStatus || "unavailable",
      });

      setEnrolledBountyIds(data.enrolledBountyIds || []);
    } catch (err) {
      console.error("Error loading userInfo:", err);
      showToast.error("Couldn't fetch user info");
    }
  }, [address, isAuthenticated, isConnected, userInfoApi]);

  // Load data deletion request
  const loadDataDeletionRequest = useCallback(async () => {
    if (!isConnected || !address || !isAuthenticated) {
      setDataDeletionRequest(null);
      return;
    }

    setDataRequestLoading(true);

    try {
      const { data } = await apiClient.get("/user/data-deletion-requests", {
        params: { page: 1, limit: 1 },
      });

      setDataDeletionRequest(data.requests?.[0] || null);
    } catch (error) {
      console.error("Error loading data deletion request:", error);
      showToast.error("Couldn't fetch data request status");
    } finally {
      setDataRequestLoading(false);
    }
  }, [address, isAuthenticated, isConnected]);

  useEffect(() => {
    loadBounties();

    if (isConnected && address && isAuthenticated) {
      loadDashboardStats();
    }
  }, [address, isAuthenticated, isConnected, loadBounties, loadDashboardStats]);

  useEffect(() => {
    loadDataDeletionRequest();
  }, [loadDataDeletionRequest]);

  // Automatically scroll chat to the latest message
  useEffect(() => {
    if (assistantOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, assistantOpen, sendingMessage]);

  // Focus chat input when opened
  useEffect(() => {
    if (assistantOpen) {
      const timeout = window.setTimeout(() => {
        chatInputRef.current?.focus();
      }, 200);

      return () => window.clearTimeout(timeout);
    }
  }, [assistantOpen]);

  // Send the existing conversation to the FAQ support backend.
  // This does not call OpenAI from the frontend.
  const requestAssistantReply = async (conversation) => {
    if (!API_URL) {
      setChatError(
        `The support service is currently unavailable. Please email us at ${SUPPORT_EMAIL}.`
      );
      return;
    }

    setChatError("");
    setSendingMessage(true);

    try {
      const response = await axios.post(
        `${API_URL}/assistant/chat`,
        {
          messages: conversation
            .filter((item) =>
              ["user", "assistant"].includes(item.role)
            )
            .slice(-10)
            .map(({ role, content }) => ({
              role,
              content,
            })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const assistantReply =
        response.data?.reply ||
        response.data?.message ||
        response.data?.response;

      if (
        !assistantReply ||
        typeof assistantReply !== "string"
      ) {
        throw new Error("The support service returned an empty response.");
      }

      const source =
        response.data?.source === "free" ? "free" : "support";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: assistantReply,
          source,
        },
      ]);
    } catch (error) {
      console.error("Happy Bounty Help Center error:", error);

      const serverMessage =
        error.response?.data?.reply ||
        error.response?.data?.error ||
        error.response?.data?.message;

      setChatError(
        serverMessage ||
          (error.code === "ECONNABORTED"
            ? "The support service is taking too long to respond. Please try again or email our support team."
            : `Unable to connect to Happy Bounty support. Please try again or email ${SUPPORT_EMAIL}.`)
      );
    } finally {
      setSendingMessage(false);

      window.setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
  };

  // Send a new user question
  const sendAssistantMessage = async (messageOverride) => {
    const message = (messageOverride ?? chatInput).trim();

    if (!message || sendingMessage) return;

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];

    setMessages(updatedMessages);
    setChatInput("");
    setChatError("");

    // Friendly appreciation replies are handled locally.
    // No backend or AI request is needed for "Thanks" messages.
    if (isThankYouMessage(message)) {
      setSendingMessage(true);

      window.setTimeout(() => {
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content: THANK_YOU_REPLY,
            source: "thanks",
          },
        ]);

        setSendingMessage(false);

        window.setTimeout(() => {
          chatInputRef.current?.focus();
        }, 100);
      }, 450);

      return;
    }

    await requestAssistantReply(updatedMessages);
  };

  // Retry the last question without adding a duplicate user message
  const retryAssistantMessage = async () => {
    if (sendingMessage) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role !== "user") return;

    setChatError("");
    await requestAssistantReply(messages);
  };

  // Reset Help Center conversation
  const resetAssistantChat = () => {
    if (sendingMessage) return;

    setMessages([INITIAL_MESSAGE]);
    setChatInput("");
    setChatError("");
  };

  const getMessageLabel = (source) => {
    if (source === "free") return "Quick answer";
    if (source === "support") return "Contact support";
    if (source === "thanks") return "Happy to help";
    return "Help Center";
  };

  const formatEarnings = (value) => {
    const num = Number(value) || 0;
    // Avoid floating point rounding errors by working with integer cents
    const totalCents = Math.round(num * 100);
    const dollars = Math.floor(totalCents / 100).toLocaleString();
    const cents = (totalCents % 100).toString().padStart(2, "0");
    return { dollars, cents };
  };

  const { dollars, cents } = formatEarnings(stats.earningsUsd);
  const earningsComponent =
    stats.earningsUsdStatus === "complete" && stats.earningsUsd !== null ? (
      `${dollars}.${cents}`
    ) : (
      <span className={panelMuted}>USD N/A</span>
    );
  const earningsDescription =
    stats.earningsUsdStatus === "incomplete"
      ? "USD value incomplete: some reward history is unattributed"
      : stats.earningsUsdStatus === "unavailable"
        ? "Current USD pricing is unavailable"
        : "Estimated USD value at current prices";

  const handleFilterChange = (status) => {
    setFilter(status);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    await loadBounties();

    if (isConnected && address) {
      await loadDashboardStats();
    }
  };

  // Export account data
  const handleDataExport = async () => {
    if (!isAuthenticated || !address) {
      showToast.error("Sign in with your wallet to export your data.");
      return;
    }

    setDataExporting(true);

    try {
      const limit = 100;

      const firstPage = await apiClient.get("/user/data-export", {
        params: { page: 1, limit },
      });

      const response = firstPage.data;

      const collections = Object.keys(response.data || {}).filter((key) =>
        Array.isArray(response.data[key])
      );

      const totalPages = Math.max(
        1,
        ...Object.values(response.pagination || {}).map(
          (page) => Number(page.pages) || 0
        )
      );

      if (totalPages > 50) {
        showToast.error(
          "This export is too large to download at once. Please contact support for assistance."
        );
        return;
      }

      const exportData = { ...response.data };

      for (let page = 2; page <= totalPages; page += 1) {
        const { data } = await apiClient.get("/user/data-export", {
          params: { page, limit },
        });

        for (const collection of collections) {
          exportData[collection].push(...(data.data[collection] || []));
        }
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        walletAddress: address,
        data: exportData,
        pagination: Object.fromEntries(
          Object.entries(response.pagination || {}).map(([key, value]) => [
            key,
            { total: value.total, pages: value.pages },
          ])
        ),
        excluded: response.excluded || [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `botchain-data-${address.toLowerCase()}.json`;
      link.click();

      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      showToast.success("Your data export has been downloaded.");
    } catch (error) {
      console.error("Error exporting user data:", error);

      showToast.error(
        error.response?.data?.error || "Couldn't download your data export."
      );
    } finally {
      setDataExporting(false);
    }
  };

  // Submit data retention request
  const handleDataDeletionRequest = async () => {
    if (!isAuthenticated || !address) {
      showToast.error("Sign in with your wallet to submit a data request.");
      return;
    }

    setDataRequestSubmitting(true);

    try {
      const { data } = await apiClient.post("/user/data-deletion-request", {});

      setDataDeletionRequest(data.request);

      showToast.success(
        data.alreadyOpen
          ? "You already have an open data request."
          : "Your data request was submitted for review."
      );
    } catch (error) {
      console.error("Error submitting data deletion request:", error);

      showToast.error(
        error.response?.data?.error || "Couldn't submit your data request."
      );
    } finally {
      setDataRequestSubmitting(false);
    }
  };

  const totalPages = pagination?.pages || 1;

  const filterOptions = [
    { label: "All opportunities", value: "all" },
    { label: "Open", value: "active" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Completed", value: "completed" },
  ];

  const statItems = [
    {
      label: "Total earnings",
      value: earningsComponent,
      description: earningsDescription,
      icon: FiDollarSign,
      index: "01",
      featured: true,
    },
    {
      label: "Tasks completed",
      value: stats.completed.toLocaleString(),
      description: "Successfully completed",
      icon: FiCheckCircle,
      index: "02",
    },
    {
      label: "In progress",
      value: stats.inProgress.toLocaleString(),
      description: "Submissions awaiting review",
      icon: FiActivity,
      index: "03",
    },
  ];

  return (
    <div
      className={`min-h-screen overflow-x-clip transition-colors duration-300 ${
        dark ? "bg-[#080B0D] text-white" : "bg-[#F3F5F3] text-[#111311]"
      }`}
    >
      <NavBar dark={dark} setDark={setDark} />

      <main className="relative mx-auto w-full max-w-[1600px] px-4 pt-24 sm:px-6 sm:pt-28 lg:px-10 lg:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-10 h-[380px] w-[380px] rounded-full bg-[#00A87D]/[0.08] blur-[120px]"
        />

        <div className="relative z-10">
          {/* Hero */}
          <section
            className={`relative mb-10 overflow-hidden rounded-[28px] border transition-colors duration-300 sm:rounded-[32px] ${
              dark
                ? "border-[#00A87D]/20 bg-[#0D1713] text-white"
                : "border-[#00A87D]/20 bg-white text-[#111311] shadow-sm"
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 ${
                dark ? "opacity-[0.13]" : "opacity-[0.07]"
              }`}
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,168,125,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,125,0.35) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-28 h-[360px] w-[360px] rounded-full border border-[#00A87D]/20 sm:right-0 sm:top-[-170px] sm:h-[500px] sm:w-[500px]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 top-10 h-[250px] w-[250px] rounded-full border border-[#00A87D]/15 sm:right-14 sm:top-[-95px] sm:h-[360px] sm:w-[360px]"
            />

            <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_300px] lg:items-center lg:gap-12 lg:p-12 xl:p-14">
              <div className="max-w-2xl">
                <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#00A87D]/30 bg-[#00A87D]/10 px-3.5 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-[#00C995] opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-[#00C995]" />
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                      dark ? "text-[#77E5C2]" : "text-[#008F6A]"
                    }`}
                  >
                    MULTI CHAIN / CONTRIBUTOR HUB
                  </span>
                </div>

                <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                  Put your skills
                  <br />
                  to work.{" "}
                  <span className={dark ? "text-[#00C995]" : "text-[#008F6A]"}>
                    Get rewarded.
                  </span>
                </h1>

                <p
                  className={`mt-5 max-w-xl text-sm leading-7 sm:text-base ${
                    dark ? "text-white/60" : "text-black/60"
                  }`}
                >
                  Discover meaningful tasks, complete bounties, and turn your
                  contributions into rewards. Your next opportunity starts here.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("bounty-list")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#00A87D] px-5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#00BD8C] hover:shadow-[0_12px_30px_rgba(0,168,125,0.22)]"
                  >
                    Discover bounties
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </button>

                  <Link
                    to="/create"
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition duration-300 hover:border-[#00A87D]/50 hover:bg-[#00A87D]/10 ${
                      dark
                        ? "border-white/15 bg-white/[0.04] text-white/85"
                        : "border-black/[0.09] bg-black/[0.02] text-[#111311]"
                    }`}
                  >
                    <FiPlus />
                    Post a bounty
                  </Link>
                </div>

                <div
                  className={`mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs ${
                    dark ? "text-white/50" : "text-black/55"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiCheckCircle className="text-[#00A87D]" />
                    Real opportunities
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <FiZap className="text-[#00A87D]" />
                    Reward-driven work
                  </span>
                </div>
              </div>

              {/* Hero side panel */}
              <div className="relative">
                <div
                  className={`rounded-2xl border p-5 backdrop-blur-md transition-colors duration-300 sm:p-6 ${
                    dark
                      ? "border-white/10 bg-black/20"
                      : "border-black/[0.08] bg-[#F7F9F7]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                        dark ? "text-white/45" : "text-black/45"
                      }`}
                    >
                      YOUR OVERVIEW
                    </span>

                    <FiActivity className="text-lg text-[#00A87D]" />
                  </div>

                  <div
                    className={`mt-7 border-b pb-6 ${
                      dark ? "border-white/10" : "border-black/[0.08]"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        dark ? "text-white/55" : "text-black/55"
                      }`}
                    >
                      Total rewards earned
                    </p>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span
                        className={`text-4xl font-black tracking-tight sm:text-5xl ${
                          dark ? "text-white" : "text-[#111311]"
                        }`}
                      >
                        {dollars}
                      </span>

                      <span className="text-xl font-bold text-[#00A87D]">
                        .{cents}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#008F6A] dark:text-[#00C995]">
                      <FiTrendingUp />
                      <span>Keep building your earnings</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-xs ${
                          dark ? "text-white/45" : "text-black/45"
                        }`}
                      >
                        Completed tasks
                      </p>

                      <p
                        className={`mt-1 text-2xl font-bold ${
                          dark ? "text-white" : "text-[#111311]"
                        }`}
                      >
                        {stats.completed}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A87D]/10 text-xl text-[#00A87D]">
                      <FiCheckCircle />
                    </div>
                  </div>

                  {!isConnected && (
                    <p
                      className={`mt-5 rounded-lg border px-3 py-2.5 text-[11px] leading-5 ${
                        dark
                          ? "border-white/10 bg-white/[0.035] text-white/50"
                          : "border-black/[0.08] bg-black/[0.025] text-black/55"
                      }`}
                    >
                      Connect your wallet to view your personal contributor
                      statistics.
                    </p>
                  )}
                </div>

                <div className="absolute -bottom-3 -right-2 -z-10 h-24 w-24 rounded-full bg-[#00A87D]/20 blur-2xl" />
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-14">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00A87D]">
                  YOUR ACTIVITY
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                  Performance overview
                </h2>
              </div>

              <span className={`text-xs ${muted}`}>
                {isConnected
                  ? "Personal account statistics"
                  : "Connect wallet for personal stats"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.index}
                    className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:border-[#00A87D]/40 sm:p-6 ${
                      item.featured
                        ? "border-[#00A87D]/25 bg-[#00A87D]/[0.055]"
                        : surface
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-medium ${muted}`}>
                          {item.label}
                        </p>

                        <p className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                          {item.value}
                        </p>

                        <p className={`mt-2 text-xs ${muted}`}>
                          {item.description}
                        </p>
                      </div>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition duration-300 group-hover:scale-105 ${
                          item.featured
                            ? "bg-[#00A87D] text-white"
                            : "bg-[#00A87D]/10 text-[#00A87D]"
                        }`}
                      >
                        <Icon />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-current/[0.07] pt-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.16em] ${muted}`}
                      >
                        MULTI CHAIN
                      </span>

                      <span className="text-xs font-semibold text-[#00A87D]">
                        {item.index}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Privacy and data controls */}
          <section className="mb-14">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00A87D]">
                PRIVACY & DATA
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                Your data controls
              </h2>

              <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>
                Export your account records or request a manual review of data
                retention. Financial and blockchain records are preserved;
                requests do not erase on-chain activity.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A87D]/10 text-lg text-[#00A87D]">
                    <FiDownload />
                  </div>

                  <div>
                    <h3 className="font-bold">Download your data</h3>

                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      Get a JSON export of your profile, bounties, submissions,
                      enrollments, comments, rewards, and claim records.
                      Collections are paginated automatically.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDataExport}
                  disabled={!isAuthenticated || dataExporting}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#00A87D] px-4 text-xs font-bold text-white transition hover:bg-[#008F6A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiDownload
                    className={dataExporting ? "animate-pulse" : ""}
                  />
                  {dataExporting ? "Preparing export..." : "Download JSON"}
                </button>

                {!isAuthenticated && (
                  <p className={`mt-3 text-xs ${muted}`}>
                    Connect and sign in with your wallet to use data controls.
                  </p>
                )}
              </article>

              <article className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A87D]/10 text-lg text-[#00A87D]">
                    <FiShield />
                  </div>

                  <div>
                    <h3 className="font-bold">Data retention request</h3>

                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      Submit a request for administrator review. This does not
                      automatically delete records, and necessary financial,
                      bounty, and blockchain history is retained.
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm ${panelSurface}`}
                  aria-live="polite"
                >
                  {dataRequestLoading ? (
                    <span className={muted}>Checking request status...</span>
                  ) : dataDeletionRequest ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Status:{" "}
                        <strong className="capitalize text-[#00A87D]">
                          {dataDeletionRequest.status}
                        </strong>
                      </span>

                      <span className={`text-xs ${muted}`}>
                        Updated{" "}
                        {new Date(
                          dataDeletionRequest.updatedAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className={muted}>
                      {isAuthenticated
                        ? "No previous request found."
                        : "Sign in to view your request status."}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDataDeletionRequest}
                  disabled={
                    !isAuthenticated ||
                    dataRequestSubmitting ||
                    dataRequestLoading ||
                    ["pending", "reviewing"].includes(
                      dataDeletionRequest?.status
                    )
                  }
                  className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    dark
                      ? "border-white/10 bg-white/[0.03] hover:border-[#00A87D]/50 hover:text-[#00A87D]"
                      : "border-black/[0.08] bg-white hover:border-[#00A87D]/50 hover:text-[#008F6A]"
                  }`}
                >
                  {dataRequestSubmitting
                    ? "Submitting..."
                    : ["pending", "reviewing"].includes(
                          dataDeletionRequest?.status
                        )
                      ? "Request under review"
                      : "Request data review"}
                </button>
              </article>
            </div>
          </section>

          {/* Bounty discovery */}
          <section id="bounty-list" className="scroll-mt-24">
            <div className="mb-6 flex flex-col gap-5 border-b border-current/[0.09] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A87D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00A87D]" />
                  OPPORTUNITY BOARD
                </div>

                <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  Find your next bounty
                  <span className="text-[#00A87D]">.</span>
                </h2>

                <p className={`mt-3 max-w-xl text-sm leading-6 ${muted}`}>
                  Browse tasks, discover opportunities that match your skills,
                  and earn rewards for the work you complete.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/analytics"
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition hover:border-[#00A87D]/50 hover:bg-[#00A87D]/10 hover:text-[#00A87D] ${
                    dark
                      ? "border-white/10 bg-white/[0.03] text-white"
                      : "border-black/[0.08] bg-white text-[#111311]"
                  }`}
                >
                  <FiTrendingUp className="text-[#00A87D]" />
                  Analytics
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin-224466"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#00A87D]/30 bg-[#00A87D]/10 px-4 text-xs font-bold text-[#00A87D] transition hover:bg-[#00A87D] hover:text-white"
                  >
                    <FiActivity />
                    Admin
                    <FiArrowRight />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-semibold transition hover:border-[#00A87D]/40 hover:text-[#00A87D] disabled:cursor-not-allowed disabled:opacity-50 ${
                    dark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-black/[0.08] bg-white"
                  }`}
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>

                <Link
                  to="/create"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00A87D] px-4 text-xs font-bold text-white transition hover:bg-[#008F6A]"
                >
                  <FiPlus />
                  Create bounty
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div
              className={`mb-6 flex flex-col gap-4 rounded-2xl border p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between ${surface}`}
            >
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                  const active = filter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFilterChange(option.value)}
                      aria-pressed={active}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition duration-200 ${
                        active
                          ? "bg-[#00A87D] text-white shadow-[0_5px_16px_rgba(0,168,125,0.18)]"
                          : dark
                            ? "text-white/50 hover:bg-white/[0.06] hover:text-white"
                            : "text-black/50 hover:bg-black/[0.045] hover:text-black"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className={`flex items-center gap-2 px-2 text-xs ${muted}`}>
                <FiSearch className="shrink-0 text-[#00A87D]" />

                <span>
                  {loading
                    ? "Finding opportunities..."
                    : `${bounties.length} ${
                        bounties.length === 1 ? "bounty" : "bounties"
                      } on this page`}
                </span>
              </div>
            </div>

            {/* Bounty loading and results */}
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className={`animate-pulse rounded-2xl border p-5 ${surface}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-11 w-11 rounded-xl ${
                          dark ? "bg-white/[0.07]" : "bg-black/[0.06]"
                        }`}
                      />

                      <div className="flex-1 space-y-2">
                        <div
                          className={`h-3 w-3/4 rounded ${
                            dark ? "bg-white/[0.07]" : "bg-black/[0.06]"
                          }`}
                        />

                        <div
                          className={`h-2.5 w-1/2 rounded ${
                            dark ? "bg-white/[0.05]" : "bg-black/[0.04]"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {[1, 2, 3].map((line) => (
                        <div
                          key={line}
                          className={`h-3 rounded ${
                            dark ? "bg-white/[0.055]" : "bg-black/[0.045]"
                          } ${line === 2 ? "w-5/6" : "w-full"}`}
                        />
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div
                        className={`h-16 rounded-xl ${
                          dark ? "bg-white/[0.045]" : "bg-black/[0.035]"
                        }`}
                      />

                      <div
                        className={`h-16 rounded-xl ${
                          dark ? "bg-white/[0.045]" : "bg-black/[0.035]"
                        }`}
                      />
                    </div>

                    <div
                      className={`mt-5 h-10 rounded-xl ${
                        dark ? "bg-white/[0.06]" : "bg-black/[0.05]"
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : bounties.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {bounties.map((bounty) => (
                  <BountyCard
                    key={bounty._id || bounty.id}
                    bounty={bounty}
                    dark={dark}
                    enrolledBountyIds={enrolledBountyIds}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`relative overflow-hidden rounded-2xl border px-6 py-16 text-center sm:px-10 ${surface}`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-[#00A87D]/10 blur-[70px]"
                />

                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00A87D]/10 text-2xl text-[#00A87D]">
                  <FiSearch />
                </div>

                <h3 className="relative mt-6 text-xl font-black">
                  No matching bounties
                </h3>

                <p className={`relative mx-auto mt-3 max-w-md text-sm leading-6 ${muted}`}>
                  There are no opportunities matching this filter right now. Try
                  another category or check back later.
                </p>

                <div className="relative mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFilterChange("all")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#008F6A]"
                  >
                    Browse all bounties
                    <FiArrowRight />
                  </button>

                  <Link
                    to="/create"
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold transition hover:border-[#00A87D]/40 hover:text-[#00A87D] ${
                      dark ? "border-white/10" : "border-black/10"
                    }`}
                  >
                    <FiPlus />
                    Create a bounty
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && bounties.length > 0 && pagination && (
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-xs ${muted}`}>
                  Page{" "}
                  <span className="font-bold text-[#00A87D]">
                    {currentPage}
                  </span>{" "}
                  of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition hover:border-[#00A87D]/40 hover:text-[#00A87D] disabled:cursor-not-allowed disabled:opacity-30 ${
                      dark ? "border-white/10" : "border-black/10"
                    }`}
                  >
                    <FiChevronLeft />
                  </button>

                  <span
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-xs font-bold ${
                      dark
                        ? "bg-[#00A87D]/15 text-[#00C995]"
                        : "bg-[#00A87D]/10 text-[#008F6A]"
                    }`}
                  >
                    {currentPage}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition hover:border-[#00A87D]/40 hover:text-[#00A87D] disabled:cursor-not-allowed disabled:opacity-30 ${
                      dark ? "border-white/10" : "border-black/10"
                    }`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Contributor callout */}
          <section className="mt-16">
            <div className="relative overflow-hidden rounded-2xl bg-[#00A87D] p-6 text-white sm:p-8 lg:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/20 sm:h-80 sm:w-80"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-14 h-48 w-48 rounded-full border border-white/15 sm:h-64 sm:w-64"
              />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
                    <FiZap />
                    BUILD SOMETHING VALUABLE
                  </div>

                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Have work that needs doing?
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                    Create a bounty, set a reward, and give contributors the
                    opportunity to help bring your ideas to life.
                  </p>
                </div>

                <Link
                  to="/create"
                  className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-[#071B14] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0B2A20] md:self-center"
                >
                  Create a bounty
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer dark={dark} />

      {/* HAPPY BOUNTY HELP CENTER */}
      {assistantOpen && (
        <section
          role="dialog"
          aria-label="Happy Bounty Help Center"
          aria-modal="false"
          className={`hb-chat-window fixed bottom-[5.5rem] right-4 z-[110] flex w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[22px] border shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:right-7 ${
            dark
              ? "border-white/10 bg-[#101512] text-white"
              : "border-black/[0.08] bg-white text-[#111311]"
          }`}
        >
          {/* Chat header */}
          <div className="flex shrink-0 items-center justify-between border-b border-current/[0.08] bg-[#00A87D]/[0.08] px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A87D] text-white shadow-lg shadow-[#00A87D]/20">
                <FiMessageCircle className="text-lg" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#101512] bg-[#00E0A5]" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold">
                  Happy Bounty Help Center
                </h3>

                <p className={`mt-0.5 text-[10px] ${muted}`}>
                  Platform FAQs and support
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={resetAssistantChat}
                disabled={sendingMessage}
                aria-label="Start a new conversation"
                title="New conversation"
                className={`rounded-lg p-2 transition hover:bg-[#00A87D]/10 hover:text-[#00A87D] disabled:opacity-40 ${muted}`}
              >
                <FiRefreshCw className="text-sm" />
              </button>

              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                aria-label="Close Help Center"
                className={`rounded-lg p-2 transition hover:bg-[#00A87D]/10 hover:text-[#00A87D] ${muted}`}
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </div>

          {/* Scrollable messages and FAQ suggestions */}
          <div
            className={`hb-chat-messages min-h-0 flex-1 space-y-4 overflow-y-auto p-4 ${
              dark ? "bg-[#0C110E]" : "bg-[#F7F9F7]"
            }`}
            aria-live="polite"
          >
            <div className="mx-auto flex max-w-[260px] items-center justify-center gap-2 rounded-full border border-[#00A87D]/15 bg-[#00A87D]/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#008F6A] dark:text-[#00C995]">
              <FiShield />
              Happy Bounty support
            </div>

            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${index}-${message.role}`}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-6 ${
                      isUser
                        ? "rounded-br-md bg-[#00A87D] text-white"
                        : dark
                          ? "rounded-bl-md border border-white/[0.07] bg-white/[0.055] text-white/85"
                          : "rounded-bl-md border border-black/[0.06] bg-white text-[#242924] shadow-sm"
                    }`}
                  >
                    {!isUser && message.source !== "welcome" && (
                      <div className="mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#00A87D]">
                          {getMessageLabel(message.source)}
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Contact links in friendly thank-you replies */}
                    {!isUser && message.source === "thanks" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          to="/contact"
                          onClick={() => setAssistantOpen(false)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#00A87D] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#008F6A]"
                        >
                          Contact Us
                          <FiArrowRight className="h-3 w-3" />
                        </Link>

                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold transition hover:border-[#00A87D]/50 hover:text-[#00A87D] ${
                            dark
                              ? "border-white/10 text-white/75"
                              : "border-black/10 text-black/65"
                          }`}
                        >
                          <FiMail className="h-3.5 w-3.5" />
                          Email us
                        </a>
                      </div>
                    )}

                    {/* Show contact options for questions not covered by FAQs */}
                    {!isUser && message.source === "support" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#00A87D] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#008F6A]"
                        >
                          <FiMail className="h-3.5 w-3.5" />
                          Email support
                        </a>

                        <Link
                          to="/contact"
                          onClick={() => setAssistantOpen(false)}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold transition hover:border-[#00A87D]/50 hover:text-[#00A87D] ${
                            dark
                              ? "border-white/10 text-white/75"
                              : "border-black/10 text-black/65"
                          }`}
                        >
                          Contact Us
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Suggested FAQ questions */}
            {messages.length === 1 && !sendingMessage && (
              <div className="space-y-2 pt-1">
                <p className={`text-[10px] font-semibold ${muted}`}>
                  YOU CAN ASK ME
                </p>

                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendAssistantMessage(question)}
                    disabled={sendingMessage}
                    className={`block w-full rounded-xl border px-3 py-2.5 text-left text-xs transition hover:border-[#00A87D]/40 hover:bg-[#00A87D]/[0.07] disabled:opacity-40 ${
                      dark
                        ? "border-white/[0.08] bg-white/[0.025] text-white/75"
                        : "border-black/[0.07] bg-white text-black/65"
                    }`}
                  >
                    {question}
                    <FiArrowRight className="float-right mt-0.5 text-[#00A87D]" />
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {sendingMessage && (
              <div className="flex justify-start">
                <div
                  className={`flex items-center gap-2 rounded-2xl rounded-bl-md border px-4 py-3 ${
                    dark
                      ? "border-white/[0.07] bg-white/[0.055]"
                      : "border-black/[0.06] bg-white"
                  }`}
                >
                  <span className="text-[11px] text-[#00A87D]">
                    Preparing a reply
                  </span>

                  <span className="hb-typing-dot" />
                  <span className="hb-typing-dot" />
                  <span className="hb-typing-dot" />
                </div>
              </div>
            )}

            {/* Error message */}
            {chatError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5 text-xs leading-5 text-red-500"
              >
                <p>{chatError}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {messages[messages.length - 1]?.role === "user" && (
                    <button
                      type="button"
                      onClick={retryAssistantMessage}
                      disabled={sendingMessage}
                      className="font-bold underline disabled:opacity-40"
                    >
                      Try again
                    </button>
                  )}

                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-1.5 font-bold text-[#00A87D] underline"
                  >
                    <FiMail />
                    Email support
                  </a>

                  <Link
                    to="/contact"
                    onClick={() => setAssistantOpen(false)}
                    className="font-bold text-[#00A87D] underline"
                  >
                    Contact Us
                  </Link>

                  <button
                    type="button"
                    onClick={() => setChatError("")}
                    className="font-bold underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendAssistantMessage();
            }}
            className={`shrink-0 border-t border-current/[0.08] p-3 ${
              dark ? "bg-[#101512]" : "bg-white"
            }`}
          >
            <div
              className={`flex items-end gap-2 rounded-2xl border p-2 transition focus-within:border-[#00A87D]/50 focus-within:ring-2 focus-within:ring-[#00A87D]/10 ${
                dark
                  ? "border-white/10 bg-black/20"
                  : "border-black/[0.09] bg-[#F7F9F7]"
              }`}
            >
              <textarea
                ref={chatInputRef}
                rows={1}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    sendAssistantMessage();
                  }
                }}
                placeholder="Ask Happy Bounty..."
                aria-label="Type your support question"
                maxLength={2000}
                disabled={sendingMessage}
                className={`max-h-24 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-xs leading-5 outline-none placeholder:opacity-40 disabled:opacity-50 ${
                  dark ? "text-white" : "text-[#111311]"
                }`}
              />

              <button
                type="submit"
                disabled={!chatInput.trim() || sendingMessage}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00A87D] text-white transition hover:bg-[#008F6A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sendingMessage ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiSend />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className={`text-[9px] ${muted}`}>
                Happy Bounty Help Center
              </span>

              <span className={`text-[9px] ${muted}`}>
                {chatInput.length}/2000
              </span>
            </div>
          </form>
        </section>
      )}

      {/* Floating Help Center button */}
      <button
        type="button"
        onClick={() => {
          setAssistantOpen((open) => !open);
          setChatError("");
        }}
        aria-label={
          assistantOpen
            ? "Close Happy Bounty Help Center"
            : "Open Happy Bounty Help Center"
        }
        title="Contact Happy Bounty support"
        className="fixed bottom-5 right-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#00A87D] text-white shadow-[0_8px_28px_rgba(0,168,125,0.3)] transition duration-300 hover:-translate-y-1 hover:bg-[#008F6A] sm:bottom-7 sm:right-7 sm:h-14 sm:w-14"
      >
        {assistantOpen ? (
          <FiX className="text-xl" />
        ) : (
          <FiMessageCircle className="text-xl" />
        )}
      </button>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          aria-label="Scroll to top"
          title="Scroll to top"
          className={`fixed bottom-5 left-4 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-[#00A87D]/30 text-[#00A87D] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#00A87D] hover:text-white sm:bottom-7 sm:left-7 ${
            dark ? "bg-[#101512]" : "bg-white"
          }`}
        >
          <FiArrowUp />
        </button>
      )}

      <style>{`
        @keyframes dashboardFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardTyping {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        #bounty-list {
          animation: dashboardFadeIn 500ms ease-out both;
        }

        .hb-chat-window {
          height: min(620px, calc(100dvh - 13rem));
          max-height: min(620px, calc(100dvh - 13rem));
          min-height: 0;
          transform-origin: bottom right;
          animation: dashboardFadeIn 180ms ease-out both;
        }

        .hb-chat-messages {
          min-height: 0;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 168, 125, 0.35) transparent;
        }

        .hb-chat-messages::-webkit-scrollbar {
          width: 5px;
        }

        .hb-chat-messages::-webkit-scrollbar-thumb {
          border-radius: 20px;
          background: rgba(0, 168, 125, 0.35);
        }

        .hb-typing-dot {
          width: 5px;
          height: 5px;
          display: inline-block;
          border-radius: 50%;
          background: #00A87D;
          animation: dashboardTyping 1.2s infinite ease-in-out;
        }

        .hb-typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .hb-typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @media (max-width: 767px) {
          .hb-chat-window {
            height: min(620px, calc(100dvh - 12rem));
            max-height: min(620px, calc(100dvh - 12rem));
          }
        }

        @media (max-height: 560px) {
          .hb-chat-window {
            height: calc(100dvh - 9rem);
            max-height: calc(100dvh - 9rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
