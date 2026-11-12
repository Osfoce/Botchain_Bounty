
import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiDollarSign,
  FiGlobe,
  FiLayers,
  FiShield,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";

import ArcLogo from "../assets/images/arc.png";
import BotchainLogo from "../assets/images/bot.png";

const ecosystems = [
  {
    name: "Arc",
    symbol: "ARC",
    logo: ArcLogo,
    description: "Discover opportunities across the Arc ecosystem.",
    color: "#00D6A0",
  },
  {
    name: "BOTCHAIN",
    symbol: "BOT",
    logo: BotchainLogo,
    description: "Find tasks and contribute to the BOTCHAIN community.",
    color: "#42A5F5",
  },
];

const features = [
  {
    icon: FiDollarSign,
    number: "01",
    title: "Earn for your work",
    description:
      "Discover reward-backed tasks, submit quality work, and earn rewards when your submission is approved.",
    tag: "REAL OPPORTUNITIES",
  },
  {
    icon: FiGlobe,
    number: "02",
    title: "Two ecosystems, one platform",
    description:
      "Explore opportunities across Arc and BOTCHAIN without needing a separate platform for each community.",
    tag: "MULTI-CHAIN ACCESS",
  },
  {
    icon: FiShield,
    number: "03",
    title: "A transparent workflow",
    description:
      "Follow the bounty process from task requirements and submissions to review and reward distribution.",
    tag: "CLEAR PROCESS",
  },
  {
    icon: FiUsers,
    number: "04",
    title: "Build with communities",
    description:
      "Help teams move forward, demonstrate your skills, and build a track record through meaningful contributions.",
    tag: "COMMUNITY-POWERED",
  },
];

function Features() {
  const { handleNavigate } = useNav();

  // Detect the current application theme.
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return true;

    const html = document.documentElement;
    const body = document.body;

    return (
      html.classList.contains("dark") ||
      body.classList.contains("dark") ||
      html.getAttribute("data-theme") === "dark" ||
      body.getAttribute("data-theme") === "dark"
    );
  });

  useEffect(() => {
    const updateTheme = () => {
      const html = document.documentElement;
      const body = document.body;

      const isDark =
        html.classList.contains("dark") ||
        body.classList.contains("dark") ||
        html.getAttribute("data-theme") === "dark" ||
        body.getAttribute("data-theme") === "dark";

      setDark(isDark);
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const palette = {
    background: dark ? "#080B0D" : "#F3F5F3",
    card: dark ? "#101614" : "#FFFFFF",
    elevated: dark ? "#141B18" : "#F5F7F5",
    text: dark ? "#F4F7F5" : "#17211B",
    muted: dark ? "#99A69F" : "#6D7971",
    border: dark
      ? "rgba(255,255,255,0.09)"
      : "rgba(20,40,28,0.11)",
    subtle: dark
      ? "rgba(255,255,255,0.035)"
      : "rgba(20,40,28,0.035)",
    accent: dark ? "#00D6A0" : "#008A66",
    accentSoft: dark
      ? "rgba(0,214,160,0.09)"
      : "rgba(0,138,102,0.08)",
  };

  const navigate = (path) => (event) => {
    event.preventDefault();
    handleNavigate(path);
  };

  return (
    <>
      <style>{`
        /* =========================================
           ZOOM-IN ANIMATION
           Always visible. No scroll reveal.
        ========================================= */

        @keyframes hbZoomIn {
          from {
            scale: 0.96;
          }

          to {
            scale: 1;
          }
        }

        .hb-reveal {
          opacity: 1 !important;
          filter: none !important;
          animation: hbZoomIn 650ms cubic-bezier(.2,.8,.2,1) both;
          will-change: scale;
        }

        .hb-delay-1 {
          animation-delay: 100ms;
        }

        .hb-delay-2 {
          animation-delay: 180ms;
        }

        .hb-delay-3 {
          animation-delay: 260ms;
        }

        /* =========================================
           CARD HOVER
        ========================================= */

        .hb-card {
          position: relative;
          transition:
            transform 0.35s cubic-bezier(.2,.75,.25,1),
            border-color 0.3s ease,
            background-color 0.3s ease;
        }

        .hb-card:hover {
          transform: translateY(-7px);
        }

        .hb-card::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background: #00D6A0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }

        .hb-card:hover::after {
          transform: scaleX(1);
        }

        /* =========================================
           ECOSYSTEM HOVER
        ========================================= */

        .hb-ecosystem-logo {
          transition:
            transform 0.35s cubic-bezier(.2,.75,.25,1),
            border-color 0.3s ease;
        }

        .hb-ecosystem:hover .hb-ecosystem-logo {
          transform: translateY(-4px) rotate(-4deg);
        }

        .hb-arrow {
          transition: transform 0.25s ease;
        }

        .hb-ecosystem:hover .hb-arrow,
        .hb-cta:hover .hb-arrow {
          transform: translate(4px, -4px);
        }

        .hb-ecosystem-line {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .hb-ecosystem:hover .hb-ecosystem-line {
          transform: scaleX(1);
        }

        /* =========================================
           FEATURE ICONS
        ========================================= */

        .hb-feature-icon {
          transition:
            transform 0.35s ease,
            background-color 0.3s ease;
        }

        .hb-card:hover .hb-feature-icon {
          transform: translateY(-4px) rotate(5deg);
        }

        /* =========================================
           CTA BUTTONS
        ========================================= */

        .hb-cta {
          transition:
            transform 0.25s ease,
            background-color 0.25s ease;
        }

        .hb-cta:hover {
          transform: translateY(-3px);
        }

        .hb-cta:active {
          transform: translateY(0) scale(0.98);
        }

        .hb-ecosystem-label {
          transition: color 0.3s ease;
        }

        .hb-ecosystem:hover .hb-ecosystem-label {
          color: #00D6A0;
        }

        /* =========================================
           DECORATIVE ANIMATIONS
        ========================================= */

        @keyframes hbLineMove {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }

          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }

        .hb-accent-line {
          animation: hbLineMove 1s cubic-bezier(.2,.75,.25,1) both;
        }

        @keyframes hbTicker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .hb-ticker-track {
          display: flex;
          width: max-content;
          animation: hbTicker 35s linear infinite;
        }

        .hb-ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes hbIconFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        .hb-orbit-icon {
          animation: hbIconFloat 4s ease-in-out infinite;
        }

        @keyframes hbBorderMove {
          0%, 100% {
            border-color: rgba(0, 214, 160, 0.12);
          }

          50% {
            border-color: rgba(0, 214, 160, 0.42);
          }
        }

        .hb-animated-border {
          animation: hbBorderMove 5s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .hb-ticker-track {
            animation-duration: 25s;
          }
        }

        /* =========================================
           ACCESSIBILITY
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .hb-reveal,
          .hb-card,
          .hb-ecosystem-logo,
          .hb-arrow,
          .hb-feature-icon,
          .hb-cta,
          .hb-ticker-track,
          .hb-orbit-icon,
          .hb-animated-border,
          .hb-accent-line {
            animation: none !important;
            transition: none !important;
            scale: 1 !important;
          }

          .hb-card:hover,
          .hb-cta:hover {
            transform: none;
          }

          .hb-card::after {
            display: none;
          }
        }
      `}</style>

      <section
        className="relative isolate overflow-hidden px-5 py-20 transition-colors duration-500 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
        style={{
          backgroundColor: palette.background,
          color: palette.text,
        }}
      >
        {/* CLEAN GRID BACKGROUND */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(
                ${dark
                  ? "rgba(0,214,160,0.025)"
                  : "rgba(0,138,102,0.035)"} 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                ${dark
                  ? "rgba(0,214,160,0.025)"
                  : "rgba(0,138,102,0.035)"} 1px,
                transparent 1px
              )
            `,
            backgroundSize: "52px 52px",
          }}
        />

        <div className="mx-auto max-w-7xl">

          {/* HERO INTRODUCTION */}
          <div className="hb-reveal mx-auto mb-16 max-w-4xl text-center sm:mb-20">
            <div
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border px-4 py-2"
              style={{
                borderColor: "rgba(0,214,160,0.23)",
                backgroundColor: palette.accentSoft,
              }}
            >
              <FiZap
                size={13}
                style={{ color: palette.accent }}
              />

              <span
                className="text-[10px] font-bold uppercase tracking-[0.17em] sm:text-[11px]"
                style={{ color: palette.accent }}
              >
                Work across ecosystems
              </span>
            </div>

            <h2
              className="hb-reveal hb-delay-1 text-4xl font-bold leading-[1.08] tracking-[-0.055em] sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ color: palette.text }}
            >
              Your skills have
              <br className="hidden sm:block" />{" "}
              <span style={{ color: palette.accent }}>
                more places to go.
              </span>
            </h2>

            <p
              className="hb-reveal hb-delay-2 mx-auto mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8"
              style={{ color: palette.muted }}
            >
              Discover bounty opportunities, contribute to real
              projects, and earn rewards for approved work — all
              through one multi-chain platform.
            </p>

            <div className="hb-reveal hb-delay-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                onClick={navigate("/dashboard")}
                className="hb-cta group inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold sm:w-auto sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm"
                style={{
                  backgroundColor: palette.accent,
                  color: "#06130E",
                }}
              >
                Explore opportunities

                <FiArrowUpRight className="hb-arrow h-4 w-4 shrink-0 sm:h-[17px] sm:w-[17px]" />
              </Link>

              <a
                href="#hb-ecosystems"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors duration-300 hover:border-[#00D6A0] sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm"
                style={{
                  color: palette.text,
                  backgroundColor: palette.subtle,
                  borderColor: palette.border,
                }}
              >
                <FiLayers className="h-4 w-4 shrink-0" />
                Explore ecosystems
              </a>
            </div>

            <div
              className="hb-reveal mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.13em] sm:gap-x-7"
              style={{ color: palette.muted }}
            >
              <span className="flex items-center gap-2">
                <FiCheckCircle
                  size={13}
                  style={{ color: palette.accent }}
                />
                Reward-backed tasks
              </span>

              <span className="flex items-center gap-2">
                <FiCheckCircle
                  size={13}
                  style={{ color: palette.accent }}
                />
                Community-driven
              </span>

              <span className="flex items-center gap-2">
                <FiCheckCircle
                  size={13}
                  style={{ color: palette.accent }}
                />
                Arc + BOTCHAIN
              </span>
            </div>
          </div>

          {/* SUPPORTED ECOSYSTEMS */}
          <div id="hb-ecosystems" className="scroll-mt-24">
            <div className="hb-reveal hb-delay-1 mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: palette.accent }}
                >
                  Our ecosystems
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Two ecosystems. One platform.
                </h3>
              </div>

              <p
                className="max-w-md text-sm leading-6 sm:text-right"
                style={{ color: palette.muted }}
              >
                Discover opportunities, support builders, and
                contribute to projects across Arc and BOTCHAIN.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {ecosystems.map((network, index) => (
                <article
                  key={network.name}
                  className="hb-card hb-ecosystem hb-reveal group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border p-5 sm:p-7"
                  style={{
                    animationDelay: `${180 + index * 130}ms`,
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="hb-ecosystem-line absolute inset-x-0 top-0 h-[2px]"
                    style={{
                      backgroundColor: network.color,
                    }}
                  />

                  <div className="flex items-start justify-between">
                    <div
                      className="hb-ecosystem-logo flex h-14 w-14 items-center justify-center rounded-2xl border p-3"
                      style={{
                        backgroundColor: `${network.color}12`,
                        borderColor: `${network.color}35`,
                      }}
                    >
                      <img
                        src={network.logo}
                        alt={`${network.name} logo`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    <span
                      className="rounded-md border px-2 py-1 text-[9px] font-bold tracking-[0.12em]"
                      style={{
                        color: palette.muted,
                        borderColor: palette.border,
                        backgroundColor: palette.subtle,
                      }}
                    >
                      {network.symbol}
                    </span>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="hb-ecosystem-label text-lg font-bold tracking-tight">
                        {network.name}
                      </h4>

                      <p
                        className="mt-2 text-xs leading-5"
                        style={{ color: palette.muted }}
                      >
                        {network.description}
                      </p>
                    </div>

                    <FiArrowUpRight
                      size={19}
                      className="hb-arrow mb-1 shrink-0"
                      style={{ color: network.color }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <p
              className="mt-4 text-[11px] leading-5"
              style={{ color: palette.muted }}
            >
              Actual bounty availability depends on the integrations
              and opportunities currently enabled in the application.
            </p>
          </div>

          {/* BENEFITS */}
          <div className="mt-20 sm:mt-24">
            <div className="hb-reveal mb-8 max-w-2xl">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: palette.accent }}
              >
                Made for contributors and teams
              </p>

              <h3 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">
                Turn good work into real value.
              </h3>

              <p
                className="mt-4 max-w-xl text-sm leading-7"
                style={{ color: palette.muted }}
              >
                Whether you have a project to build or skills to
                share, Happy Bounty gives you a clear place to get
                started.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.number}
                    className="hb-card hb-reveal group flex min-h-[245px] flex-col rounded-2xl border p-5 sm:p-6"
                    style={{
                      animationDelay: `${300 + index * 110}ms`,
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="hb-feature-icon flex h-11 w-11 items-center justify-center rounded-xl border"
                        style={{
                          color: palette.accent,
                          backgroundColor: palette.accentSoft,
                          borderColor: "rgba(0,214,160,0.2)",
                        }}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                      <span
                        className="text-xs font-semibold tracking-widest"
                        style={{
                          color: dark
                            ? "rgba(255,255,255,0.24)"
                            : "rgba(20,40,28,0.3)",
                        }}
                      >
                        {feature.number}
                      </span>
                    </div>

                    <h4 className="mt-6 text-lg font-bold tracking-tight">
                      {feature.title}
                    </h4>

                    <p
                      className="mt-3 flex-1 text-[13px] leading-6"
                      style={{ color: palette.muted }}
                    >
                      {feature.description}
                    </p>

                    <div
                      className="mt-6 border-t pt-4"
                      style={{ borderColor: palette.border }}
                    >
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: palette.accent }}
                      >
                        {feature.tag}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* FINAL CALL TO ACTION */}
          <div
            className="hb-reveal mt-16 overflow-hidden rounded-3xl border sm:mt-20"
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
            }}
          >
            <div
              className="hb-accent-line h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00D6A0, #008A66, transparent)",
              }}
            />

            <div className="relative flex flex-col gap-7 p-6 sm:p-9 md:flex-row md:items-center md:justify-between md:p-12">
              <div className="relative max-w-2xl">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border"
                  style={{
                    color: palette.accent,
                    backgroundColor: palette.accentSoft,
                    borderColor: "rgba(0,214,160,0.2)",
                  }}
                >
                  <FiLayers size={19} />
                </div>

                <h3 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                  Your next opportunity starts here.
                </h3>

                <p
                  className="mt-3 max-w-xl text-sm leading-7"
                  style={{ color: palette.muted }}
                >
                  Find a task, bring your skills, and make your next
                  contribution count.
                </p>
              </div>

              <Link
                to="/dashboard"
                onClick={navigate("/dashboard")}
                className="hb-cta group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm"
                style={{
                  color: "#06130E",
                  backgroundColor: palette.accent,
                }}
              >
                Start exploring

                <FiArrowUpRight className="hb-arrow h-4 w-4 shrink-0 sm:h-[17px] sm:w-[17px]" />
              </Link>
            </div>
          </div>

          {/* SUPPORTED ECOSYSTEM SIGNATURE */}
          <div
            className="hb-reveal mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t pt-7 sm:gap-x-8"
            style={{
              borderColor: palette.border,
            }}
          >
            {["ARC", "BOTCHAIN"].map((name) => (
              <span
                key={name}
                className="text-[9px] font-bold uppercase tracking-[0.17em] sm:text-[10px]"
                style={{
                  color:
                    name === "ARC"
                      ? palette.accent
                      : palette.muted,
                }}
              >
                {name}
              </span>
            ))}

            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />

            <span
              className="text-[9px] font-bold uppercase tracking-[0.17em] sm:text-[10px]"
              style={{ color: palette.muted }}
            >
              One platform. Real contributions.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

export default Features;
