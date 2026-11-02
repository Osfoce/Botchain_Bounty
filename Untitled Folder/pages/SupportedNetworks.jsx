
import React from "react";
import { FiArrowUpRight, FiCheckCircle, FiGlobe } from "react-icons/fi";

import botLogo from "../assets/images/bot.png";
import arcLogo from "../assets/images/arc.png";
import { useTheme } from "../context/ThemeContext";

const networks = [
  {
    name: "Arc",
    symbol: "ARC",
    image: arcLogo,
    description: "Discover opportunities across the Arc ecosystem.",
    accent: "#D4A017",
    number: "01",
  },
  {
    name: "Botchain",
    symbol: "BOT",
    image: botLogo,
    description: "Contribute to projects and earn rewards.",
    accent: "#00D6A0",
    number: "02",
  },
];

export default function SupportedNetworks({ dark = true }) {
  const { accent, network } = useTheme();
  const ambientAccent = network === "arc" ? "rgba(212, 160, 23, 0.10)" : "rgba(0, 214, 160, 0.10)";
  return (
    <section
      className={`relative isolate overflow-hidden py-16 sm:py-20 lg:py-24 ${
        dark
          ? "bg-[#080908] text-white"
          : "bg-[#f6f5ef] text-[#171717]"
      }`}
    >
      <style>{`
        @keyframes networkFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes networkTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes networkPulse {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .network-float {
          animation: networkFloat 5s ease-in-out infinite;
        }

        .network-ticker-track {
          display: flex;
          width: max-content;
          animation: networkTicker 28s linear infinite;
          will-change: transform;
        }

        .network-ticker:hover .network-ticker-track {
          animation-play-state: paused;
        }

        .network-ticker-group {
          display: flex;
          flex: none;
          align-items: center;
        }

        .network-ticker-item {
          display: inline-flex;
          flex: none;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          white-space: nowrap;
        }

        .network-live-dot {
          animation: networkPulse 2s ease-in-out infinite;
        }

        @media (min-width: 640px) {
          .network-ticker-item {
            gap: 14px;
            padding: 0 36px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .network-float,
          .network-ticker-track,
          .network-live-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[min(80%,700px)] -translate-x-1/2 rounded-full blur-[100px]"
        style={{
          background: dark ? ambientAccent : (network === "arc" ? "rgba(212, 160, 23, 0.08)" : "rgba(0, 168, 121, 0.08)"),
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-64 w-64 rounded-full blur-[100px]"
        style={{
          background: dark ? (network === "arc" ? "rgba(212, 160, 23, 0.05)" : "rgba(0, 214, 160, 0.05)") : (network === "arc" ? "rgba(212, 160, 23, 0.06)" : "rgba(0, 168, 121, 0.06)"),
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <div
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-wide ${
              dark
                ? "border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#00D6A0]"
                : "border-[#008A66]/20 bg-[#00A879]/[0.07] text-[#008A66]"
            }`}
          >
            <FiGlobe size={14} aria-hidden="true" />
            OUR ECOSYSTEM
            <span
              className="network-live-dot ml-1 h-1.5 w-1.5 rounded-full"
              style={{ background: accent }}
            />
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            One platform.
            <br />
            <span className="mt-1 inline-block text-[#00D6A0]">
              Two ecosystems.
            </span>
          </h2>

          <p
            className={`mx-auto mt-4 max-w-lg text-sm leading-7 sm:text-base ${
              dark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Explore opportunities across our supported networks, contribute
            your skills, and earn rewards for meaningful work.
          </p>
        </div>

        {/* Network cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {networks.map((network, index) => (
            <article
              key={network.symbol}
              className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 sm:p-7 ${
                dark
                  ? "border-white/[0.09] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.045]"
                  : "border-black/[0.08] bg-white/70 hover:border-black/[0.14] hover:bg-white"
              }`}
              style={{
                animationDelay: `${index * 120}ms`,
              }}
            >
              {/* Card accent */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-[0.09] blur-3xl transition-opacity duration-300 group-hover:opacity-20"
                style={{ background: network.accent }}
              />

              <div className="relative flex items-start justify-between gap-3">
                <div
                  className={`network-float flex h-14 w-14 items-center justify-center rounded-2xl border p-3 sm:h-16 sm:w-16 ${
                    dark
                      ? "border-white/10 bg-white/[0.045]"
                      : "border-black/[0.07] bg-white"
                  }`}
                  style={{
                    boxShadow: dark
                      ? `0 0 35px ${network.accent}0D`
                      : "0 6px 20px rgba(0,0,0,0.035)",
                    animationDelay: `${index * 300}ms`,
                  }}
                >
                  <img
                    src={network.image}
                    alt={`${network.name} logo`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <span
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold tracking-wider ${
                    dark
                      ? "border-white/[0.09] bg-white/[0.035] text-gray-400"
                      : "border-black/[0.07] bg-black/[0.025] text-gray-500"
                  }`}
                >
                  {network.number}
                </span>
              </div>

              <div className="relative mt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {network.name}
                  </h3>

                  <span
                    className="rounded-md px-2 py-1 text-[10px] font-bold tracking-wider"
                    style={{
                      color: network.accent,
                      backgroundColor: `${network.accent}14`,
                    }}
                  >
                    {network.symbol}
                  </span>
                </div>

                <p
                  className={`mt-2 max-w-xs text-sm leading-6 ${
                    dark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {network.description}
                </p>
              </div>

              <div
                className={`relative mt-6 flex items-center justify-between border-t pt-4 ${
                  dark ? "border-white/[0.08]" : "border-black/[0.07]"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 text-xs font-medium ${
                    dark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <FiCheckCircle
                    size={14}
                    style={{ color: "#00D6A0" }}
                    aria-hidden="true"
                  />
                  Supported network
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

        {/* Moving network strip */}
        <div className="mx-auto mt-8 max-w-4xl sm:mt-10">
          <div
            className={`network-ticker relative overflow-hidden rounded-xl border ${
              dark
                ? "border-white/[0.07] bg-white/[0.018]"
                : "border-black/[0.07] bg-white/50"
            }`}
            aria-label="Supported networks: Arc ARC and Botchain BOT"
          >
            {/* Edge fades */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-14 ${
                dark
                  ? "bg-gradient-to-r from-[#080908] to-transparent"
                  : "bg-gradient-to-r from-[#f6f5ef] to-transparent"
              }`}
            />

            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-14 ${
                dark
                  ? "bg-gradient-to-l from-[#080908] to-transparent"
                  : "bg-gradient-to-l from-[#f6f5ef] to-transparent"
              }`}
            />

            <div className="network-ticker-track py-4">
              {[0, 1].map((sequence) => (
                <div
                  key={sequence}
                  className="network-ticker-group"
                  aria-hidden={sequence === 1 ? "true" : undefined}
                >
                  {networks.map((network) => (
                    <div
                      key={`${sequence}-${network.symbol}`}
                      className="network-ticker-item"
                    >
                      <img
                        src={network.image}
                        alt={sequence === 0 ? `${network.name} logo` : ""}
                        className="h-7 w-7 object-contain"
                        loading="lazy"
                      />

                      <span
                        className={`text-sm font-semibold ${
                          dark ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {network.name}
                      </span>

                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: network.accent }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing message */}
        <div
          className={`mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs sm:mt-7 sm:text-sm ${
            dark ? "text-gray-500" : "text-gray-600"
          }`}
        >
          <span>More networks.</span>
          <span>More opportunities.</span>
          <span className="font-semibold text-[#00D6A0]">
            Real work. Real rewards.
          </span>
        </div>
      </div>
    </section>
  );
}
