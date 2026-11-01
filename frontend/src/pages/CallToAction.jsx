import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";
import {
  FiArrowUpRight,
  FiCheck,
  FiCode,
  FiDollarSign,
  FiLayers,
  FiPlus,
  FiShield,
  FiZap,
} from "react-icons/fi";

function CallToAction() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const { handleNavigate } = useNav();

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

  return (
    <section
      aria-labelledby="cta-heading"
      className="hb-cta-section relative z-10 mx-3 my-12 transition-colors duration-500 sm:mx-5 sm:my-14 md:mx-8 md:my-16 lg:mx-12"
    >
      <style>{`
        .hb-cta-section {
          --hb-green: #00D6A0;
          --hb-green-dark: #00A87D;
        }

        .hb-cta-shell {
          isolation: isolate;
          box-shadow: ${
            dark
              ? "0 24px 90px rgba(0,0,0,0.25)"
              : "0 24px 80px rgba(30,35,25,0.06)"
          };
          animation: hb-cta-shell-enter .9s cubic-bezier(.22,1,.36,1) both;
        }

        .hb-cta-grid {
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 92%);
          animation: hb-cta-grid-enter 1.4s ease both;
        }

        .hb-cta-content {
          opacity: 0;
          animation: hb-cta-enter .8s cubic-bezier(.22,1,.36,1) forwards;
        }

        .hb-cta-delay-1 {
          animation-delay: .12s;
        }

        .hb-cta-delay-2 {
          animation-delay: .24s;
        }

        .hb-cta-delay-3 {
          animation-delay: .36s;
        }

        .hb-cta-delay-4 {
          animation-delay: .48s;
        }

        .hb-cta-glow {
          animation: hb-cta-glow 8s ease-in-out infinite alternate;
        }

        .hb-cta-word {
          background: linear-gradient(100deg, #00D6A0, #70EBC5 55%, #00B98B);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: hb-cta-text-shine 6s ease-in-out infinite;
        }

        .hb-cta-step {
          opacity: 0;
          transform: translateY(25px) scale(.96);
          animation: hb-cta-card-enter .75s cubic-bezier(.22,1,.36,1) forwards;
          transition:
            border-color .3s ease,
            background-color .3s ease,
            box-shadow .3s ease,
            transform .3s ease;
        }

        .hb-cta-step:nth-child(1) {
          animation-delay: .35s;
        }

        .hb-cta-step:nth-child(2) {
          animation-delay: .52s;
        }

        .hb-cta-step:nth-child(3) {
          animation-delay: .69s;
        }

        .hb-cta-step:hover {
          transform: translateY(-5px) scale(1.015);
          box-shadow: 0 15px 35px rgba(0,214,160,0.08);
        }

        .hb-cta-step .hb-cta-step-icon {
          transition:
            transform .4s cubic-bezier(.22,1,.36,1),
            box-shadow .3s ease;
        }

        .hb-cta-step:hover .hb-cta-step-icon {
          transform: rotate(-7deg) scale(1.12);
          box-shadow: 0 0 24px rgba(0,214,160,.16);
        }

        .hb-cta-primary,
        .hb-cta-secondary {
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            background-color .25s ease,
            border-color .25s ease;
        }

        .hb-cta-primary:hover,
        .hb-cta-secondary:hover {
          transform: translateY(-3px);
        }

        .hb-cta-shimmer {
          animation: hb-cta-shimmer 5s ease-in-out infinite;
        }

        .hb-cta-trust-item {
          opacity: 0;
          animation: hb-cta-trust-enter .65s ease forwards;
        }

        .hb-cta-trust-item:nth-child(1) {
          animation-delay: .55s;
        }

        .hb-cta-trust-item:nth-child(2) {
          animation-delay: .68s;
        }

        .hb-cta-trust-item:nth-child(3) {
          animation-delay: .81s;
        }

        @keyframes hb-cta-shell-enter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes hb-cta-enter {
          from {
            opacity: 0;
            transform: translateY(22px);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes hb-cta-card-enter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.96);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes hb-cta-trust-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hb-cta-grid-enter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes hb-cta-glow {
          from {
            opacity: .35;
            transform: scale(.9);
          }
          to {
            opacity: .8;
            transform: scale(1.1);
          }
        }

        @keyframes hb-cta-text-shine {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }

        @keyframes hb-cta-shimmer {
          0%, 65%, 100% {
            transform: translateX(-180%) skewX(-18deg);
          }
          85% {
            transform: translateX(400%) skewX(-18deg);
          }
        }

        @media (max-width: 639px) {
          .hb-cta-grid {
            background-size: 34px 34px;
          }

          .hb-cta-step:hover {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-cta-section *,
          .hb-cta-section *::before,
          .hb-cta-section *::after {
            animation: none !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
            opacity: 1 !important;
            filter: none !important;
          }

          .hb-cta-step,
          .hb-cta-step:hover,
          .hb-cta-primary:hover,
          .hb-cta-secondary:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div
        className={`hb-cta-shell relative mx-auto max-w-[1400px] overflow-hidden rounded-[26px] border sm:rounded-[32px] lg:rounded-[38px] ${
          dark
            ? "border-white/[0.09] bg-[#0b0e0c]"
            : "border-black/[0.07] bg-white"
        }`}
      >
        {/* Background grid */}
        <div
          aria-hidden="true"
          className="hb-cta-grid pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${
              dark
                ? "rgba(0,214,160,0.04)"
                : "rgba(0,120,85,0.035)"
            } 1px, transparent 1px), linear-gradient(90deg, ${
              dark
                ? "rgba(0,214,160,0.04)"
                : "rgba(0,120,85,0.035)"
            } 1px, transparent 1px)`,
          }}
        />

        {/* Ambient lighting */}
        <div
          aria-hidden="true"
          className="hb-cta-glow pointer-events-none absolute -left-28 top-0 h-64 w-64 rounded-full bg-[#00D6A0]/[0.12] blur-[100px] sm:h-96 sm:w-96"
        />

        <div
          aria-hidden="true"
          className="hb-cta-glow pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[#00D6A0]/[0.08] blur-[100px] sm:h-96 sm:w-96"
          style={{ animationDelay: "2s" }}
        />

        {/* Decorative corner */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 top-0 hidden h-44 w-44 sm:block lg:h-56 lg:w-56 ${
            dark ? "opacity-35" : "opacity-45"
          }`}
        >
          <div className="absolute right-7 top-7 h-20 w-20 rounded-2xl border border-[#00D6A0]/25 lg:right-10 lg:top-10 lg:h-28 lg:w-28" />
          <div className="absolute right-12 top-12 h-20 w-20 rounded-2xl border border-[#00D6A0]/15 lg:right-16 lg:top-16 lg:h-28 lg:w-28" />
        </div>

        <div className="relative z-10 px-5 py-10 sm:px-8 sm:py-14 md:px-12 md:py-16 lg:px-16 lg:py-20">
          {/* Eyebrow label */}
          <div className="hb-cta-content flex justify-center">
            <div
              className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 ${
                dark
                  ? "border-[#00D6A0]/20 bg-[#00D6A0]/[0.06]"
                  : "border-[#008A66]/20 bg-[#00D6A0]/[0.06]"
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#00D6A0] opacity-30" />
                <span className="relative h-2 w-2 rounded-full bg-[#00D6A0]" />
              </span>

              <span
                className={`text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] ${
                  dark ? "text-[#00D6A0]" : "text-[#008A66]"
                }`}
              >
                Your next opportunity
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="hb-cta-content hb-cta-delay-1 mt-6 text-center sm:mt-8">
            <h2
              id="cta-heading"
              className={`mx-auto max-w-4xl text-3xl font-black leading-[1.08] tracking-[-0.05em] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ${
                dark ? "text-white" : "text-[#151914]"
              }`}
            >
              Your skills have value.
              <br />
              <span className="hb-cta-word">
                Put them to work.
              </span>
            </h2>

            <p
              className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:mt-6 sm:text-base md:text-[17px] ${
                dark ? "text-white/55" : "text-[#6e746a]"
              }`}
            >
              Discover meaningful tasks, contribute your skills, and earn
              rewards when your work gets approved. Have a task of your own?
              Bring it to the community.
            </p>
          </div>

          {/* Three-step workflow */}
          <div className="hb-cta-content hb-cta-delay-2 mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:mt-11 sm:grid-cols-3 sm:gap-4">
            <WorkflowStep
              dark={dark}
              number="01"
              icon={<FiCode />}
              title="Post a task"
              description="Set clear requirements and define the reward."
            />

            <WorkflowStep
              dark={dark}
              number="02"
              icon={<FiLayers />}
              title="Do meaningful work"
              description="Contribute your skills and submit your results."
            />

            <WorkflowStep
              dark={dark}
              number="03"
              icon={<FiDollarSign />}
              title="Earn your reward"
              description="Receive rewards when your work is approved."
              highlighted
            />
          </div>

          {/* CTA buttons */}
          <div className="hb-cta-content hb-cta-delay-3 mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <Link
              to="/dashboard"
              onClick={(event) => {
                event.preventDefault();
                handleNavigate("/dashboard");
              }}
              className="hb-cta-primary group relative inline-flex min-h-[50px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#00D6A0] px-6 py-3 text-sm font-bold text-[#06251b] shadow-[0_8px_28px_rgba(0,214,160,0.16)] hover:bg-[#00c394] hover:shadow-[0_12px_35px_rgba(0,214,160,0.24)] sm:min-w-[190px]"
            >
              <span className="relative z-10">Explore Bounties</span>

              <FiArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

              <span className="hb-cta-shimmer pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </Link>

            <Link
              to="/create"
              onClick={(event) => {
                event.preventDefault();
                handleNavigate("/create");
              }}
              className={`hb-cta-secondary group inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold sm:min-w-[190px] ${
                dark
                  ? "border-white/[0.12] bg-white/[0.035] text-white hover:border-[#00D6A0]/40 hover:bg-white/[0.06]"
                  : "border-black/[0.09] bg-white text-[#20251f] hover:border-[#00A87D]/40 hover:bg-[#00D6A0]/[0.035]"
              }`}
            >
              <FiPlus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 group-hover:text-[#00A87D]" />
              <span>Create a Bounty</span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className={`hb-cta-content hb-cta-delay-4 mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t pt-6 sm:mt-10 sm:gap-x-8 ${
              dark ? "border-white/[0.07]" : "border-black/[0.065]"
            }`}
          >
            <TrustItem
              dark={dark}
              icon={<FiShield />}
              label="Clear requirements"
            />
            <TrustItem
              dark={dark}
              icon={<FiZap />}
              label="Reward-driven tasks"
            />
            <TrustItem
              dark={dark}
              icon={<FiCheck />}
              label="Approval-based rewards"
            />
          </div>

          <p
            className={`mt-5 text-center text-[10px] leading-5 ${
              dark ? "text-white/30" : "text-[#898d83]"
            }`}
          >
            Built for Web3 collaboration. Supported networks and reward assets
            depend on the integrations enabled on Happy Bounty.
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({
  dark,
  number,
  icon,
  title,
  description,
  highlighted = false,
}) {
  return (
    <div
      className={`hb-cta-step group relative rounded-2xl border p-4 text-left sm:p-5 ${
        highlighted
          ? dark
            ? "border-[#00D6A0]/25 bg-[#00D6A0]/[0.055]"
            : "border-[#00A87D]/20 bg-[#00D6A0]/[0.045]"
          : dark
            ? "border-white/[0.075] bg-white/[0.025] hover:border-white/[0.13]"
            : "border-black/[0.065] bg-white/75 hover:border-[#00A87D]/25"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`hb-cta-step-icon flex h-10 w-10 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#00A87D] ${
            highlighted
              ? "shadow-[0_0_22px_rgba(0,214,160,0.08)]"
              : ""
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-[10px] font-bold tracking-[0.16em] ${
            dark ? "text-white/30" : "text-[#a0a399]"
          }`}
        >
          {number}
        </span>
      </div>

      <h3
        className={`mt-4 text-sm font-bold ${
          dark ? "text-white/90" : "text-[#252a23]"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1.5 text-xs leading-5 ${
          dark ? "text-white/45" : "text-[#777c72]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function TrustItem({ dark, icon, label }) {
  return (
    <div className="hb-cta-trust-item flex items-center gap-2">
      <span className="text-[#00A87D]">{icon}</span>

      <span
        className={`text-[10px] font-semibold sm:text-[11px] ${
          dark ? "text-white/45" : "text-[#777c72]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default CallToAction;