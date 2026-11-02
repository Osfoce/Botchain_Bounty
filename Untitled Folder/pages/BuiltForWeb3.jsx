
import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiDollarSign,
  FiShield,
  FiZap,
  FiLayers,
  FiActivity,
  FiGlobe,
  FiLink,
} from "react-icons/fi";

import botLogo from "../assets/images/bot.png";
import arcLogo from "../assets/images/arc.png";

const networks = [
  {
    name: "Arc",
    symbol: "ARC",
    fullName: "Arc ecosystem",
    description: "Discover bounty opportunities across the Arc ecosystem.",
    logo: arcLogo,
    accent: "#00D6A0",
    number: "01",
  },
  {
    name: "Botchain",
    symbol: "BOT",
    fullName: "BOT Chain",
    description: "Explore tasks and contribute to the Botchain ecosystem.",
    logo: botLogo,
    accent: "#60A5FA",
    number: "02",
  },
];

const features = [
  {
    icon: FiLayers,
    number: "01",
    title: "Multi-chain opportunities",
    description:
      "Bring bounty creators and contributors together across supported blockchain ecosystems.",
    label: "NETWORK FLEXIBILITY",
  },
  {
    icon: FiDollarSign,
    number: "02",
    title: "Reward-driven work",
    description:
      "Discover tasks with clearly stated rewards. Reward assets depend on each bounty and its supported network.",
    label: "CLEAR REWARDS",
  },
  {
    icon: FiLink,
    number: "03",
    title: "Wallet connectivity",
    description:
      "Connect a compatible wallet to access the blockchain features and bounty interactions available to you.",
    label: "WEB3 ACCESS",
  },
  {
    icon: FiShield,
    number: "04",
    title: "Blockchain transparency",
    description:
      "Where activity is recorded on-chain, relevant transactions can be inspected using supported network tools.",
    label: "VERIFIABLE ACTIVITY",
  },
];

export default function BuiltForWeb3() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

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

  const colors = {
    background: dark ? "#080908" : "#f6f5ef",
    card: dark ? "#101311" : "#ffffff",
    text: dark ? "#F5F7F6" : "#171C19",
    muted: dark ? "#929D97" : "#747D77",
    border: dark
      ? "rgba(255,255,255,0.085)"
      : "rgba(20,40,28,0.10)",
    soft: dark
      ? "rgba(255,255,255,0.035)"
      : "rgba(20,40,28,0.035)",
    accent: "#00D6A0",
    accentText: dark ? "#00D6A0" : "#008A66",
  };

  const bottomItems = [
    { icon: FiLayers, label: "Multiple ecosystems" },
    { icon: FiDollarSign, label: "Bounty rewards" },
    { icon: FiZap, label: "Community powered" },
  ];

  return (
    <section
      className="web3-section relative isolate overflow-hidden px-4 py-20 transition-colors duration-500 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <style>{`
        .web3-section {
          --web3-accent: #00D6A0;
        }

        .web3-grid {
          background-size: 52px 52px;
          animation: web3GridDrift 32s linear infinite;
        }

        .web3-ambient {
          animation: web3AmbientFloat 12s ease-in-out infinite alternate;
        }

        .web3-network-card {
          position: relative;
          isolation: isolate;
          animation: web3FadeUp 650ms cubic-bezier(.22, 1, .36, 1) both;
          transition:
            transform 300ms ease,
            border-color 300ms ease,
            background-color 300ms ease,
            box-shadow 300ms ease;
        }

        .web3-network-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 214, 160, 0.3) !important;
        }

        .web3-network-glow {
          position: absolute;
          z-index: -1;
          right: -65px;
          top: -75px;
          width: 190px;
          height: 190px;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.07;
          pointer-events: none;
          transition: opacity 300ms ease;
        }

        .web3-network-card:hover .web3-network-glow {
          opacity: 0.17;
        }

        .web3-network-logo {
          transition:
            transform 350ms ease,
            box-shadow 350ms ease;
        }

        .web3-network-card:hover .web3-network-logo {
          transform: scale(1.04);
        }

        .web3-feature-card {
          position: relative;
          overflow: hidden;
          animation: web3FadeUp 650ms cubic-bezier(.22, 1, .36, 1) both;
          transition:
            transform 300ms ease,
            border-color 300ms ease,
            box-shadow 300ms ease;
        }

        .web3-feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 214, 160, 0.25) !important;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.10);
        }

        .web3-feature-icon {
          transition:
            transform 300ms ease,
            background-color 300ms ease;
        }

        .web3-feature-card:hover .web3-feature-icon {
          transform: translateY(-2px);
          background-color: rgba(0, 214, 160, 0.13) !important;
        }

        .web3-transparency {
          transition: border-color 300ms ease;
        }

        .web3-transparency:hover {
          border-color: rgba(0, 214, 160, 0.25) !important;
        }

        .web3-heading-accent {
          background: linear-gradient(100deg, #00D6A0 0%, #53E8B9 55%, #00B98B 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        @keyframes web3GridDrift {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 52px 52px;
          }
        }

        @keyframes web3AmbientFloat {
          from {
            transform: translate(-50%, 0) scale(.95);
          }
          to {
            transform: translate(calc(-50% + 18px), 20px) scale(1.06);
          }
        }

        @keyframes web3FadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 639px) {
          .web3-grid {
            background-size: 36px 36px;
          }

          .web3-ambient {
            filter: blur(80px);
          }

          .web3-network-card:hover,
          .web3-feature-card:hover {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .web3-section *,
          .web3-section *::before,
          .web3-section *::after {
            animation: none !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }

          .web3-network-card:hover,
          .web3-feature-card:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Background details */}
      <div
        aria-hidden="true"
        className="web3-grid pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(
              ${dark
                ? "rgba(0,214,160,0.035)"
                : "rgba(0,120,85,0.035)"} 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              ${dark
                ? "rgba(0,214,160,0.035)"
                : "rgba(0,120,85,0.035)"} 1px,
              transparent 1px
            )
          `,
          maskImage: "linear-gradient(to bottom, black, transparent 88%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 88%)",
        }}
      />

      <div
        aria-hidden="true"
        className="web3-ambient pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[min(700px,100%)] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          backgroundColor: dark
            ? "rgba(0,214,160,0.075)"
            : "rgba(0,168,125,0.065)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Main heading */}
        <header className="mx-auto max-w-3xl text-center">
          <div
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border px-4 py-2"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.soft,
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"
                style={{ backgroundColor: colors.accent }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.accent }}
              />
            </span>

            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]"
              style={{ color: colors.muted }}
            >
              The Happy Bounty ecosystem
            </span>
          </div>

          <h2
            className="text-3xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-4xl md:text-5xl lg:text-[60px]"
            style={{ color: colors.text }}
          >
            Built for Web3.
            <br />
            <span className="web3-heading-accent">
              Open to opportunity.
            </span>
          </h2>

          <p
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 sm:mt-6 sm:text-base"
            style={{ color: colors.muted }}
          >
            Good work deserves recognition. Happy Bounty connects people who
            need work done with contributors ready to make an impact and earn
            rewards across supported blockchain ecosystems.
          </p>
        </header>

        {/* Supported networks */}
        <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: colors.accentText }}
              >
                Our networks
              </p>

              <h3
                className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: colors.text }}
              >
                Two ecosystems. More ways to build.
              </h3>
            </div>

            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-medium sm:text-xs"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.soft,
                color: colors.muted,
              }}
            >
              <FiGlobe size={14} style={{ color: colors.accentText }} />
              Supported networks
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {networks.map((network, index) => (
              <article
                key={network.symbol}
                className="web3-network-card group overflow-hidden rounded-2xl border p-5 sm:p-6 lg:p-7"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <div
                  className="web3-network-glow"
                  style={{ backgroundColor: network.accent }}
                  aria-hidden="true"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div
                    className="web3-network-logo flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border p-3 sm:h-[68px] sm:w-[68px] sm:p-3.5"
                    style={{
                      backgroundColor: colors.soft,
                      borderColor: colors.border,
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
                    className="rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold tracking-wider"
                    style={{
                      color: network.accent,
                      backgroundColor: `${network.accent}10`,
                      borderColor: `${network.accent}25`,
                    }}
                  >
                    {network.number}
                  </span>
                </div>

                <div className="relative mt-6">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4
                      className="text-xl font-bold tracking-tight sm:text-2xl"
                      style={{ color: colors.text }}
                    >
                      {network.name}
                    </h4>

                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-bold tracking-wider"
                      style={{
                        color: network.accent,
                        backgroundColor: `${network.accent}12`,
                      }}
                    >
                      {network.symbol}
                    </span>
                  </div>

                  <p
                    className="mt-1.5 text-xs font-medium"
                    style={{ color: colors.muted }}
                  >
                    {network.fullName}
                  </p>

                  <p
                    className="mt-3 max-w-sm text-sm leading-6"
                    style={{ color: colors.muted }}
                  >
                    {network.description}
                  </p>
                </div>

                <div
                  className="relative mt-6 flex items-center justify-between border-t pt-4"
                  style={{ borderColor: colors.border }}
                >
                  <span
                    className="flex items-center gap-2 text-xs font-medium"
                    style={{ color: colors.muted }}
                  >
                    <FiCheckCircle
                      size={14}
                      style={{ color: colors.accentText }}
                    />
                    Ecosystem support
                  </span>

                  <FiArrowUpRight
                    size={18}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    style={{ color: network.accent }}
                    aria-hidden="true"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Feature heading */}
        <div className="mt-16 max-w-2xl sm:mt-20">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: colors.accentText }}
          >
            Why Happy Bounty
          </p>

          <h3
            className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: colors.text }}
          >
            Everything starts with{" "}
            <span className="web3-heading-accent">valuable work.</span>
          </h3>

          <p
            className="mt-3 max-w-xl text-sm leading-7"
            style={{ color: colors.muted }}
          >
            A straightforward way for bounty creators and contributors to
            connect, collaborate, and work toward meaningful outcomes.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className="web3-feature-card flex min-h-[255px] flex-col rounded-2xl border p-5 sm:p-6"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="web3-feature-icon flex h-12 w-12 items-center justify-center rounded-xl border"
                    style={{
                      color: colors.accentText,
                      backgroundColor: dark
                        ? "rgba(0,214,160,0.075)"
                        : "rgba(0,168,125,0.07)",
                      borderColor: dark
                        ? "rgba(0,214,160,0.18)"
                        : "rgba(0,168,125,0.18)",
                    }}
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <span
                    className="pt-1 text-xs font-medium tracking-[0.12em]"
                    style={{
                      color: dark
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(20,40,28,0.30)",
                    }}
                  >
                    {feature.number}
                  </span>
                </div>

                <h4
                  className="mt-6 text-lg font-semibold tracking-tight"
                  style={{ color: colors.text }}
                >
                  {feature.title}
                </h4>

                <p
                  className="mt-2 flex-1 text-[13px] leading-6"
                  style={{ color: colors.muted }}
                >
                  {feature.description}
                </p>

                <div
                  className="mt-6 flex items-center gap-2 border-t pt-4"
                  style={{ borderColor: colors.border }}
                >
                  <FiCheckCircle
                    size={13}
                    style={{ color: colors.accentText }}
                  />

                  <span
                    className="text-[9px] font-semibold uppercase tracking-[0.13em]"
                    style={{ color: colors.muted }}
                  >
                    {feature.label}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Transparency panel */}
        <div
          className="web3-transparency relative mt-5 overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-1"
            style={{ backgroundColor: colors.accent }}
          />

          <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
                style={{
                  color: colors.accentText,
                  backgroundColor: dark
                    ? "rgba(0,214,160,0.075)"
                    : "rgba(0,168,125,0.07)",
                  borderColor: dark
                    ? "rgba(0,214,160,0.18)"
                    : "rgba(0,168,125,0.18)",
                }}
              >
                <FiShield size={21} />
              </div>

              <div>
                <h3
                  className="text-base font-semibold sm:text-lg"
                  style={{ color: colors.text }}
                >
                  Transparency where it matters
                </h3>

                <p
                  className="mt-2 max-w-2xl text-sm leading-6"
                  style={{ color: colors.muted }}
                >
                  When bounty activity uses on-chain transactions, those
                  records can be checked on the relevant blockchain. Each
                  opportunity follows its own requirements and supported
                  integrations.
                </p>
              </div>
            </div>

            <div
              className="flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.soft,
              }}
            >
              <FiActivity
                size={18}
                style={{ color: colors.accentText }}
              />

              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: colors.text }}
                >
                  Connected Web3 experiences
                </p>

                <p
                  className="mt-1 text-[10px]"
                  style={{ color: colors.muted }}
                >
                  Based on supported integrations
                </p>
              </div>

              <FiArrowUpRight
                size={16}
                style={{ color: colors.accentText }}
              />
            </div>
          </div>
        </div>

        {/* Bottom information strip */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t pt-6"
          style={{ borderColor: colors.border }}
        >
          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <span
                key={item.label}
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
                style={{ color: colors.muted }}
              >
                <Icon size={14} style={{ color: colors.accentText }} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
