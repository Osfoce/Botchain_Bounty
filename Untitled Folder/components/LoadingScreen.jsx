
import { useEffect, useState } from "react";
import happyBountyLogo from "../assets/images/happy-bounty-logo.png";

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2200;
    const start = performance.now();

    let animationFrame;
    let completeTimeout;
    let fadeTimeout;

    const animate = (time) => {
      const elapsed = time - start;
      const percentage = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - percentage, 3);

      setProgress(Math.floor(eased * 100));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        completeTimeout = setTimeout(() => {
          setFadeOut(true);

          fadeTimeout = setTimeout(() => {
            onComplete?.();
          }, 500);
        }, 250);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(completeTimeout);
      clearTimeout(fadeTimeout);
    };
  }, [onComplete]);

  const floatingCoins = [
    { left: "4%", top: "12%", size: 18, delay: "0s", duration: "8s", rotate: "-8deg" },
    { left: "12%", top: "32%", size: 12, delay: "1.5s", duration: "10s", rotate: "12deg" },
    { left: "7%", top: "68%", size: 22, delay: "3s", duration: "11s", rotate: "-15deg" },
    { left: "18%", top: "84%", size: 14, delay: "0.5s", duration: "9s", rotate: "8deg" },
    { left: "28%", top: "10%", size: 11, delay: "2s", duration: "12s", rotate: "-10deg" },
    { left: "35%", top: "24%", size: 16, delay: "4s", duration: "9s", rotate: "15deg" },
    { left: "25%", top: "72%", size: 13, delay: "1s", duration: "10s", rotate: "-6deg" },
    { left: "39%", top: "88%", size: 20, delay: "3.5s", duration: "12s", rotate: "10deg" },
    { left: "58%", top: "9%", size: 15, delay: "1s", duration: "11s", rotate: "-12deg" },
    { left: "67%", top: "18%", size: 11, delay: "3s", duration: "9s", rotate: "7deg" },
    { left: "73%", top: "38%", size: 19, delay: "0s", duration: "10s", rotate: "-14deg" },
    { left: "62%", top: "78%", size: 13, delay: "2.5s", duration: "12s", rotate: "9deg" },
    { left: "82%", top: "12%", size: 21, delay: "4s", duration: "11s", rotate: "-7deg" },
    { left: "91%", top: "28%", size: 13, delay: "1s", duration: "9s", rotate: "13deg" },
    { left: "86%", top: "58%", size: 17, delay: "2s", duration: "10s", rotate: "-11deg" },
    { left: "94%", top: "82%", size: 11, delay: "0.5s", duration: "12s", rotate: "8deg" },
    { left: "48%", top: "5%", size: 9, delay: "3s", duration: "8s", rotate: "5deg" },
    { left: "52%", top: "92%", size: 16, delay: "1.5s", duration: "11s", rotate: "-9deg" },
  ];

  return (
    <div
      className={`loading-screen fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="loading-center-glow absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

        <div className="loading-corner-glow absolute left-[10%] top-[16%] h-32 w-32 rounded-full blur-[90px]" />

        <div className="loading-corner-glow absolute bottom-[12%] right-[10%] h-40 w-40 rounded-full blur-[100px]" />

        {/* BLOCKCHAIN-INSPIRED BACKGROUND PATTERN */}
        <div
          className="loading-brick absolute -inset-20 scale-110"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 95, 72, 0.65) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 95, 72, 0.65) 1px, transparent 1px)
            `,
            backgroundSize: "150px 76px",
            backgroundPosition: "0 0, 75px 38px",
          }}
        />

        <div
          className="loading-depth absolute -inset-20 scale-110 blur-[8px]"
          style={{
            backgroundImage: `
              radial-gradient(
                ellipse at center,
                rgba(0, 95, 72, 0.55) 0%,
                rgba(0, 95, 72, 0.18) 35%,
                transparent 70%
              )
            `,
            backgroundSize: "170px 90px",
            backgroundPosition: "20px 10px",
          }}
        />

        <div className="loading-center absolute inset-0" />

        {/* FLOATING PARTICLES */}
        {floatingCoins.map((coin, index) => (
          <div
            key={index}
            className="absolute opacity-[0.11]"
            style={{
              left: coin.left,
              top: coin.top,
              animation: `backgroundCoinFloat ${coin.duration} ease-in-out ${coin.delay} infinite`,
            }}
          >
            <span
              aria-hidden="true"
              className="block rounded-full border border-[#00D6A0]/40 bg-[#00D6A0]/20 shadow-[0_0_18px_rgba(0,214,160,0.25)]"
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                transform: `rotate(${coin.rotate})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* SUBTLE GRID */}
      <div className="loading-grid pointer-events-none absolute inset-0" />

      {/* SCAN LINE */}
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full animate-[scan_3s_linear_infinite] bg-gradient-to-r from-transparent via-[#00D6A0]/40 to-transparent" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        {/* HAPPY BOUNTY LOGO */}
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
          <div className="loading-ring-outer absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full border border-t-[#00D6A0]/70" />

          <div className="loading-ring-inner absolute inset-3 animate-[spin_7s_linear_infinite_reverse] rounded-full border border-b-[#00A87D]/50" />

          <div className="loading-coin-glow absolute h-24 w-24 rounded-full blur-2xl" />

          <div className="relative z-10 flex h-20 w-20 animate-[coinFloat_4s_ease-in-out_infinite] items-center justify-center overflow-hidden rounded-[1.65rem] border border-[#00D6A0]/50 bg-[#071713] p-2 shadow-[0_0_45px_rgba(0,214,160,0.22),inset_0_0_20px_rgba(0,214,160,0.08)]">
            <img
              src={happyBountyLogo}
              alt="Happy Bounty logo"
              className="h-full w-full rounded-2xl object-contain"
              draggable="false"
            />
          </div>

          <span className="absolute right-1 top-7 h-2 w-2 animate-pulse rounded-full bg-[#00D6A0] shadow-[0_0_12px_rgba(0,214,160,0.45)]" />

          <span className="absolute bottom-5 left-3 h-1.5 w-1.5 animate-pulse rounded-full bg-[#00A87D] shadow-[0_0_10px_rgba(0,168,125,0.35)]" />
        </div>

        {/* PLATFORM BRAND */}
        <h1 className="loading-title text-center text-2xl font-bold tracking-[0.2em]">
          HAPPY BOUNTY
        </h1>

        <p className="loading-subtitle mt-2 text-center text-[10px] font-medium uppercase tracking-[0.35em]">
          One Platform. Multiple Chains.
        </p>

        {/* MULTI-CHAIN BADGE */}
        <div className="loading-badge mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D6A0] opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
          </span>

          <span className="loading-badge-text text-[9px] font-semibold uppercase tracking-[0.2em]">
            Multi-Chain Ecosystem
          </span>
        </div>

        {/* PROGRESS */}
        <div className="mt-10 w-full">
          <div className="mb-3 flex items-center justify-between">
            <span className="loading-label text-[10px] font-medium uppercase tracking-[0.2em]">
              Preparing Your Experience
            </span>

            <span className="font-mono text-xs font-medium text-[#00A87D]">
              {progress}%
            </span>
          </div>

          <div className="loading-progress-track h-[3px] w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-[#00D6A0] transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="loading-status mt-6 flex w-full items-center justify-between text-[9px] uppercase tracking-[0.18em]">
          <span>
            {progress < 35
              ? "Connecting"
              : progress < 70
                ? "Loading Bounties"
                : progress < 100
                  ? "Preparing Rewards"
                  : "Ready"}
          </span>

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00D6A0]" />
            Platform Online
          </span>
        </div>

        {/* BOTTOM MESSAGE */}
        <div className="loading-bottom mt-10 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em]">
          <span>Discover</span>
          <span className="loading-divider h-px w-5" />
          <span>Contribute</span>
          <span className="loading-divider h-px w-5" />
          <span>Earn</span>
        </div>
      </div>

      {/* CORNER DETAILS */}
      <div className="loading-corner-text absolute left-6 top-6 text-[8px] uppercase tracking-[0.25em]">
        HB // 001
      </div>

      <div className="loading-corner-text absolute bottom-6 right-6 text-[8px] uppercase tracking-[0.25em]">
        MULTI-CHAIN // WEB3
      </div>

      {/* THEME STYLES */}
      <style>{`
        .loading-screen {
          background: #f6f5ef;
          color: #111111;
        }

        .loading-center-glow {
          background: rgba(0, 214, 160, 0.025);
        }

        .loading-corner-glow {
          background: rgba(0, 214, 160, 0.018);
        }

        .loading-brick {
          opacity: 0.025;
        }

        .loading-depth {
          opacity: 0.012;
        }

        .loading-center {
          background: radial-gradient(
            circle at center,
            rgba(246, 245, 239, 0.92) 0%,
            rgba(246, 245, 239, 0.62) 45%,
            rgba(246, 245, 239, 0.2) 100%
          );
        }

        .loading-grid {
          opacity: 0.014;
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.25) 1px, transparent 1px);
          background-size: 70px 70px;
        }

        .loading-ring-outer {
          border-color: rgba(0, 0, 0, 0.06);
        }

        .loading-ring-inner {
          border-color: rgba(0, 0, 0, 0.05);
        }

        .loading-coin-glow {
          background: rgba(0, 214, 160, 0.07);
        }

        .loading-title {
          color: #111111;
        }

        .loading-subtitle {
          color: rgba(0, 0, 0, 0.35);
        }

        .loading-badge {
          border-color: rgba(0, 0, 0, 0.05);
          background: rgba(255, 255, 255, 0.6);
        }

        .loading-badge-text {
          color: rgba(0, 0, 0, 0.45);
        }

        .loading-label {
          color: rgba(0, 0, 0, 0.4);
        }

        .loading-progress-track {
          background: rgba(0, 0, 0, 0.07);
        }

        .loading-status {
          color: rgba(0, 0, 0, 0.3);
        }

        .loading-bottom {
          color: rgba(0, 0, 0, 0.2);
        }

        .loading-divider {
          background: rgba(0, 0, 0, 0.1);
        }

        .loading-corner-text {
          color: rgba(0, 0, 0, 0.2);
        }

        /* DARK MODE */
        .dark .loading-screen {
          background: #080908;
          color: #ffffff;
        }

        .dark .loading-center-glow {
          background: rgba(0, 214, 160, 0.035);
        }

        .dark .loading-corner-glow {
          background: rgba(0, 214, 160, 0.025);
        }

        .dark .loading-brick {
          opacity: 0.045;
        }

        .dark .loading-depth {
          opacity: 0.025;
        }

        .dark .loading-center {
          background: radial-gradient(
            circle at center,
            rgba(8, 9, 8, 0.78) 0%,
            rgba(8, 9, 8, 0.48) 45%,
            rgba(8, 9, 8, 0.08) 100%
          );
        }

        .dark .loading-grid {
          opacity: 0.025;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 70px 70px;
        }

        .dark .loading-ring-outer {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .dark .loading-ring-inner {
          border-color: rgba(255, 255, 255, 0.06);
        }

        .dark .loading-coin-glow {
          background: rgba(0, 214, 160, 0.09);
        }

        .dark .loading-title {
          color: #ffffff;
        }

        .dark .loading-subtitle {
          color: rgba(255, 255, 255, 0.4);
        }

        .dark .loading-badge {
          border-color: rgba(0, 214, 160, 0.18);
          background: rgba(18, 18, 18, 0.72);
        }

        .dark .loading-badge-text {
          color: rgba(255, 255, 255, 0.52);
        }

        .dark .loading-label {
          color: rgba(255, 255, 255, 0.45);
        }

        .dark .loading-progress-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .dark .loading-status {
          color: rgba(255, 255, 255, 0.35);
        }

        .dark .loading-bottom {
          color: rgba(255, 255, 255, 0.25);
        }

        .dark .loading-divider {
          background: rgba(255, 255, 255, 0.12);
        }

        .dark .loading-corner-text {
          color: rgba(255, 255, 255, 0.25);
        }

        /* ANIMATIONS */
        @keyframes scan {
          0% {
            transform: translateY(-10vh);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          80% {
            opacity: 1;
          }

          100% {
            transform: translateY(110vh);
            opacity: 0;
          }
        }

        @keyframes coinFloat {
          0%, 100% {
            transform: translateY(0) rotateZ(-2deg);
          }

          50% {
            transform: translateY(-8px) rotateZ(2deg);
          }
        }

        @keyframes backgroundCoinFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          25% {
            transform: translate3d(5px, -10px, 0) rotate(4deg);
          }

          50% {
            transform: translate3d(-4px, -18px, 0) rotate(-5deg);
          }

          75% {
            transform: translate3d(7px, -8px, 0) rotate(3deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-screen *,
          .loading-screen *::before,
          .loading-screen *::after {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (max-width: 480px) {
          .loading-bottom {
            gap: 0.5rem;
            letter-spacing: 0.15em;
          }

          .loading-corner-text {
            font-size: 7px;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
