
import { useEffect, useState } from "react";

function LiveTricker() {
  const items = [
    { label: "Multi-Chain Bounty Platform", type: "WEB3" },
    { label: "Explore Multi-Chain Bounties", type: "NETWORKS" },
    { label: "Earn Network-Native Rewards", type: "REWARDS" },
    { label: "Complete On-Chain Bounties", type: "BOUNTIES" },
    { label: "Post Work. Reward Contributors.", type: "CREATE" },
    { label: "New Bounties Added Daily", type: "NEW" },
  ];

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

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

  return (
    <div
      className={`
        live-ticker relative mt-6 md:mt-3 w-full overflow-hidden
        border-y transition-all duration-500
        ${
          dark
            ? "border-white/[0.07] bg-[#080B0D]"
            : "border-black/[0.07] bg-white"
        }
      `}
    >
      {/* AMBIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`
            ticker-ambient absolute inset-0
            ${
              dark
                ? "bg-[radial-gradient(ellipse_at_center,rgba(0,214,160,0.075),transparent_65%)]"
                : "bg-[radial-gradient(ellipse_at_center,rgba(0,214,160,0.045),transparent_65%)]"
            }
          `}
        />

        {/* FLOATING PARTICLES */}
        <div className="ticker-particles absolute inset-0">
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className={`ticker-bg-dot dot-${index + 1}`}
            />
          ))}
        </div>

        {/* MOVING LIGHT SWEEP */}
        <div className="ticker-light-sweep absolute inset-y-0 w-40" />
      </div>

      {/* LEFT FADE */}
      <div
        className={`
          pointer-events-none absolute bottom-0 left-0 top-0
          z-30 w-24 bg-gradient-to-r to-transparent
          transition-all duration-500
          ${
            dark
              ? "from-[#080B0D] via-[#080B0D]/95"
              : "from-white via-white/95"
          }
        `}
      />

      {/* RIGHT FADE */}
      <div
        className={`
          pointer-events-none absolute bottom-0 right-0 top-0
          z-30 w-24 bg-gradient-to-l to-transparent
          transition-all duration-500
          ${
            dark
              ? "from-[#080B0D] via-[#080B0D]/95"
              : "from-white via-white/95"
          }
        `}
      />

      {/* CENTER ACCENT */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-8 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D6A0]/[0.07] blur-3xl ticker-center-glow" />

      {/* TOP GREEN ACCENT */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-px overflow-hidden">
        <div className="ticker-top-line h-full w-1/3 bg-gradient-to-r from-transparent via-[#00D6A0] to-transparent" />
      </div>

      {/* TICKER */}
      <div className="ticker-track relative z-10">
        {[1, 2, 3].map((copy) => (
          <div key={copy} className="ticker-content">
            {items.map((item, index) => (
              <div
                key={`${copy}-${index}`}
                className="ticker-item group"
              >
                <span className="status-dot" />

                <span className="ticker-label">
                  {item.label}
                </span>

                <span className="ticker-category">
                  {item.logo && (
                    <img
                      src={item.logo}
                      alt={`${item.type} logo`}
                      className="ticker-logo"
                      loading="lazy"
                    />
                  )}

                  <span>{item.type}</span>
                </span>

                <span className="ticker-separator">/</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        /* MAIN TICKER */
        .live-ticker {
          isolation: isolate;
        }

        /* CONTINUOUS MARQUEE */
        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 32s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        .ticker-content {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          padding-right: 20px;
        }

        .ticker-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 18px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .ticker-item:hover {
          transform: translateY(-2px);
        }

        /* MAIN TEXT */
        .ticker-label {
          color: ${dark ? "#ffffff" : "#111111"};
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.015em;
          transition:
            color 0.3s ease,
            text-shadow 0.3s ease;
        }

        .ticker-item:hover .ticker-label {
          color: ${dark ? "#00D6A0" : "#008765"};
          text-shadow: 0 0 18px rgba(0, 214, 160, 0.15);
        }

        /* CATEGORY BADGE */
        .ticker-category {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 3px 7px;
          border-radius: 9999px;
          color: ${dark ? "#00D6A0" : "#008765"};
          background: ${
            dark
              ? "rgba(0, 214, 160, 0.10)"
              : "rgba(0, 168, 125, 0.06)"
          };
          border: 1px solid ${
            dark
              ? "rgba(0, 214, 160, 0.30)"
              : "rgba(0, 168, 125, 0.20)"
          };
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          white-space: nowrap;
          transition:
            color 0.3s ease,
            background 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease,
            transform 0.3s ease;
        }

        .ticker-item:hover .ticker-category {
          background: rgba(0, 214, 160, 0.15);
          border-color: rgba(0, 214, 160, 0.55);
          box-shadow: 0 0 16px rgba(0, 214, 160, 0.10);
          transform: scale(1.04);
        }

        /* NETWORK LOGOS */
        .ticker-logo {
          display: block;
          width: 16px;
          height: 16px;
          object-fit: contain;
          flex-shrink: 0;
          transition: transform 0.35s ease;
        }

        .ticker-category:hover .ticker-logo {
          transform: scale(1.15) rotate(-5deg);
        }

        /* SEPARATOR */
        .ticker-separator {
          margin-left: 8px;
          color: ${
            dark
              ? "rgba(0, 214, 160, 0.45)"
              : "rgba(0, 168, 125, 0.35)"
          };
          font-size: 18px;
          font-weight: 500;
          transition: color 0.3s ease;
          animation: separatorGlow 3s ease-in-out infinite;
        }

        /* STATUS DOT */
        .status-dot {
          position: relative;
          display: inline-block;
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #00D6A0;
          box-shadow:
            0 0 7px rgba(0, 214, 160, 0.45),
            0 0 14px rgba(0, 214, 160, 0.12);
          animation: greenPulse 2.5s ease-in-out infinite;
        }

        .status-dot::after {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(0, 214, 160, 0.45);
          border-radius: 50%;
          animation: statusRipple 2.5s ease-out infinite;
        }

        /* BACKGROUND PARTICLES */
        .ticker-bg-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #00D6A0;
          box-shadow: 0 0 8px rgba(0, 214, 160, 0.3);
          opacity: ${dark ? "0.25" : "0.18"};
          transition: opacity 0.5s ease;
        }

        .dot-1 {
          left: 7%;
          top: 25%;
          animation: bgDotFloat 5s ease-in-out infinite;
        }

        .dot-2 {
          left: 18%;
          top: 70%;
          animation: bgDotFloat 6s ease-in-out infinite 0.5s;
        }

        .dot-3 {
          left: 31%;
          top: 35%;
          animation: bgDotFloat 4.5s ease-in-out infinite 1s;
        }

        .dot-4 {
          left: 44%;
          top: 72%;
          animation: bgDotFloat 5.5s ease-in-out infinite 1.5s;
        }

        .dot-5 {
          left: 57%;
          top: 28%;
          animation: bgDotFloat 6s ease-in-out infinite 0.8s;
        }

        .dot-6 {
          left: 67%;
          top: 68%;
          animation: bgDotFloat 4.8s ease-in-out infinite 1.2s;
        }

        .dot-7 {
          left: 76%;
          top: 30%;
          animation: bgDotFloat 5.8s ease-in-out infinite 0.3s;
        }

        .dot-8 {
          left: 84%;
          top: 73%;
          animation: bgDotFloat 4.5s ease-in-out infinite 1.8s;
        }

        .dot-9 {
          left: 92%;
          top: 40%;
          animation: bgDotFloat 5.2s ease-in-out infinite 0.6s;
        }

        .dot-10 {
          left: 53%;
          top: 52%;
          width: 2px;
          height: 2px;
          animation: bgDotFloat 4s ease-in-out infinite 1.4s;
        }

        /* AMBIENT LIGHT */
        .ticker-ambient {
          animation: ambientBreath 7s ease-in-out infinite;
        }

        .ticker-center-glow {
          animation: centerGlow 5s ease-in-out infinite;
        }

        /* LIGHT SWEEP */
        .ticker-light-sweep {
          left: -20%;
          top: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 214, 160, 0.025),
            rgba(0, 214, 160, 0.08),
            rgba(0, 214, 160, 0.025),
            transparent
          );
          filter: blur(12px);
          animation: tickerLightSweep 9s ease-in-out infinite;
        }

        /* TOP ACCENT */
        .ticker-top-line {
          animation: topLineMove 5s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 5px rgba(0, 214, 160, 0.8));
        }

        /* TICKER MOVEMENT */
        @keyframes tickerScroll {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-33.333333%, 0, 0);
          }
        }

        /* GREEN PULSE */
        @keyframes greenPulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* STATUS RIPPLE */
        @keyframes statusRipple {
          0% {
            opacity: 0.7;
            transform: scale(0.6);
          }
          100% {
            opacity: 0;
            transform: scale(2.3);
          }
        }

        /* BACKGROUND DOT MOTION */
        @keyframes bgDotFloat {
          0%, 100% {
            opacity: 0.1;
            transform: translate3d(0, 0, 0) scale(0.8);
          }
          50% {
            opacity: 0.45;
            transform: translate3d(0, -5px, 0) scale(1.25);
          }
        }

        /* AMBIENT ANIMATION */
        @keyframes ambientBreath {
          0%, 100% {
            opacity: 0.65;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes centerGlow {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(0.85);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        @keyframes tickerLightSweep {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(160vw);
            opacity: 0;
          }
        }

        @keyframes topLineMove {
          from {
            transform: translateX(-20%);
          }
          to {
            transform: translateX(320%);
          }
        }

        @keyframes separatorGlow {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }

        /* MOBILE */
        @media (max-width: 640px) {
          .ticker-item {
            padding: 12px 14px;
            gap: 8px;
          }

          .ticker-label {
            font-size: 12px;
            font-weight: 800;
          }

          .ticker-category {
            gap: 4px;
            padding: 3px 6px;
            font-size: 8px;
          }

          .ticker-logo {
            width: 14px;
            height: 14px;
          }

          .ticker-track {
            animation-duration: 38s;
          }

          .ticker-separator {
            font-size: 16px;
          }

          .ticker-light-sweep {
            animation-duration: 12s;
          }
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          .ticker-track,
          .status-dot,
          .status-dot::after,
          .ticker-bg-dot,
          .ticker-ambient,
          .ticker-center-glow,
          .ticker-light-sweep,
          .ticker-top-line,
          .ticker-separator {
            animation: none !important;
          }

          .ticker-item,
          .ticker-category,
          .ticker-logo {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LiveTricker;
