
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

import {
  FiActivity,
  FiArrowLeft,
  FiArrowUpRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronUp,
  FiClock,
  FiDollarSign,
  FiLayers,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
  FiZap,
} from "react-icons/fi";

import NavBar from "../components/Layout/NavBar";
import Footer from "../components/Layout/Footer";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = "#00D6A0";

const number = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const amount = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const percent = (value) =>
  `${Math.min(100, Math.max(0, Number(value) || 0)).toFixed(0)}%`;

const dateLabel = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusConfig = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    ["accepted", "approved", "completed", "success", "claimed"].includes(
      value
    )
  ) {
    return {
      label: status,
      icon: FiCheckCircle,
      style:
        "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400",
      dot: "bg-green-500",
    };
  }

  if (
    ["pending", "in review", "processing", "submitted"].includes(value)
  ) {
    return {
      label: status,
      icon: FiClock,
      style:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
      dot: "bg-amber-500",
    };
  }

  if (
    ["rejected", "declined", "failed", "cancelled", "canceled"].includes(
      value
    )
  ) {
    return {
      label: status,
      icon: FiXCircle,
      style:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
      dot: "bg-red-500",
    };
  }

  return {
    label: status || "Unknown",
    icon: FiActivity,
    style:
      "border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60",
    dot: "bg-gray-400",
  };
};

function Card({ children, dark, className = "", accent = false }) {
  return (
    <section
      className={`relative min-w-0 overflow-hidden rounded-2xl border p-4 transition duration-300 sm:rounded-3xl sm:p-6 ${
        dark
          ? "border-white/[0.08] bg-[#111311] text-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
          : "border-black/[0.06] bg-white text-[#252721] shadow-[0_12px_35px_rgba(30,30,20,0.035)]"
      } ${accent ? "border-[#00D6A0]/30" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#00A87D] sm:text-[10px]">
      {children}
    </p>
  );
}

function SectionTitle({ number: sectionNumber, label, title, dark }) {
  return (
    <div className="mb-5 flex items-start gap-3 sm:mb-6">
      <div className="pt-1">
        <Eyebrow>
          {sectionNumber} / {label}
        </Eyebrow>
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight sm:text-lg">
          {title}
        </h2>

        <div
          className={`mt-2 h-1 w-9 rounded-full ${
            dark ? "bg-[#00D6A0]/70" : "bg-[#00D6A0]"
          }`}
        />
      </div>
    </div>
  );
}

function EmptyState({
  dark,
  icon: Icon = FiActivity,
  title,
  description,
}) {
  return (
    <div
      className={`flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-7 text-center ${
        dark
          ? "border-white/10 bg-white/[0.025]"
          : "border-black/[0.09] bg-[#f8faf8]"
      }`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00D6A0]/10 text-xl text-[#00A87D]">
        <Icon />
      </div>

      <p className="text-sm font-semibold">{title}</p>

      <p
        className={`mt-1 max-w-xs text-xs leading-5 ${
          dark ? "text-white/45" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  dark,
  icon: Icon,
  label,
  value,
  description,
  featured = false,
  footer,
}) {
  return (
    <article
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-3 transition duration-300 hover:-translate-y-1 sm:rounded-3xl sm:p-5 ${
        featured
          ? "border-[#00D6A0]/30 bg-[#00D6A0]/[0.07]"
          : dark
            ? "border-white/[0.08] bg-[#111311]"
            : "border-black/[0.06] bg-white"
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className={`break-words text-[10px] font-semibold leading-4 sm:text-xs ${
              dark ? "text-white/55" : "text-gray-500"
            }`}
          >
            {label}
          </p>

          <p className="mt-3 break-words text-xl font-black tracking-tight sm:mt-4 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm transition duration-300 group-hover:scale-110 sm:h-10 sm:w-10 sm:text-lg ${
            featured
              ? "bg-[#00D6A0] text-[#06271D]"
              : "bg-[#00D6A0]/10 text-[#00A87D]"
          }`}
        >
          <Icon />
        </div>
      </div>

      <p
        className={`mt-2 break-words text-[10px] leading-4 sm:mt-3 sm:text-xs sm:leading-5 ${
          dark ? "text-white/40" : "text-gray-500"
        }`}
      >
        {description}
      </p>

      {footer && (
        <div
          className={`mt-3 border-t pt-3 text-[9px] font-semibold sm:mt-4 sm:pt-4 sm:text-[10px] ${
            dark
              ? "border-white/[0.08] text-white/45"
              : "border-black/[0.06] text-gray-500"
          }`}
        >
          {footer}
        </div>
      )}

      <div
        className={`pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full blur-2xl transition-opacity ${
          featured
            ? "bg-[#00D6A0]/15 opacity-100"
            : "bg-[#00D6A0]/10 opacity-0 group-hover:opacity-100"
        }`}
      />
    </article>
  );
}

function BarRow({ label, value, total, dark, color = ACCENT }) {
  const safeValue = Math.max(0, Number(value) || 0);
  const safeTotal = Math.max(0, Number(total) || 0);
  const width =
    safeTotal > 0 ? Math.min(100, (safeValue / safeTotal) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span
          className={`min-w-0 truncate font-medium ${
            dark ? "text-white/65" : "text-gray-600"
          }`}
        >
          {label}
        </span>

        <span className="shrink-0 font-bold">{number(safeValue)}</span>
      </div>

      <div
        className={`h-2 overflow-hidden rounded-full ${
          dark ? "bg-white/[0.07]" : "bg-black/[0.055]"
        }`}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${width}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ActivityChart({ items, dark }) {
  const rows = Array.isArray(items) ? items.slice(-6) : [];

  const maxValue = Math.max(
    1,
    ...rows.flatMap((item) => [
      Number(item.bounties) || 0,
      Number(item.submissions) || 0,
      Number(item.rewards) || 0,
    ])
  );

  if (!rows.length) {
    return (
      <EmptyState
        dark={dark}
        icon={FiBarChart2}
        title="Your activity will appear here"
        description="Monthly activity data will be displayed when available from analytics."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {[
          { label: "Bounties", color: "#00D6A0" },
          { label: "Submissions", color: "#60A5FA" },
          { label: "Rewards", color: "#FBBF24" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <span
              className={`text-[10px] ${
                dark ? "text-white/50" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {rows.map((item, index) => {
          const values = [
            {
              label: "Bounties",
              value: Number(item.bounties) || 0,
              color: "#00D6A0",
            },
            {
              label: "Submissions",
              value: Number(item.submissions) || 0,
              color: "#60A5FA",
            },
            {
              label: "Rewards",
              value: Number(item.rewards) || 0,
              color: "#FBBF24",
            },
          ];

          return (
            <div
              key={`${item.month || "month"}-${index}`}
              className="space-y-2"
            >
              <div
                className={`text-xs font-bold ${
                  dark ? "text-white/75" : "text-gray-700"
                }`}
              >
                {item.month || `Period ${index + 1}`}
              </div>

              <div className="space-y-2">
                {values.map((entry) => (
                  <div
                    key={entry.label}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`w-[76px] shrink-0 text-[9px] ${
                        dark ? "text-white/40" : "text-gray-500"
                      }`}
                    >
                      {entry.label}
                    </span>

                    <div
                      className={`h-2 min-w-0 flex-1 overflow-hidden rounded-full ${
                        dark ? "bg-white/[0.06]" : "bg-black/[0.045]"
                      }`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            100,
                            (entry.value / maxValue) * 100
                          )}%`,
                          backgroundColor: entry.color,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-[10px] font-semibold">
                      {number(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics({ dark = true, setDark }) {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [role, setRole] = useState("contributor");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const platform = role === "platform";

  // Show the scroll-to-top button after the user scrolls down.
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

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

  const endpoint = useMemo(() => {
    if (!API_URL) return "";

    if (platform) return `${API_URL}/analytics/platform`;

    if (!address) return "";

    return `${API_URL}/analytics/${role}/${address}`;
  }, [platform, role, address]);

  const fetchAnalytics = useCallback(
    async (isRefresh = false) => {
      if (!endpoint) {
        setData(null);
        setError(
          !API_URL
            ? "The API URL is not configured."
            : "Connect your wallet to view personal analytics."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await axios.get(endpoint);
        setData(response.data || {});
      } catch (err) {
        console.error("Error fetching analytics:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load analytics right now. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!endpoint) {
        setData(null);
        setError(
          !API_URL
            ? "The API URL is not configured."
            : "Connect your wallet to view personal analytics."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(endpoint);

        if (active) setData(response.data || {});
      } catch (err) {
        console.error("Error fetching analytics:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load analytics right now. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [endpoint]);

  const overview = data?.overview || {};
  const submissions = data?.submissions || {};
  const rewards = data?.rewards || {};

  const assignedRewards = Number(rewards.assigned) || 0;
  const claimedRewards = Number(rewards.claimed) || 0;

  const claimedPercentage =
    assignedRewards > 0
      ? Math.min(100, (claimedRewards / assignedRewards) * 100)
      : 0;

  const activity = Array.isArray(data?.recentActivity)
    ? data.recentActivity
    : [];

  const categories = Array.isArray(data?.categories)
    ? data.categories
    : [];

  const monthlyActivity = Array.isArray(data?.monthlyActivity)
    ? data.monthlyActivity
    : [];

  const statusData = platform
    ? data?.bountyStatus || {}
    : submissions;

  const statusEntries = Object.entries(statusData).filter(
    ([, value]) => Number.isFinite(Number(value))
  );

  const totalSubmissions =
    Number(overview.totalSubmissions) ||
    Number(submissions.accepted || 0) +
      Number(submissions.pending || 0) +
      Number(submissions.rejected || 0);

  const successRate = Number(overview.successRate) || 0;

  const metrics = platform
    ? [
        {
          label: "Total bounties",
          value: number(overview.totalBounties),
          description: "Bounties recorded across the platform",
          icon: FiLayers,
          footer: "Platform overview",
        },
        {
          label: "Active bounties",
          value: number(overview.activeBounties),
          description: "Currently active opportunities",
          icon: FiZap,
          featured: true,
          footer: "Active opportunities",
        },
        {
          label: "Contributors",
          value: number(overview.uniqueContributors),
          description: "Unique contributors recorded",
          icon: FiUsers,
          footer: "Community activity",
        },
        {
          label: "Creators",
          value: number(overview.uniqueCreators),
          description: "Unique bounty creators recorded",
          icon: FiTarget,
          footer: "Creator activity",
        },
        {
          label: "Submissions",
          value: number(overview.totalSubmissions),
          description: "Total submissions recorded",
          icon: FiActivity,
          footer: "Submission activity",
        },
        {
          label: "Success rate",
          value: percent(successRate),
          description: "Reported success rate from analytics",
          icon: FiTrendingUp,
          featured: true,
          footer: "Reported metric",
        },
      ]
    : role === "creator"
      ? [
          {
            label: "Bounties created",
            value: number(overview.bountiesCreated),
            description: "Bounties created by your account",
            icon: FiLayers,
            featured: true,
            footer: "Creator activity",
          },
          {
            label: "Active bounties",
            value: number(overview.activeBounties),
            description: "Your active bounty opportunities",
            icon: FiZap,
            footer: "Current activity",
          },
          {
            label: "Submissions",
            value: number(overview.totalSubmissions),
            description: "Submissions on your bounties",
            icon: FiActivity,
            footer: "Work received",
          },
          {
            label: "Reward budget",
            value: amount(overview.totalRewardBudget),
            description: "Total reward budget reported",
            icon: FiDollarSign,
            featured: true,
            footer: "Reward overview",
          },
          {
            label: "Rewards claimed",
            value: amount(
              overview.totalRewardsClaimed ??
                overview.rewardsClaimed ??
                overview.totalClaimedAmount
            ),
            description: "Claimed rewards reported by analytics",
            icon: FiCheckCircle,
            footer: "Claim activity",
          },
          {
            label: "Success rate",
            value: percent(successRate),
            description: "Reported success rate from analytics",
            icon: FiTrendingUp,
            footer: "Reported metric",
          },
        ]
      : [
          {
            label: "Contributions",
            value: number(overview.totalContributions),
            description: "Contributions recorded for your account",
            icon: FiActivity,
            featured: true,
            footer: "Your activity",
          },
          {
            label: "Submissions",
            value: number(overview.totalSubmissions),
            description: "Total submissions recorded",
            icon: FiLayers,
            footer: "Submission activity",
          },
          {
            label: "Accepted",
            value: number(submissions.accepted),
            description: "Submissions accepted or approved",
            icon: FiCheckCircle,
            footer: "Approved work",
          },
          {
            label: "Pending",
            value: number(submissions.pending),
            description: "Submissions awaiting review",
            icon: FiClock,
            footer: "Awaiting review",
          },
          {
            label: "Rewards claimed",
            value: amount(
              overview.claimedAmount ??
                overview.totalClaimedAmount ??
                rewards.claimed
            ),
            description: "Claimed reward amount reported",
            icon: FiDollarSign,
            featured: true,
            footer: "Reward overview",
          },
          {
            label: "Success rate",
            value: percent(successRate),
            description: "Reported success rate from analytics",
            icon: FiTrendingUp,
            footer: "Reported metric",
          },
        ];

  const pageTitle = platform
    ? "Platform analytics"
    : role === "creator"
      ? "Creator analytics"
      : "Contributor analytics";

  const pageDescription = platform
    ? "Understand platform activity, participation, and bounty performance."
    : role === "creator"
      ? "Track your bounties, submissions, and reward distribution."
      : "See your contributions, submission progress, and claimed rewards.";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#080908] text-white" : "bg-[#f6f5ef] text-[#252721]"
      }`}
    >
      <NavBar dark={dark} setDark={setDark} />

      <main className="mx-auto w-full max-w-[1500px] px-3 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-10">
        {/* Header */}
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-[#00D6A0]/15 bg-gradient-to-br from-[#00D6A0]/[0.09] via-transparent to-transparent p-5 sm:mb-9 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#00D6A0]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <Eyebrow>YOUR DATA / YOUR PROGRESS</Eyebrow>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                {pageTitle}
                <span className="text-[#00D6A0]">.</span>
              </h1>

              <p
                className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 ${
                  dark ? "text-white/50" : "text-gray-500"
                }`}
              >
                {pageDescription}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-semibold sm:text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/[0.08] px-3 py-2 text-[#00A87D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
                  Analytics overview
                </span>

                <span
                  className={`rounded-full border px-3 py-2 ${
                    dark
                      ? "border-white/10 text-white/50"
                      : "border-black/[0.07] text-gray-500"
                  }`}
                >
                  {platform
                    ? "Platform-wide data"
                    : isConnected
                      ? "Wallet connected"
                      : "Wallet not connected"}
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-end">
              {/* Role selector: compact inline buttons */}
              <div
                className={`flex w-fit max-w-full flex-wrap items-center gap-1 rounded-2xl border p-1 ${
                  dark
                    ? "border-white/10 bg-black/20"
                    : "border-black/[0.07] bg-white/80"
                }`}
              >
                {[
                  { value: "contributor", label: "Contributor" },
                  { value: "creator", label: "Creator" },
                  { value: "platform", label: "Platform" },
                ].map((item) => {
                  const active = role === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      aria-pressed={active}
                      className={`shrink-0 rounded-xl px-3 py-2.5 text-[10px] font-bold transition duration-200 sm:px-4 sm:text-xs ${
                        active
                          ? "bg-[#00D6A0] text-[#06271D] shadow-sm"
                          : dark
                            ? "text-white/55 hover:bg-white/[0.06] hover:text-white"
                            : "text-gray-500 hover:bg-black/[0.04] hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Navigation and refresh actions */}
              <div className="flex w-fit max-w-full flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className={`inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-bold transition duration-200 hover:border-[#00D6A0]/40 hover:text-[#00A87D] sm:px-4 sm:text-xs ${
                    dark
                      ? "border-white/10 bg-white/[0.035] text-white/80"
                      : "border-black/[0.08] bg-white text-gray-700"
                  }`}
                >
                  <FiArrowLeft />
                  Back to Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => fetchAnalytics(true)}
                  disabled={loading || refreshing}
                  className={`inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-bold transition hover:border-[#00D6A0]/40 hover:text-[#00A87D] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-xs ${
                    dark
                      ? "border-white/10 bg-white/[0.035]"
                      : "border-black/[0.08] bg-white"
                  }`}
                >
                  <FiRefreshCw
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh data"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            className={`mb-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              dark
                ? "border-red-500/20 bg-red-500/[0.06] text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <FiXCircle className="mt-0.5 shrink-0 text-lg" />

              <div>
                <p className="text-sm font-bold">Analytics unavailable</p>
                <p className="mt-1 text-xs leading-5 opacity-80">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchAnalytics(true)}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-current/20 px-3 py-2 text-xs font-bold transition hover:bg-black/5"
            >
              <FiRefreshCw />
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`min-w-0 animate-pulse rounded-2xl border p-3 sm:rounded-3xl sm:p-5 ${
                    dark
                      ? "border-white/[0.07] bg-[#111311]"
                      : "border-black/[0.06] bg-white"
                  }`}
                >
                  <div className="h-3 w-3/4 rounded bg-current/10" />
                  <div className="mt-5 h-7 w-2/3 rounded bg-current/10 sm:h-9" />
                  <div className="mt-4 h-2 w-full rounded bg-current/10" />
                  <div className="mt-2 h-2 w-4/5 rounded bg-current/10" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className={`h-64 animate-pulse rounded-3xl border ${
                    dark
                      ? "border-white/[0.07] bg-[#111311]"
                      : "border-black/[0.06] bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Metrics: three per row, including on mobile */}
            <section className="mb-8 sm:mb-10">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
                <div>
                  <Eyebrow>01 / PERFORMANCE</Eyebrow>
                  <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                    At a glance
                  </h2>
                </div>

                <span
                  className={`text-[10px] sm:text-xs ${
                    dark ? "text-white/40" : "text-gray-500"
                  }`}
                >
                  {metrics.length} key metrics
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 xl:grid-cols-3">
                {metrics.map((item) => (
                  <MetricCard key={item.label} dark={dark} {...item} />
                ))}
              </div>
            </section>

            {/* Rewards */}
            <section className="mb-6 sm:mb-8">
              <Card dark={dark} accent>
                <SectionTitle
                  number="02"
                  label="Rewards"
                  title="Value in motion"
                  dark={dark}
                />

                <p
                  className={`mb-5 max-w-2xl text-xs leading-5 sm:mb-7 sm:text-sm ${
                    dark ? "text-white/45" : "text-gray-500"
                  }`}
                >
                  Track reward counts assigned and claimed in your existing
                  analytics data.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div
                    className={`min-w-0 rounded-2xl border p-3 sm:p-5 ${
                      dark
                        ? "border-white/[0.08] bg-white/[0.025]"
                        : "border-black/[0.06] bg-[#f8faf8]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00A87D]">
                        <FiDollarSign />
                      </div>

                      <span
                        className={`text-[10px] font-semibold leading-4 sm:text-xs ${
                          dark ? "text-white/55" : "text-gray-500"
                        }`}
                      >
                        Assigned rewards
                      </span>
                    </div>

                    <p className="mt-4 break-words text-2xl font-black tracking-tight sm:text-3xl">
                      {number(assignedRewards)}
                    </p>

                    <p
                      className={`mt-2 text-[10px] leading-4 sm:text-xs ${
                        dark ? "text-white/40" : "text-gray-500"
                      }`}
                    >
                      Rewards assigned in analytics
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.07] p-3 sm:p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/15 text-[#00A87D]">
                        <FiCheckCircle />
                      </div>

                      <span
                        className={`text-[10px] font-semibold leading-4 sm:text-xs ${
                          dark ? "text-white/65" : "text-gray-600"
                        }`}
                      >
                        Claimed rewards
                      </span>
                    </div>

                    <p className="mt-4 break-words text-2xl font-black tracking-tight text-[#00A87D] sm:text-3xl">
                      {number(claimedRewards)}
                    </p>

                    <p
                      className={`mt-2 text-[10px] leading-4 sm:text-xs ${
                        dark ? "text-white/45" : "text-gray-500"
                      }`}
                    >
                      Rewards claimed
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-5 rounded-2xl border p-4 sm:p-5 ${
                    dark
                      ? "border-white/[0.07] bg-black/10"
                      : "border-black/[0.05] bg-white"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold">Claim progress</p>

                      <p
                        className={`mt-1 text-[10px] ${
                          dark ? "text-white/40" : "text-gray-500"
                        }`}
                      >
                        Claimed rewards compared with assigned rewards
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-black text-[#00A87D]">
                      {percent(claimedPercentage)}
                    </span>
                  </div>

                  <div
                    className={`h-2.5 overflow-hidden rounded-full ${
                      dark ? "bg-white/[0.08]" : "bg-black/[0.06]"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-[#00D6A0] transition-all duration-700"
                      style={{ width: `${claimedPercentage}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
                    <span className={dark ? "text-white/40" : "text-gray-500"}>
                      {number(claimedRewards)} claimed
                    </span>

                    <span className={dark ? "text-white/40" : "text-gray-500"}>
                      {number(Math.max(0, assignedRewards - claimedRewards))}{" "}
                      remaining
                    </span>
                  </div>
                </div>
              </Card>
            </section>

            {/* Activity + categories */}
            <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2 sm:mb-8">
              <Card dark={dark}>
                <SectionTitle
                  number="03"
                  label="Activity"
                  title="Recent activity"
                  dark={dark}
                />

                {activity.length ? (
                  <div className="space-y-2">
                    {activity.slice(0, 8).map((item, index) => {
                      const status = statusConfig(item.status);
                      const StatusIcon = status.icon;

                      return (
                        <article
                          key={item.id ?? `${item.title || "activity"}-${index}`}
                          className={`flex min-w-0 items-start gap-3 rounded-2xl border p-3 transition hover:border-[#00D6A0]/25 sm:p-4 ${
                            dark
                              ? "border-white/[0.06] bg-white/[0.02]"
                              : "border-black/[0.045] bg-[#fafbf9]"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#00A87D]">
                            <FiActivity />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-xs font-bold leading-5 sm:text-sm">
                              {item.title || item.type || "Activity update"}
                            </p>

                            <p
                              className={`mt-1 text-[10px] ${
                                dark ? "text-white/40" : "text-gray-500"
                              }`}
                            >
                              {dateLabel(item.date)}
                            </p>

                            {item.amount !== undefined &&
                              item.amount !== null && (
                                <p className="mt-2 text-xs font-bold text-[#00A87D]">
                                  {amount(item.amount)}
                                </p>
                              )}
                          </div>

                          <span
                            className={`inline-flex max-w-[42%] shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold sm:px-2.5 sm:text-[10px] ${status.style}`}
                          >
                            <StatusIcon className="shrink-0" />
                            <span className="break-words">
                              {status.label}
                            </span>
                          </span>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    dark={dark}
                    icon={FiActivity}
                    title="No recent activity yet"
                    description="When activity is recorded by analytics, your latest updates will appear here."
                  />
                )}
              </Card>

              <Card dark={dark}>
                <SectionTitle
                  number="04"
                  label="Categories"
                  title="Where activity happens"
                  dark={dark}
                />

                {categories.length ? (
                  <div className="space-y-5">
                    <div
                      className={`flex items-center gap-3 rounded-2xl border p-4 ${
                        dark
                          ? "border-white/[0.06] bg-white/[0.02]"
                          : "border-black/[0.045] bg-[#fafbf9]"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-lg text-[#00A87D]">
                        <FiTarget />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">
                          {categories.length} categories
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${
                            dark ? "text-white/40" : "text-gray-500"
                          }`}
                        >
                          Categories returned by analytics
                        </p>
                      </div>
                    </div>

                    {categories.slice(0, 8).map((item, index) => {
                      const total = Math.max(
                        1,
                        ...categories.map((category) =>
                          Number(category.count) || 0
                        )
                      );

                      return (
                        <BarRow
                          key={`${item.name || "category"}-${index}`}
                          label={item.name || "Other"}
                          value={item.count}
                          total={total}
                          dark={dark}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    dark={dark}
                    icon={FiTarget}
                    title="No category data yet"
                    description="Category breakdowns will appear here when the API returns category activity."
                  />
                )}
              </Card>
            </section>

            {/* Monthly activity + status breakdown */}
            <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2 sm:mb-8">
              <Card dark={dark}>
                <SectionTitle
                  number="05"
                  label="Trends"
                  title="Activity over time"
                  dark={dark}
                />

                <p
                  className={`mb-5 text-xs leading-5 ${
                    dark ? "text-white/45" : "text-gray-500"
                  }`}
                >
                  Monthly bounties, submissions, and rewards using the data
                  supplied by your analytics API.
                </p>

                <ActivityChart items={monthlyActivity} dark={dark} />
              </Card>

              <Card dark={dark}>
                <SectionTitle
                  number="06"
                  label="Breakdown"
                  title={platform ? "Bounty status" : "Submission status"}
                  dark={dark}
                />

                <div
                  className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${
                    dark
                      ? "border-white/[0.06] bg-white/[0.02]"
                      : "border-black/[0.045] bg-[#fafbf9]"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-lg text-[#00A87D]">
                    <FiBarChart2 />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      {number(totalSubmissions)} total submissions
                    </p>

                    <p
                      className={`mt-1 text-[10px] ${
                        dark ? "text-white/40" : "text-gray-500"
                      }`}
                    >
                      {platform
                        ? "Status metrics from platform analytics"
                        : "Status metrics from your analytics"}
                    </p>
                  </div>
                </div>

                {statusEntries.length ? (
                  <div className="space-y-5">
                    {statusEntries.map(([key, value]) => {
                      const config = statusConfig(key);

                      const color = key.toLowerCase().includes("reject")
                        ? "#EF4444"
                        : key.toLowerCase().includes("pending")
                          ? "#F59E0B"
                          : key.toLowerCase().includes("accept") ||
                              key.toLowerCase().includes("approv") ||
                              key.toLowerCase().includes("complete")
                            ? "#22C55E"
                            : ACCENT;

                      return (
                        <BarRow
                          key={key}
                          label={config.label}
                          value={value}
                          total={Math.max(
                            1,
                            ...statusEntries.map((entry) =>
                              Number(entry[1]) || 0
                            )
                          )}
                          dark={dark}
                          color={color}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    dark={dark}
                    icon={FiLayers}
                    title="No status breakdown yet"
                    description="Status totals will appear here when your analytics endpoint returns them."
                  />
                )}

                <div
                  className={`mt-6 grid grid-cols-3 gap-2 border-t pt-5 ${
                    dark ? "border-white/[0.08]" : "border-black/[0.06]"
                  }`}
                >
                  {[
                    {
                      label: "Accepted",
                      value: submissions.accepted,
                      color: "text-green-500",
                    },
                    {
                      label: "Pending",
                      value: submissions.pending,
                      color: "text-amber-500",
                    },
                    {
                      label: "Rejected",
                      value: submissions.rejected,
                      color: "text-red-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`min-w-0 rounded-xl p-2.5 sm:p-3 ${
                        dark ? "bg-white/[0.035]" : "bg-[#f7f8f5]"
                      }`}
                    >
                      <p
                        className={`break-words text-[9px] font-semibold sm:text-[10px] ${
                          dark ? "text-white/45" : "text-gray-500"
                        }`}
                      >
                        {item.label}
                      </p>

                      <p
                        className={`mt-2 text-lg font-black sm:text-xl ${item.color}`}
                      >
                        {number(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Summary footer */}
            <section
              className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 ${
                dark
                  ? "border-white/[0.08] bg-[#111311]"
                  : "border-black/[0.06] bg-white"
              }`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00D6A0]/10 text-xl text-[#00A87D]">
                    <FiTrendingUp />
                  </div>

                  <div className="min-w-0">
                    <Eyebrow>YOUR NEXT STEP</Eyebrow>

                    <h2 className="mt-2 text-lg font-black tracking-tight">
                      Keep your momentum going.
                    </h2>

                    <p
                      className={`mt-1 max-w-xl text-xs leading-5 ${
                        dark ? "text-white/45" : "text-gray-500"
                      }`}
                    >
                      Use your activity and submission status to understand
                      what has been completed and what still needs attention.
                    </p>
                  </div>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] px-4 py-3 text-xs font-bold text-[#00A87D]">
                  <FiCheckCircle />
                  Analytics overview
                  <FiArrowUpRight />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />

      {/* Floating scroll-to-top button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className={`fixed bottom-5 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#00D6A0]/30 bg-[#00D6A0] text-xl text-[#06271D] shadow-lg shadow-[#00D6A0]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00D6A0]/30 focus:outline-none focus:ring-2 focus:ring-[#00D6A0] focus:ring-offset-2 sm:bottom-7 sm:right-7 sm:h-12 sm:w-12 ${
          showScrollTop
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-90 opacity-0"
        }`}
      >
        <FiChevronUp />
      </button>
    </div>
  );
}
