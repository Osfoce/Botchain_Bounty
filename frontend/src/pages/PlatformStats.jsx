
import { useEffect, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiCode,
  FiDollarSign,
  FiLayers,
  FiZap,
  FiTarget,
  FiUsers,
  FiShield,
} from "react-icons/fi";

import botLogo from "../assets/images/bot.png";
import arcLogo from "../assets/images/arc.png";

const networks = [
  {
    name: "Arc",
    symbol: "ARC",
    image: arcLogo,
    description: "Stablecoin-powered blockchain ecosystem",
    accent: "#00D6A0",
  },
  {
    name: "BOTCHAIN",
    symbol: "BOT",
    image: botLogo,
    description: "Built for the next generation of Web3",
    accent: "#00D6A0",
  },
];

const platformHighlights = [
  {
    icon: FiLayers,
    value: "2 ECOSYSTEMS",
    label: "Focused Network Support",
    description:
      "Explore bounty opportunities across the Arc and BOTCHAIN ecosystems from one platform.",
  },
  {
    icon: FiDollarSign,
    value: "REWARDS",
    label: "Earn for Your Work",
    description:
      "Complete tasks, submit your work, and receive rewards when your contributions are approved.",
  },
  {
    icon: FiCode,
    value: "WEB3",
    label: "Built for Contributors",
    description:
      "Connect your wallet and participate in tasks created for blockchain communities.",
  },
  {
    icon: FiZap,
    value: "24/7",
    label: "Discover Opportunities",
    description:
      "Find bounties, demonstrate your skills, and build your reputation through meaningful work.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Discover",
    description: "Explore available bounties on Arc and BOTCHAIN.",
  },
  {
    number: "02",
    title: "Contribute",
    description: "Complete a task and submit your work for review.",
  },
  {
    number: "03",
    title: "Earn",
    description: "Receive the bounty reward after approval.",
  },
];

export default function PlatformStats() {
  const sectionRef = useRef(null);

  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  const [isVisible, setIsVisible] = useState(false);

  // Detect theme changes.
  useEffect(() => {
    const updateTheme = () => {
      setDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Reveal the section when it enters the viewport.
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(section);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const theme = dark
    ? {
        text: "text-white",
        muted: "text-white/50",
        card: "border-white/[0.09] bg-[#111411]",
        panel: "border-white/[0.09] bg-white/[0.025]",
        subtle: "border-white/[0.08] bg-white/[0.035]",
        divider: "border-white/[0.08]",
      }
    : {
        text: "text-[#171a18]",
        muted: "text-[#6c716d]",
        card: "border-black/[0.07] bg-white",
        panel: "border-black/[0.07] bg-white/80",
        subtle: "border-black/[0.07] bg-white/80",
        divider: "border-black/[0.08]",
      };

  return (
    <section
      ref={sectionRef}
      className={`platform-overview relative isolate w-full overflow-hidden ${
        dark ? "platform-overview-dark" : "platform-overview-light"
      } ${isVisible ? "platform-visible" : ""}`}
    >
      <style>{`
        .platform-overview {
          --platform-accent: #00D6A0;
          --platform-accent-dark: #008A66;
          transition: background 300ms ease, color 300ms ease;
        }

        .platform-overview-dark {
          background:
            radial-gradient(ellipse at 50% 0%, rgba(0,214,160,.09), transparent 38%),
            linear-gradient(180deg, #080908 0%, #0b0e0b 55%, #080908 100%);
          color: #fff;
        }

        .platform-overview-light {
          background:
            radial-gradient(ellipse at 50% 0%, rgba(0,138,102,.08), transparent 38%),
            linear-gradient(180deg, #f6f5ef 0%, #ffffff 55%, #f6f5ef 100%);
          color: #171a18;
        }

        /* Background grid */
        .platform-overview-grid {
          background-image:
            linear-gradient(rgba(0,214,160,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,214,160,.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 80%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 80%);
          animation: platformGridDrift 35s linear infinite;
        }

        .platform-overview-light .platform-overview-grid {
          background-image:
            linear-gradient(rgba(0,100,70,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,100,70,.035) 1px, transparent 1px);
        }

        @keyframes platformGridDrift {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 56px 56px;
          }
        }

        /* Ambient background movement */
        .platform-ambient {
          animation: platformAmbientFloat 12s ease-in-out infinite alternate;
        }

        .platform-ambient-secondary {
          animation: platformAmbientFloat 16s ease-in-out infinite alternate-reverse;
        }

        @keyframes platformAmbientFloat {
          from {
            transform: translate3d(0, 0, 0) scale(.95);
          }
          to {
            transform: translate3d(18px, 22px, 0) scale(1.08);
          }
        }

        .platform-overview-inner {
          width: 100%;
          max-width: 1600px;
          margin-inline: auto;
          padding-inline: clamp(18px, 4.5vw, 72px);
        }

        .platform-overview-gradient {
          background: linear-gradient(100deg, #008A66, #00D6A0 55%, #75E8C7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Scroll reveal */
        .platform-overview-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 800ms cubic-bezier(.22,1,.36,1),
            transform 800ms cubic-bezier(.22,1,.36,1);
          transition-delay: var(--reveal-delay, 0ms);
        }

        .platform-visible .platform-overview-reveal {
          opacity: 1;
          transform: translateY(0);
        }

        .platform-overview-scale {
          opacity: 0;
          transform: translateY(32px) scale(.97);
          transition:
            opacity 800ms cubic-bezier(.22,1,.36,1),
            transform 800ms cubic-bezier(.22,1,.36,1),
            border-color 300ms ease,
            box-shadow 300ms ease;
          transition-delay: var(--reveal-delay, 0ms);
        }

        .platform-visible .platform-overview-scale {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Cards */
        .platform-overview-card {
          position: relative;
          overflow: hidden;
          min-width: 0;
          transition:
            transform 300ms ease,
            border-color 300ms ease,
            box-shadow 300ms ease;
        }

        .platform-overview-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0,214,160,.35);
          box-shadow: 0 20px 55px rgba(0,0,0,.12);
        }

        .platform-overview-dark .platform-overview-card:hover {
          box-shadow: 0 20px 55px rgba(0,0,0,.25);
        }

        .platform-overview-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 20px;
          right: 20px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,214,160,.6), transparent);
          opacity: .6;
          transition: opacity 300ms ease;
        }

        .platform-overview-card:hover::before {
          opacity: 1;
        }

        .platform-card-icon {
          transition:
            transform 350ms cubic-bezier(.22,1,.36,1),
            background-color 300ms ease,
            box-shadow 300ms ease;
        }

        .platform-overview-card:hover .platform-card-icon {
          transform: translateY(-3px) scale(1.07);
          box-shadow: 0 8px 24px rgba(0,214,160,.12);
        }

        .platform-card-arrow {
          transition: transform 300ms ease;
        }

        .platform-overview-card:hover .platform-card-arrow {
          transform: translate(3px, -3px);
        }

        /* Network logo */
        .platform-network-logo {
          transition:
            transform 350ms cubic-bezier(.22,1,.36,1),
            box-shadow 350ms ease;
        }

        .platform-overview-card:hover .platform-network-logo {
          transform: scale(1.06) rotate(-3deg);
        }

        /* Workflow */
        .platform-workflow-step {
          transition:
            transform 300ms ease,
            border-color 300ms ease,
            background-color 300ms ease;
        }

        .platform-workflow-step:hover {
          transform: translateY(-4px);
          border-color: rgba(0,214,160,.35);
        }

        .platform-workflow-number {
          transition: transform 300ms ease;
        }

        .platform-workflow-step:hover .platform-workflow-number {
          transform: translateX(3px);
        }

        /* Workflow panel */
        .platform-workflow-panel {
          transition:
            border-color 300ms ease,
            box-shadow 300ms ease,
            transform 300ms ease;
        }

        .platform-workflow-panel:hover {
          border-color: rgba(0,214,160,.25);
          box-shadow: 0 16px 45px rgba(0,0,0,.08);
        }

        /* Footer */
        .platform-footer {
          transition: border-color 300ms ease;
        }

        .platform-footer-icon {
          transition: transform 350ms ease;
        }

        .platform-footer:hover .platform-footer-icon {
          transform: rotate(8deg) scale(1.08);
        }

        /* Network ticker */
        .platform-network-track {
          display: flex;
          width: max-content;
          animation: platformNetworkScroll 28s linear infinite;
          will-change: transform;
        }

        .platform-network-group {
          display: flex;
          flex: none;
          align-items: center;
        }

        .platform-network-item {
          display: flex;
          flex: none;
          align-items: center;
          gap: 12px;
          padding: 0 28px;
          white-space: nowrap;
        }

        .platform-network-ticker:hover .platform-network-track {
          animation-play-state: paused;
        }

        @keyframes platformNetworkScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (min-width: 1024px) {
          .platform-network-item {
            gap: 16px;
            padding-inline: 42px;
          }
        }

        @media (max-width: 767px) {
          .platform-overview-grid {
            background-size: 40px 40px;
          }

          .platform-overview-card:hover,
          .platform-workflow-step:hover {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .platform-overview-grid,
          .platform-ambient,
          .platform-ambient-secondary,
          .platform-network-track {
            animation: none !important;
          }

          .platform-overview-reveal,
          .platform-overview-scale,
          .platform-overview-reveal.is-visible {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }

          .platform-overview-card,
          .platform-workflow-step,
          .platform-workflow-panel {
            transition: none !important;
          }
        }
      `}</style>

      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="platform-overview-grid absolute inset-0 opacity-70" />

        <div className="platform-ambient absolute -left-40 top-24 h-80 w-80 rounded-full bg-[#00D6A0]/[0.07] blur-[110px]" />

        <div className="platform-ambient-secondary absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-[#00D6A0]/[0.05] blur-[120px]" />
      </div>

      <div className="platform-overview-inner relative py-16 sm:py-20 lg:py-28">

        {/* Hero */}
        <header className="platform-overview-reveal mx-auto max-w-4xl text-center">
          <div
            className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${
              dark
                ? "border-[#00D6A0]/20 bg-[#00D6A0]/[0.06]"
                : "border-[#008A66]/20 bg-[#008A66]/[0.06]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D6A0] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[#00D6A0]" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#008A66] sm:text-xs">
              Happy Bounty Ecosystem
            </span>
          </div>

          <h2
            className={`text-3xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-4xl md:text-5xl lg:text-6xl ${
              dark ? "text-white" : "text-[#171a18]"
            }`}
          >
            Your skills.
            <br className="hidden sm:block" />{" "}
            <span className="platform-overview-gradient">
              Real opportunities.
            </span>
          </h2>

          <p
            className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:mt-6 sm:text-base lg:text-lg ${
              dark ? "text-white/55" : "text-[#666c67]"
            }`}
          >
            Happy Bounty connects creators and contributors across Arc and
            BOTCHAIN. Discover meaningful tasks, submit your work, and earn
            rewards for approved contributions.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className={`platform-overview-reveal rounded-full border px-4 py-2.5 text-xs font-medium ${theme.subtle}`} style={{ "--reveal-delay": "150ms" }}>
              <span className="flex items-center gap-2">
                <FiUsers className="text-[#00A87D]" size={15} />
                For creators and contributors
              </span>
            </div>

            <div className={`platform-overview-reveal rounded-full border px-4 py-2.5 text-xs font-medium ${theme.subtle}`} style={{ "--reveal-delay": "250ms" }}>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-[#00A87D]" size={15} />
                Task-based rewards
              </span>
            </div>
          </div>
        </header>

        {/* Supported networks */}
        <div className="mt-16 sm:mt-20 lg:mt-24">
          <div className="platform-overview-reveal mb-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#008A66]">
              Our supported ecosystems
            </p>

            <h3 className={`mt-2 text-xl font-bold sm:text-2xl ${theme.text}`}>
              Two ecosystems. One platform.
            </h3>

            <p className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${theme.muted}`}>
              Discover opportunities built around the Arc and BOTCHAIN communities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {networks.map((network, index) => (
              <article
                key={network.symbol}
                className={`platform-overview-card platform-overview-scale rounded-2xl border p-6 sm:p-8 lg:p-10 ${theme.card}`}
                style={{
                  "--reveal-delay": `${index * 160}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`platform-network-logo flex h-16 w-16 items-center justify-center rounded-2xl border p-3 sm:h-20 sm:w-20 ${
                      dark
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-black/[0.07] bg-[#f6f5ef]"
                    }`}
                  >
                    <img
                      src={network.image}
                      alt={`${network.name} logo`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      dark
                        ? "border-[#00D6A0]/25 bg-[#00D6A0]/[0.07] text-[#00D6A0]"
                        : "border-[#008A66]/25 bg-[#008A66]/[0.06] text-[#008A66]"
                    }`}
                  >
                    Ecosystem 0{index + 1}
                  </span>
                </div>

                <h4 className={`mt-6 text-2xl font-black tracking-tight sm:text-3xl ${theme.text}`}>
                  {network.name}
                </h4>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#008A66]">
                  {network.symbol}
                </p>

                <p className={`mt-4 max-w-md text-sm leading-6 ${theme.muted}`}>
                  {network.description}
                </p>

                <div className={`mt-7 flex items-center gap-2 border-t pt-5 ${theme.divider}`}>
                  <span className="h-2 w-2 rounded-full bg-[#00D6A0]" />

                  <span className={`text-xs font-medium ${theme.muted}`}>
                    Explore {network.name} bounty opportunities
                  </span>

                  <FiArrowUpRight className="platform-card-arrow ml-auto text-[#008A66]" size={18} />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Platform highlights */}
        <div className="mt-16 sm:mt-20 lg:mt-24">
          <div className="platform-overview-reveal mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#008A66]">
              Why Happy Bounty
            </p>

            <h3 className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${theme.text}`}>
              Built around meaningful work.
            </h3>

            <p className={`mt-3 max-w-xl text-sm leading-6 ${theme.muted}`}>
              Everything you need to publish tasks, find contributors, and
              reward approved work across our supported ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {platformHighlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className={`platform-overview-card platform-overview-scale rounded-2xl border p-5 sm:p-6 lg:p-7 ${theme.card}`}
                  style={{
                    "--reveal-delay": `${index * 120}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="platform-card-icon flex h-11 w-11 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.08]">
                      <Icon size={20} className="text-[#008A66]" />
                    </div>

                    <span className={`text-[10px] font-bold tracking-[0.18em] ${dark ? "text-white/25" : "text-black/25"}`}>
                      0{index + 1}
                    </span>
                  </div>

                  <p
                    className={`mt-7 break-words text-xl font-black tracking-[-0.035em] sm:text-2xl ${
                      index < 2
                        ? "text-[#008A66]"
                        : dark
                          ? "text-white"
                          : "text-[#171a18]"
                    }`}
                  >
                    {item.value}
                  </p>

                  <h4 className={`mt-2 text-sm font-bold ${theme.text}`}>
                    {item.label}
                  </h4>

                  <p className={`mt-3 text-xs leading-6 sm:text-sm ${theme.muted}`}>
                    {item.description}
                  </p>

                  <div className={`mt-6 flex items-center gap-2 border-t pt-4 ${theme.divider}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />

                    <span className={`text-[9px] font-bold uppercase tracking-[0.13em] ${theme.muted}`}>
                      Happy Bounty
                    </span>

                    <FiArrowUpRight size={13} className="platform-card-arrow ml-auto text-[#008A66]" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-6">
          <div className={`platform-workflow-panel platform-overview-reveal relative overflow-hidden rounded-2xl border p-5 sm:p-7 lg:p-9 ${theme.panel}`}>
            <div
              aria-hidden="true"
              className="platform-ambient pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#00D6A0]/[0.08] blur-[85px]"
            />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
              <div>
                <div className="platform-card-icon flex h-11 w-11 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.08]">
                  <FiTarget size={20} className="text-[#008A66]" />
                </div>

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#008A66]">
                  How it works
                </p>

                <h3 className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${theme.text}`}>
                  From task to reward.
                </h3>

                <p className={`mt-3 max-w-lg text-sm leading-6 ${theme.muted}`}>
                  Find a bounty, complete the task, and receive the reward
                  after your work is approved.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.number}
                    className={`platform-workflow-step platform-overview-reveal rounded-xl border p-4 sm:p-5 ${
                      dark
                        ? "border-white/[0.08] bg-black/20"
                        : "border-black/[0.07] bg-white/75"
                    }`}
                    style={{
                      "--reveal-delay": `${index * 130 + 150}ms`,
                    }}
                  >
                    <span className="platform-workflow-number inline-block text-xs font-black tracking-[0.16em] text-[#008A66]">
                      {step.number}
                    </span>

                    <h4 className={`mt-4 text-sm font-bold ${theme.text}`}>
                      {step.title}
                    </h4>

                    <p className={`mt-2 text-xs leading-5 ${theme.muted}`}>
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer message */}
        <footer className={`platform-footer platform-overview-reveal mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between ${theme.divider}`}>
          <div className="flex items-center gap-3">
            <span className="platform-footer-icon flex h-9 w-9 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07]">
              <FiShield size={16} className="text-[#008A66]" />
            </span>

            <div>
              <p className={`text-sm font-bold ${theme.text}`}>
                Focused on Arc and BOTCHAIN.
              </p>

              <p className={`mt-1 text-xs ${theme.muted}`}>
                Discover work. Contribute skills. Earn rewards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/[0.06] px-3 py-2 sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#008A66]">
              Two ecosystems, one platform
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
