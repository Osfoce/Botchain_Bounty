
import { useEffect, useRef, useState } from "react";
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
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { handleNavigate } = useNav();

  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  // Detect the application's global theme.
  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setDark(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(root, {
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
      { threshold: 0.08 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const palette = {
    background: dark ? "#080B0D" : "#F4F7F5",
    card: dark ? "#101614" : "#FFFFFF",
    elevated: dark ? "#141B18" : "#F9FBF9",
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

  return (
    <>
      <style>{`
        @keyframes hbReveal {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hbGlow {
          0%, 100% {
            opacity: .35;
          }
          50% {
            opacity: .7;
          }
        }

        .hb-reveal {
          opacity: 0;
        }

        .hb-reveal.hb-visible {
          animation: hbReveal .7s cubic-bezier(.22,1,.36,1) forwards;
        }

        .hb-card {
          transition:
            transform .3s ease,
            border-color .3s ease,
            background-color .3s ease,
            box-shadow .3s ease;
        }

        .hb-card:hover {
          transform: translateY(-5px);
        }

        .hb-ecosystem-logo {
          transition: transform .3s ease;
        }

        .hb-ecosystem:hover .hb-ecosystem-logo {
          transform: scale(1.07);
        }

        .hb-arrow {
          transition: transform .25s ease;
        }

        .hb-ecosystem:hover .hb-arrow,
        .hb-cta:hover .hb-arrow {
          transform: translate(3px, -3px);
        }

        .hb-orb {
          animation: hbGlow 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-reveal,
          .hb-reveal.hb-visible {
            opacity: 1;
            animation: none !important;
            transform: none !important;
          }

          .hb-card,
          .hb-ecosystem-logo,
          .hb-arrow,
          .hb-orb {
            animation: none !important;
            transition: none !important;
          }

          .hb-card:hover {
            transform: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative isolate overflow-hidden px-5 py-20 transition-colors duration-500 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
        style={{
          backgroundColor: palette.background,
          color: palette.text,
        }}
      >
        {/* Subtle background texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(
                ${
                  dark
                    ? "rgba(0,214,160,0.025)"
                    : "rgba(0,138,102,0.035)"
                } 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                ${
                  dark
                    ? "rgba(0,214,160,0.025)"
                    : "rgba(0,138,102,0.035)"
                } 1px,
                transparent 1px
              )
            `,
            backgroundSize: "52px 52px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />

        {/* Soft green glow */}
        <div
          aria-hidden="true"
          className="hb-orb pointer-events-none absolute -top-28 left-1/2 -z-10 h-80 w-[min(700px,100%)] -translate-x-1/2 rounded-full blur-[130px]"
          style={{
            backgroundColor: dark
              ? "rgba(0,214,160,0.09)"
              : "rgba(0,168,125,0.07)",
          }}
        />

        <div className="mx-auto max-w-7xl">
          {/* Hero introduction */}
          <div
            className={`hb-reveal ${
              isVisible ? "hb-visible" : ""
            } mx-auto mb-16 max-w-4xl text-center sm:mb-20`}
          >
            <div
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border px-4 py-2"
              style={{
                borderColor: "rgba(0,214,160,0.23)",
                backgroundColor: palette.accentSoft,
              }}
            >
              <FiZap size={13} style={{ color: palette.accent }} />

              <span
                className="text-[10px] font-bold uppercase tracking-[0.17em] sm:text-[11px]"
                style={{ color: palette.accent }}
              >
                Work across ecosystems
              </span>
            </div>

            <h2
              className="text-4xl font-bold leading-[1.08] tracking-[-0.055em] sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ color: palette.text }}
            >
              Your skills have
              <br className="hidden sm:block" />{" "}
              <span style={{ color: palette.accent }}>
                more places to go.
              </span>
            </h2>

            <p
              className="mx-auto mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8"
              style={{ color: palette.muted }}
            >
              Discover bounty opportunities, contribute to real
              projects, and earn rewards for approved work — all
              through one multi-chain platform.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigate("/dashboard");
                }}
                className="hb-cta group inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 sm:w-auto sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm"
                style={{
                  backgroundColor: palette.accent,
                  color: "#06130E",
                  boxShadow: "0 8px 28px rgba(0,214,160,0.13)",
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
                <FiLayers className="h-4 w-4 shrink-0 sm:h-4 sm:w-4" />
                Explore ecosystems
              </a>
            </div>

            <div
              className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.13em] sm:gap-x-7"
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

          {/* Supported ecosystems */}
          <div id="hb-ecosystems" className="scroll-mt-24">
            <div
              className={`hb-reveal ${
                isVisible ? "hb-visible" : ""
              } mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between`}
              style={{ animationDelay: "100ms" }}
            >
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
                  className={`hb-card hb-ecosystem hb-reveal ${
                    isVisible ? "hb-visible" : ""
                  } group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border p-5 sm:p-7`}
                  style={{
                    animationDelay: `${180 + index * 100}ms`,
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                    boxShadow: dark
                      ? "0 16px 40px rgba(0,0,0,0.12)"
                      : "0 12px 34px rgba(20,40,28,0.035)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-5 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${network.color}, transparent)`,
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
                      <h4 className="text-lg font-bold tracking-tight">
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

          {/* Benefits */}
          <div className="mt-20 sm:mt-24">
            <div
              className={`hb-reveal ${
                isVisible ? "hb-visible" : ""
              } mb-8 max-w-2xl`}
              style={{ animationDelay: "250ms" }}
            >
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
                    className={`hb-card hb-reveal ${
                      isVisible ? "hb-visible" : ""
                    } group flex min-h-[245px] flex-col rounded-2xl border p-5 sm:p-6`}
                    style={{
                      animationDelay: `${300 + index * 100}ms`,
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl border"
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

          {/* Final call to action */}
          <div
            className={`hb-reveal ${
              isVisible ? "hb-visible" : ""
            } mt-16 overflow-hidden rounded-3xl border sm:mt-20`}
            style={{
              animationDelay: "600ms",
              backgroundColor: palette.card,
              borderColor: palette.border,
            }}
          >
            <div
              className="h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00D6A0, #008A66, transparent)",
              }}
            />

            <div className="relative flex flex-col gap-7 p-6 sm:p-9 md:flex-row md:items-center md:justify-between md:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full blur-[90px]"
                style={{
                  backgroundColor: "rgba(0,214,160,0.08)",
                }}
              />

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
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigate("/dashboard");
                }}
                className="hb-cta group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm"
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

          {/* Supported ecosystem signature */}
          <div
            className={`hb-reveal ${
              isVisible ? "hb-visible" : ""
            } mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t pt-7 sm:gap-x-8`}
            style={{
              animationDelay: "700ms",
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