
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import axios from "axios";
import { showToast } from "../components/UI/Toast";

import {
  FiActivity,
  FiArrowRight,
  FiArrowUp,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";

import NavBar from "../components/Layout/NavBar";
import Footer from "../components/Layout/Footer";
import BountyCard from "../components/Bounty/BountyCard";

// Admin wallet addresses
const ADMIN_ADDRESSES = [
  "0x75DDb0a7161c717a0443967803c6516cf1e39cA6",
  "0x579F49Af31375Da97b6Ba3cf0Aa4a887A0E6c98b2",
];

function Dashboard({ dark, setDark }) {
  const { address, isConnected } = useAccount();

  // Show Admin only when the connected wallet is an admin wallet.
  const isAdmin =
    isConnected &&
    Boolean(address) &&
    ADMIN_ADDRESSES.some(
      (adminAddress) =>
        adminAddress.toLowerCase() === address.toLowerCase()
    );

  const [loading, setLoading] = useState(true);
  const [bounties, setBounties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    earnings: 0,
  });

  const [enrolledBountyIds, setEnrolledBountyIds] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const bountyApi = `${API_URL}/bounty/bounties`;
  const userInfoApi = `${API_URL}/user/details/${address}`;

  const surface = dark
    ? "border-white/[0.08] bg-[#101512]"
    : "border-black/[0.07] bg-white";

  const muted = dark ? "text-white/45" : "text-black/45";
  const subtle = dark ? "text-white/65" : "text-black/65";

  // Theme-aware hero styles
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

  const loadBounties = async () => {
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
  };

  const loadDashboardStats = async () => {
    if (!isConnected || !address) return;

    try {
      const { data } = await axios.get(userInfoApi);

      setStats({
        completed: data.user?.tasksCompleted || 0,
        inProgress: data.submissions?.pending || 0,
        earnings: data.user?.totalEarnings || 0,
      });

      setEnrolledBountyIds(data.enrolledBountyIds || []);
    } catch (err) {
      console.error("Error loading userInfo:", err);
      showToast.error("Couldn't fetch user info");
    }
  };

  useEffect(() => {
    loadBounties();

    if (isConnected && address) {
      loadDashboardStats();
    }
  }, [address, isConnected, currentPage, filter]);

  const formatEarnings = (value) => {
    const num = Number(value) || 0;

    return {
      dollars: Math.floor(num).toLocaleString(),
      cents: (num % 1).toFixed(2).split(".")[1] || "00",
    };
  };

  const { dollars, cents } = formatEarnings(stats.earnings);

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

  const totalPages = pagination?.totalPages || 1;

  const filterOptions = [
    { label: "All opportunities", value: "all" },
    { label: "Open", value: "active" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Completed", value: "completed" },
  ];

  const statItems = [
    {
      label: "Total earnings",
      value: `${dollars}.${cents}`,
      description: "Rewards collected",
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
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-10 h-[380px] w-[380px] rounded-full bg-[#00A87D]/[0.08] blur-[120px]"
        />

        <div className="relative z-10">
          {/* Hero */}
          <section
            className={`relative mb-10 overflow-hidden rounded-[28px] border transition-colors duration-300 sm:rounded-[32px] ${heroSurface}`}
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
                    className={`text-[10px] font-bold uppercase tracking-[0.22em] ${heroBadgeText}`}
                  >
                    BOT CHAIN / CONTRIBUTOR HUB
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
                  className={`mt-5 max-w-xl text-sm leading-7 sm:text-base ${heroMuted}`}
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
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition duration-300 hover:border-[#00A87D]/50 hover:bg-[#00A87D]/10 ${heroSecondaryButton}`}
                  >
                    <FiPlus />
                    Post a bounty
                  </Link>
                </div>

                <div
                  className={`mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs ${heroSubtle}`}
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
                  className={`rounded-2xl border p-5 backdrop-blur-md transition-colors duration-300 sm:p-6 ${panelSurface}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] ${panelMuted}`}
                    >
                      YOUR OVERVIEW
                    </span>

                    <FiActivity className="text-lg text-[#00A87D]" />
                  </div>

                  <div className={`mt-7 border-b pb-6 ${panelBorder}`}>
                    <p className={`text-sm ${panelSecondary}`}>
                      Total rewards earned
                    </p>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span
                        className={`text-4xl font-black tracking-tight sm:text-5xl ${panelValue}`}
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
                      <p className={`text-xs ${panelMuted}`}>Completed tasks</p>

                      <p className={`mt-1 text-2xl font-bold ${panelValue}`}>
                        {stats.completed}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A87D]/10 text-xl text-[#00A87D]">
                      <FiCheckCircle />
                    </div>
                  </div>

                  {!isConnected && (
                    <p
                      className={`mt-5 rounded-lg border px-3 py-2.5 text-[11px] leading-5 ${walletNotice}`}
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
                        BOT CHAIN
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

              {/* Analytics, Admin, Refresh, and Create buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Analytics is available to all users */}
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

                {/* Admin is shown only for configured admin wallets */}
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

                {/* Existing Refresh button */}
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

                {/* Existing Create bounty button */}
                <Link
                  to="/create"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00A87D] px-4 text-xs font-bold text-white transition hover:bg-[#008F6A]"
                >
                  <FiPlus />
                  Create bounty
                </Link>
              </div>
            </div>

            {/* Filter toolbar */}
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

            {/* Loading skeletons */}
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

                <p
                  className={`relative mx-auto mt-3 max-w-md text-sm leading-6 ${muted}`}
                >
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

      {/* Help panel */}
      {helpOpen && (
        <div
          className={`fixed bottom-24 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border shadow-2xl sm:right-7 ${
            dark
              ? "border-white/10 bg-[#101512]"
              : "border-black/[0.08] bg-white"
          }`}
        >
          <div className="flex items-center justify-between border-b border-current/[0.08] bg-[#00A87D]/[0.08] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A87D] text-white">
                <FiZap />
              </div>

              <div>
                <h3 className="text-sm font-bold">BOT Chain Help</h3>
                <p className={`mt-0.5 text-[10px] ${muted}`}>
                  Your quick dashboard guide
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              aria-label="Close help"
              className={`rounded-lg p-2 transition hover:bg-[#00A87D]/10 hover:text-[#00A87D] ${muted}`}
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <p className={`text-sm leading-6 ${subtle}`}>
              Explore available bounties, review their requirements, and follow
              the instructions to participate and earn rewards.
            </p>

            <div className={`rounded-xl border p-3 ${surface}`}>
              <div className="flex items-start gap-3">
                <FiSearch className="mt-0.5 shrink-0 text-[#00A87D]" />

                <div>
                  <p className="text-xs font-bold">Discover tasks</p>
                  <p className={`mt-1 text-xs leading-5 ${muted}`}>
                    Use the bounty filters to find suitable opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-3 ${surface}`}>
              <div className="flex items-start gap-3">
                <FiPlus className="mt-0.5 shrink-0 text-[#00A87D]" />

                <div>
                  <p className="text-xs font-bold">Post your own work</p>
                  <p className={`mt-1 text-xs leading-5 ${muted}`}>
                    Offer a reward and invite contributors to help with your
                    task.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/create"
              onClick={() => setHelpOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-3 py-3 text-xs font-bold text-white transition hover:bg-[#008F6A]"
            >
              Create a bounty
              <FiArrowRight />
            </Link>
          </div>
        </div>
      )}

      {/* Floating help button */}
      <button
        type="button"
        onClick={() => setHelpOpen((open) => !open)}
        aria-label={helpOpen ? "Close BOT Chain help" : "Open BOT Chain help"}
        title="BOT Chain help"
        className="fixed bottom-5 right-4 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#00A87D] text-white shadow-[0_8px_28px_rgba(0,168,125,0.3)] transition duration-300 hover:-translate-y-1 hover:bg-[#008F6A] sm:bottom-7 sm:right-7 sm:h-14 sm:w-14"
      >
        {helpOpen ? (
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

        #bounty-list {
          animation: dashboardFadeIn 500ms ease-out both;
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
