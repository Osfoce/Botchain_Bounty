import { useEffect, useState } from "react";
import {
  FiActivity,
  FiArrowUpRight,
  FiCheckCircle,
  FiDollarSign,
  FiLayers,
  FiUsers,
  FiZap,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const INITIAL_STATS = {
  bountiesCreated: null,
  bountiesCompleted: null,
  totalPaid: null,
  contributors: null,
};

const STAT_ITEMS = [
  {
    key: "bountiesCompleted",
    label: "Bounties Completed",
    description: "Tasks completed successfully",
    icon: FiCheckCircle,
    tag: "COMPLETED WORK",
    format: (val) => Number(val).toLocaleString(),
  },
  {
    key: "totalPaid",
    label: "Rewards Paid Out",
    description: "Reward units delivered across supported networks",
    icon: FiDollarSign,
    tag: "REWARDS DISTRIBUTED",
    format: (val) =>
      `${Number(val).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
  },
  {
    key: "contributors",
    label: "Contributors",
    description: "People participating in bounties",
    icon: FiUsers,
    tag: "COMMUNITY",
    format: (val) => Number(val).toLocaleString(),
  },
  {
    key: "bountiesCreated",
    label: "Bounties Created",
    description: "Opportunities published",
    icon: FiLayers,
    tag: "OPPORTUNITIES",
    format: (val) => Number(val).toLocaleString(),
  },
];

export default function ImpactStats() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        if (!API_URL) throw new Error("VITE_API_URL is not configured");

        const response = await fetch(`${API_URL}/bounty/stats`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to load stats");

        const data = await response.json();

        setStats({
          bountiesCreated: data.bountiesCreated ?? 0,
          bountiesCompleted: data.bountiesCompleted ?? 0,
          totalPaid: data.totalPaid ?? 0,
          contributors: data.contributors ?? 0,
        });
        setHasError(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load Happy Bounty statistics:", error);
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => controller.abort();
  }, []);

  return (
    <section
      id="impact"
      className="relative isolate overflow-hidden bg-[#F6F5EF] py-20 text-[#17211B] transition-colors duration-300 dark:bg-[#080908] dark:text-white sm:py-24 lg:py-28"
    >
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,138,102,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,138,102,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[min(700px,100%)] -translate-x-1/2 rounded-full bg-[#00D6A0]/10 blur-[120px] dark:bg-[#00D6A0]/[0.07]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#008A66]/20 bg-[#008A66]/[0.06] px-4 py-2 dark:border-[#00D6A0]/20 dark:bg-[#00D6A0]/[0.06]">
            <FiActivity
              size={14}
              className="text-[#008A66] dark:text-[#00D6A0]"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#008A66] dark:text-[#00D6A0] sm:text-[11px]">
              The impact so far
            </span>
          </div>

          <h2 className="text-4xl font-bold leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            Real work.
            <br className="sm:hidden" />{" "}
            <span className="text-[#008A66] dark:text-[#00D6A0]">
              Real rewards.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base sm:leading-8">
            Every bounty creates an opportunity to contribute, demonstrate your
            skills, and earn rewards. Here’s a snapshot of activity across Happy
            Bounty.
          </p>
        </div>

        {/* Small platform label */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#008A66] dark:bg-[#00D6A0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
              Platform overview
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            <span>Multi-network</span>
            <span className="h-1 w-1 rounded-full bg-[#00D6A0]" />
            <span>Native rewards</span>
          </div>
        </div>

        {/* Statistics grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STAT_ITEMS.map((item, index) => {
            const value = stats[item.key];
            const Icon = item.icon;

            return (
              <article
                key={item.key}
                className="group relative flex min-h-[235px] flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#008A66]/30 hover:shadow-xl hover:shadow-[#008A66]/[0.06] dark:border-white/[0.09] dark:bg-[#101410] dark:hover:border-[#00D6A0]/30 dark:hover:shadow-[#00D6A0]/[0.04] sm:p-6"
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#008A66] to-[#00D6A0] transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#008A66]/15 bg-[#008A66]/[0.06] text-[#008A66] transition-colors duration-300 group-hover:bg-[#008A66]/10 dark:border-[#00D6A0]/20 dark:bg-[#00D6A0]/[0.06] dark:text-[#00D6A0] dark:group-hover:bg-[#00D6A0]/[0.12]">
                    <Icon size={19} strokeWidth={1.8} />
                  </div>

                  <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-400 dark:text-gray-600">
                    0{index + 1}
                  </span>
                </div>

                <div className="mt-7">
                  <p
                    aria-live="polite"
                    className="break-words text-2xl font-bold leading-tight tracking-[-0.04em] text-[#008A66] dark:text-[#00D6A0] sm:text-3xl"
                  >
                    {loading ? (
                      <span className="inline-block h-8 w-20 animate-pulse rounded-md bg-[#008A66]/10 dark:bg-[#00D6A0]/10" />
                    ) : hasError ? (
                      "—"
                    ) : (
                      item.format(value)
                    )}
                  </p>

                  <h3 className="mt-3 text-base font-bold tracking-tight">
                    {item.label}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400 sm:text-[13px]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/[0.07] pt-4 dark:border-white/[0.08]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-500">
                    {item.tag}
                  </span>

                  <FiArrowUpRight
                    size={14}
                    className="shrink-0 text-gray-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#008A66] dark:group-hover:text-[#00D6A0]"
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom message */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-white/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#008A66]/[0.07] text-[#008A66] dark:bg-[#00D6A0]/[0.08] dark:text-[#00D6A0]">
              <FiZap size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Every contribution counts.
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Discover a bounty and put your skills to work.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasError ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Statistics are temporarily unavailable.
              </span>
            ) : loading ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Loading platform statistics...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FiCheckCircle
                  size={14}
                  className="text-[#008A66] dark:text-[#00D6A0]"
                />
                Platform statistics
              </span>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] leading-5 text-gray-400 dark:text-gray-600">
          Statistics are aggregated from platform data across supported
          networks. Reward amounts are shown in native units and are not
          converted between tokens.
        </p>
      </div>
    </section>
  );
}