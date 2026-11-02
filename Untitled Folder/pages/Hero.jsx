
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiGift,
  FiGlobe,
  FiLayers,
  FiLink,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import ArcLogo from "../assets/images/arc.png";
import BotchainLogo from "../assets/images/bot.png";

const heroMessages = [
  "Crypto Bounties.",
  "Complete Quests.",
  "Build Your Skills.",
  "Get Rewarded.",
];

const networks = [
  { name: "Arc", logo: ArcLogo },
  { name: "Botchain", logo: BotchainLogo },
];

const tickerItems = [
  { name: "Arc Ecosystem", logo: ArcLogo },
  { name: "Botchain", logo: BotchainLogo },
  { name: "Native Token Rewards", logo: null },
  { name: "Real Opportunities", logo: null },
];

const features = [
  {
    icon: FiLink,
    title: "Multi-chain opportunities",
    description:
      "Discover bounty opportunities across supported ecosystems.",
  },
  {
    icon: FiGift,
    title: "Real rewards",
    description:
      "Complete tasks and earn rewards when your work is approved.",
  },
  {
    icon: FiShield,
    title: "Transparent workflow",
    description:
      "Submit your work and follow the bounty approval process.",
  },
  {
    icon: FiZap,
    title: "Build and earn",
    description:
      "Find your next challenge, contribute, and grow your skills.",
  },
];

function NetworkLogo({ logo, name, className = "" }) {
  return (
    <span className={`hb-logo-wrap ${className}`} aria-label={name}>
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="hb-logo-image"
          loading="eager"
          draggable="false"
        />
      ) : (
        <FiCheckCircle />
      )}
    </span>
  );
}

export default function Hero({ dark }) {
  const [heroText, setHeroText] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const visualRef = useRef(null);
  const { handleNavigate } = useNav();

  // Original typewriter animation preserved.
  useEffect(() => {
    const message = heroMessages[heroText];
    let timer;

    if (!isDeleting && displayText === message) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setHeroText((previous) => (previous + 1) % heroMessages.length);
    } else {
      timer = setTimeout(() => {
        setDisplayText((current) =>
          isDeleting
            ? current.slice(0, -1)
            : message.slice(0, current.length + 1)
        );
      }, isDeleting ? 38 : 72);
    }

    return () => clearTimeout(timer);
  }, [displayText, heroText, isDeleting]);

  // Original interactive tilt effect preserved.
  useEffect(() => {
    const visual = visualRef.current;

    if (
      !visual ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const handleMove = (event) => {
      const bounds = visual.getBoundingClientRect();

      if (!bounds.width || !bounds.height) return;

      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      visual.style.setProperty("--tilt-x", `${y * -3}deg`);
      visual.style.setProperty("--tilt-y", `${x * 3}deg`);
    };

    const resetTilt = () => {
      visual.style.setProperty("--tilt-x", "0deg");
      visual.style.setProperty("--tilt-y", "0deg");
    };

    visual.addEventListener("pointermove", handleMove);
    visual.addEventListener("pointerleave", resetTilt);

    return () => {
      visual.removeEventListener("pointermove", handleMove);
      visual.removeEventListener("pointerleave", resetTilt);
    };
  }, []);

  const navigate = (path) => (event) => {
    event.preventDefault();
    handleNavigate(path);
  };

  return (
    <section
      className={`hb-hero relative isolate w-full max-w-none overflow-x-clip overflow-y-hidden transition-colors duration-500 ${
        dark ? "bg-[#080B0D] text-white" : "bg-[#F3F5F3] text-[#111916]"
      }`}
    >
      {/* Background effects */}
      <div
        className="hb-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div className="hb-glow hb-glow-one pointer-events-none absolute" />
      <div className="hb-glow hb-glow-two pointer-events-none absolute" />

      {/* Hero content */}
      <div className="relative z-10 grid min-h-0 w-full max-w-none grid-cols-1 items-center gap-5 px-4 pb-8 pt-20 sm:gap-8 sm:px-8 sm:pb-12 sm:pt-24 lg:min-h-[720px] lg:grid-cols-2 lg:gap-8 lg:px-12 lg:pb-12 lg:pt-28 xl:px-16 2xl:px-20">
        {/* Left content */}
        <div className="mx-auto w-full max-w-2xl text-center sm:text-left lg:mx-0">
          {/* Platform badge */}
          <div
            className={`mb-5 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold tracking-wide backdrop-blur-xl sm:mb-6 sm:gap-2.5 sm:px-4 sm:text-xs ${
              dark
                ? "border-[#00D6A0]/25 bg-white/[0.035] text-white/85"
                : "border-[#00A87D]/25 bg-white/80 text-[#18251F] shadow-sm"
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D6A0] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[#00D6A0]" />
            </span>

            <span>Multi-Chain Bounty Platform</span>

            <span
              className={`hidden h-4 w-px sm:block ${
                dark ? "bg-white/15" : "bg-black/10"
              }`}
            />

            <span
              className={`hidden sm:inline ${
                dark ? "text-white/45" : "text-[#6C7771]"
              }`}
            >
              ARC · BOTCHAIN
            </span>
          </div>

          {/* Main heading */}
          <h1
            className={`text-[2.55rem] font-extrabold leading-[1.02] tracking-[-0.06em] min-[390px]:text-[2.8rem] sm:text-5xl md:text-6xl lg:text-[4.4rem] xl:text-[5rem] ${
              dark ? "text-white" : "text-[#111916]"
            }`}
          >
            Turn your skills
            <br />
            into <span className="hb-gradient-text">rewards.</span>
          </h1>

          {/* Animated headline */}
          <div className="mt-3 flex min-h-[38px] items-center justify-center overflow-hidden sm:mt-4 sm:min-h-[60px] sm:justify-start">
            <div className="flex max-w-full items-center whitespace-nowrap text-[clamp(1rem,5vw,1.5rem)] font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              <span className="text-[#00D6A0]">{displayText}</span>
              <span className="ml-1 inline-block h-[0.8em] w-[2px] shrink-0 rounded-full bg-[#00D6A0] sm:w-[3px]" />
            </div>
          </div>

          {/* Description */}
          <p
            className={`mx-auto mt-4 max-w-xl text-[13px] font-medium leading-6 sm:mx-0 sm:mt-5 sm:text-base sm:leading-7 ${
              dark ? "text-white/60" : "text-[#4C5A53]"
            }`}
          >
            Complete quests, earn crypto rewards, and build your skills across
            supported networks. Post bounties, find talented contributors, and
            get quality work done.
          </p>

          {/* Supported networks */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 sm:justify-start">
            {networks.map((network) => (
              <span
                key={network.name}
                className={`hb-network-pill ${
                  dark
                    ? "border-white/10 bg-white/[0.035] text-white/80"
                    : "border-black/[0.08] bg-white/75 text-[#33443A]"
                }`}
              >
                <NetworkLogo
                  logo={network.logo}
                  name={network.name}
                  className="hb-network-logo"
                />
                {network.name}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex w-full flex-col justify-center gap-3 sm:mt-7 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-start">
            <Link
              to="/dashboard"
              onClick={navigate("/dashboard")}
              className="hb-primary-btn group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D6A0] px-6 py-3.5 text-sm font-bold text-[#06251C] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24E6B4] sm:w-auto"
            >
              Explore Bounties
              <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            <Link
              to="/create"
              onClick={navigate("/create")}
              className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 sm:w-auto ${
                dark
                  ? "border-white/15 bg-white/[0.035] text-white hover:border-[#00D6A0]/60 hover:text-[#00D6A0]"
                  : "border-black/10 bg-white/80 text-[#17211C] shadow-sm hover:border-[#00A87D]/50 hover:text-[#008A66]"
              }`}
            >
              Create a Bounty
              <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          {/* Animated headline indicators */}
          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-7 sm:justify-start">
            <div className="flex gap-1.5">
              {heroMessages.map((message, index) => (
                <span
                  key={message}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === heroText
                      ? "w-7 bg-[#00D6A0]"
                      : dark
                        ? "w-1.5 bg-white/20"
                        : "w-1.5 bg-black/15"
                  }`}
                />
              ))}
            </div>

            <span
              className={`text-[10px] font-semibold sm:text-[11px] ${
                dark ? "text-white/45" : "text-[#6C7771]"
              }`}
            >
              Discover · Contribute · Earn
            </span>
          </div>
        </div>

        {/* Right visual */}
        <div
          ref={visualRef}
          className="hb-visual relative mx-auto flex min-h-[300px] w-full max-w-[720px] items-center justify-center sm:min-h-[400px] lg:min-h-[550px] lg:max-w-none"
        >
          <div className="hb-scene relative flex h-[300px] w-full items-center justify-center sm:h-[430px] lg:h-[540px]">
            <div className="hb-orbit hb-orbit-one" />
            <div className="hb-orbit hb-orbit-two" />
            <div className="hb-orbit hb-orbit-three" />
            <div className="hb-center-glow" />

            <span className="hb-node hb-node-one" />
            <span className="hb-node hb-node-two" />
            <span className="hb-node hb-node-three" />
            <span className="hb-node hb-node-four" />

            {/* Central platform */}
            <div
              className={`hb-core relative z-10 flex h-36 w-36 items-center justify-center rounded-full border sm:h-48 sm:w-48 ${
                dark
                  ? "border-[#00D6A0]/30 bg-[#091511]/90"
                  : "border-white/90 bg-white/90"
              }`}
            >
              <div className="flex h-[76%] w-[76%] flex-col items-center justify-center rounded-full border border-[#00D6A0]/20">
                <FiGlobe className="mb-2 h-7 w-7 text-[#00D6A0] sm:h-9 sm:w-9" />

                <span
                  className={`text-sm font-extrabold sm:text-lg ${
                    dark ? "text-white" : "text-[#13231B]"
                  }`}
                >
                  Happy Bounty
                </span>

                <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.13em] text-[#00D6A0] sm:text-[9px] sm:tracking-[0.16em]">
                  Work. Earn. Grow.
                </span>
              </div>
            </div>

            {/* Arc floating card */}
            <div
              className={`hb-orbit-card hb-card-arc ${
                dark ? "bg-[#0C1713]" : "bg-white"
              }`}
            >
              <NetworkLogo
                logo={ArcLogo}
                name="Arc"
                className="hb-token hb-arc"
              />
              <span>
                <strong>Arc</strong>
                <small>Explore bounties</small>
              </span>
            </div>

            {/* Botchain floating card */}
            <div
              className={`hb-orbit-card hb-card-botchain ${
                dark ? "bg-[#0C1713]" : "bg-white"
              }`}
            >
              <NetworkLogo
                logo={BotchainLogo}
                name="Botchain"
                className="hb-token hb-botchain"
              />
              <span>
                <strong>Botchain</strong>
                <small>Build and earn</small>
              </span>
            </div>

            {/* Reward card */}
            <div
              className={`hb-float-card hb-reward-card ${
                dark
                  ? "border-white/10 bg-[#111917]/95 text-white"
                  : "border-white bg-white/95 text-[#15231C]"
              }`}
            >
              <span className="hb-card-icon">
                <FiGift />
              </span>
              <span>
                <strong>Crypto rewards</strong>
                <small>Put your skills to work</small>
              </span>
            </div>

            {/* Approval card */}
            <div
              className={`hb-float-card hb-approval-card ${
                dark
                  ? "border-white/10 bg-[#111917]/95 text-white"
                  : "border-white bg-white/95 text-[#15231C]"
              }`}
            >
              <span className="hb-card-icon">
                <FiCheckCircle />
              </span>
              <span>
                <strong>Work gets rewarded</strong>
                <small>Submit. Get approved. Earn.</small>
              </span>
            </div>

            <div className="hb-mini-label hb-mini-left">
              <FiLayers />
              <span>One platform</span>
            </div>

            <div className="hb-mini-label hb-mini-right">
              <FiTrendingUp />
              <span>More opportunities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Moving network ticker */}
      <div className="relative z-10 w-full max-w-none px-4 pb-8 sm:px-8 sm:pb-10 lg:px-12 xl:px-16 2xl:px-20">
        <div
          className={`hb-ticker overflow-hidden rounded-2xl border ${
            dark
              ? "border-white/10 bg-white/[0.025]"
              : "border-black/[0.07] bg-white/65"
          }`}
        >
          <div className="hb-ticker-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="hb-ticker-group"
                aria-hidden={copy === 1}
              >
                {tickerItems.map((item) => (
                  <div className="hb-ticker-item" key={item.name}>
                    <NetworkLogo
                      logo={item.logo}
                      name={item.name}
                      className="hb-ticker-logo"
                    />
                    <span
                      className={`text-xs font-bold sm:text-sm ${
                        dark ? "text-white/75" : "text-[#293A31]"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="hb-separator">/</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 grid w-full max-w-none grid-cols-1 gap-3 px-4 pb-12 sm:grid-cols-2 sm:px-8 sm:pb-16 lg:grid-cols-4 lg:px-12 lg:pb-20 xl:px-16 2xl:px-20">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className={`hb-feature rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                dark
                  ? "border-white/[0.08] bg-white/[0.025] hover:border-[#00D6A0]/30"
                  : "border-black/[0.07] bg-white/70 hover:border-[#00A87D]/30 hover:bg-white"
              }`}
            >
              <span className="hb-feature-icon">
                <Icon />
              </span>

              <h2
                className={`mt-4 text-sm font-extrabold ${
                  dark ? "text-white" : "text-[#17251D]"
                }`}
              >
                {feature.title}
              </h2>

              <p
                className={`mt-2 text-xs leading-6 ${
                  dark ? "text-white/50" : "text-[#657168]"
                }`}
              >
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>

      {/* Component styles */}
      <style>{`
        .hb-hero {
          --hb-green: #00D6A0;
          --hb-green-dark: #00A87D;
          isolation: isolate;
          width: 100%;
          max-width: none;
        }

        .hb-grid {
          opacity: ${dark ? ".17" : ".10"};
          background-image:
            linear-gradient(to right, ${
              dark ? "rgba(255,255,255,.045)" : "rgba(15,55,38,.06)"
            } 1px, transparent 1px),
            linear-gradient(to bottom, ${
              dark ? "rgba(255,255,255,.045)" : "rgba(15,55,38,.06)"
            } 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: linear-gradient(to bottom, black, transparent 95%);
        }

        .hb-glow {
          position: absolute;
          width: 25rem;
          height: 25rem;
          border-radius: 50%;
          background: #00D6A0;
          filter: blur(105px);
          pointer-events: none;
        }

        .hb-glow-one {
          top: 4rem;
          right: -13rem;
          opacity: ${dark ? ".10" : ".08"};
        }

        .hb-glow-two {
          bottom: 0;
          left: -15rem;
          opacity: ${dark ? ".07" : ".045"};
        }

        .hb-gradient-text {
          background: linear-gradient(100deg, #00D6A0, #58F4C5, #00A87D);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hb-primary-btn {
          box-shadow: 0 10px 30px rgba(0,214,160,.16);
        }

        .hb-primary-btn:hover {
          box-shadow: 0 14px 36px rgba(0,214,160,.24);
        }

        .hb-network-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border: 1px solid;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          transition: transform .25s ease, border-color .25s ease;
        }

        .hb-network-pill:hover {
          transform: translateY(-2px);
          border-color: rgba(0,214,160,.55);
        }

        .hb-logo-wrap {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hb-logo-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .hb-network-logo {
          width: 22px;
          height: 22px;
          padding: 2px;
          border-radius: 50%;
        }

        .hb-visual {
          perspective: 1200px;
          --tilt-x: 0deg;
          --tilt-y: 0deg;
        }

        .hb-scene {
          transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
          transform-style: preserve-3d;
          transition: transform 450ms cubic-bezier(.16,1,.3,1);
        }

        .hb-orbit {
          position: absolute;
          border: 1px solid rgba(0,214,160,.19);
          border-radius: 50%;
          pointer-events: none;
        }

        .hb-orbit-one {
          width: 86%;
          height: 43%;
          transform: rotate(-28deg);
          animation: hbOrbitOne 24s linear infinite;
        }

        .hb-orbit-two {
          width: 68%;
          height: 66%;
          border-color: ${
            dark ? "rgba(255,255,255,.12)" : "rgba(10,70,48,.13)"
          };
          transform: rotate(35deg);
          animation: hbOrbitTwo 28s linear infinite;
        }

        .hb-orbit-three {
          width: 55%;
          height: 82%;
          border-color: rgba(0,214,160,.13);
          transform: rotate(55deg);
          animation: hbOrbitOne 36s linear infinite;
        }

        .hb-center-glow {
          position: absolute;
          width: 45%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: rgba(0,214,160,.14);
          filter: blur(55px);
          animation: hbGlowPulse 5s ease-in-out infinite;
        }

        .hb-core {
          border-color: rgba(0,214,160,.3);
          box-shadow:
            0 0 0 10px rgba(0,214,160,.025),
            0 0 0 22px rgba(0,214,160,.025),
            0 0 75px rgba(0,214,160,.12),
            inset 0 0 40px rgba(0,214,160,.07);
          backdrop-filter: blur(18px);
          animation: hbCoreFloat 6s ease-in-out infinite;
        }

        .hb-orbit-card {
          position: absolute;
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px 9px 9px;
          border: 1px solid ${
            dark ? "rgba(255,255,255,.12)" : "rgba(15,55,38,.10)"
          };
          border-radius: 16px;
          box-shadow: 0 14px 38px rgba(0,0,0,.10);
          backdrop-filter: blur(18px);
          animation: hbBadgeFloat 6s ease-in-out infinite;
        }

        .hb-token {
          display: inline-flex;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          align-items: center;
          justify-content: center;
          padding: 7px;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 50%;
          box-shadow: 0 0 22px rgba(0,214,160,.08);
        }

        .hb-token img {
          border-radius: 50%;
        }

        .hb-arc {
          background: linear-gradient(135deg, #5834B8, #29165D);
        }

        .hb-botchain {
          background: linear-gradient(135deg, #087D60, #064B3D);
        }

        .hb-orbit-card strong {
          display: block;
          color: ${dark ? "#fff" : "#17251D"};
          font-size: 11px;
          font-weight: 800;
        }

        .hb-orbit-card small {
          display: block;
          margin-top: 3px;
          color: ${dark ? "rgba(255,255,255,.48)" : "#718078"};
          font-size: 9px;
          white-space: nowrap;
        }

        .hb-card-arc {
          top: 23%;
          left: 2%;
          animation-delay: -1s;
        }

        .hb-card-botchain {
          right: 5%;
          bottom: 19%;
          animation-delay: -2s;
        }

        .hb-float-card {
          position: absolute;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 230px;
          padding: 11px 13px;
          border: 1px solid;
          border-radius: 15px;
          box-shadow: 0 18px 48px rgba(0,0,0,.10);
          backdrop-filter: blur(16px);
          animation: hbCardFloat 6s ease-in-out infinite;
        }

        .hb-reward-card {
          top: 5%;
          left: 20%;
          animation-delay: -2s;
        }

        .hb-approval-card {
          bottom: 5%;
          left: 0;
          animation-delay: -4s;
        }

        .hb-card-icon {
          display: flex;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(0,214,160,.12);
          color: #00D6A0;
          font-size: 16px;
        }

        .hb-float-card strong {
          display: block;
          font-size: 11px;
          font-weight: 800;
        }

        .hb-float-card small {
          display: block;
          margin-top: 3px;
          font-size: 9px;
          opacity: .6;
          white-space: nowrap;
        }

        .hb-mini-label {
          position: absolute;
          z-index: 15;
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${dark ? "#00D6A0" : "#008A66"};
          font-size: 10px;
          font-weight: 800;
        }

        .hb-mini-left {
          top: 39%;
          left: 0;
        }

        .hb-mini-right {
          right: 0;
          bottom: 36%;
        }

        .hb-node {
          position: absolute;
          z-index: 5;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00D6A0;
          box-shadow: 0 0 18px rgba(0,214,160,.8);
          animation: hbNodePulse 3.5s ease-in-out infinite;
        }

        .hb-node-one {
          top: 15%;
          left: 38%;
        }

        .hb-node-two {
          top: 41%;
          right: 17%;
          animation-delay: -1s;
        }

        .hb-node-three {
          bottom: 24%;
          left: 21%;
          animation-delay: -2s;
        }

        .hb-node-four {
          right: 29%;
          bottom: 12%;
          animation-delay: -2.5s;
        }

        .hb-ticker {
          border-color: rgba(0,214,160,.17);
          mask-image: linear-gradient(
            to right,
            transparent,
            black 3%,
            black 97%,
            transparent
          );
        }

        .hb-ticker-track {
          display: flex;
          width: max-content;
          animation: hbTickerMove 38s linear infinite;
        }

        .hb-ticker:hover .hb-ticker-track {
          animation-play-state: paused;
        }

        .hb-ticker-group {
          display: flex;
          flex-shrink: 0;
          align-items: center;
        }

        .hb-ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          white-space: nowrap;
        }

        .hb-ticker-logo {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          padding: 4px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 50%;
          background: rgba(0,214,160,.10);
        }

        .hb-separator {
          margin-left: 9px;
          color: #00D6A0;
          font-size: 16px;
        }

        .hb-feature {
          backdrop-filter: blur(10px);
        }

        .hb-feature-icon {
          display: inline-flex;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0,214,160,.18);
          border-radius: 13px;
          background: rgba(0,214,160,.09);
          color: #00D6A0;
          font-size: 18px;
        }

        @keyframes hbOrbitOne {
          from { transform: rotate(-28deg); }
          to { transform: rotate(332deg); }
        }

        @keyframes hbOrbitTwo {
          from { transform: rotate(35deg); }
          to { transform: rotate(-325deg); }
        }

        @keyframes hbGlowPulse {
          0%, 100% { opacity: .65; transform: scale(.95); }
          50% { opacity: 1; transform: scale(1.12); }
        }

        @keyframes hbCoreFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes hbBadgeFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -7px; }
        }

        @keyframes hbCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes hbNodePulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.4); }
        }

        @keyframes hbTickerMove {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* Mobile refinements */
        @media (max-width: 640px) {
          .hb-visual {
            min-height: 290px;
          }

          .hb-scene {
            height: 290px;
          }

          .hb-orbit-one {
            width: 100%;
            height: 45%;
          }

          .hb-orbit-two {
            width: 82%;
            height: 70%;
          }

          .hb-orbit-three {
            width: 63%;
            height: 82%;
          }

          .hb-orbit-card {
            gap: 6px;
            padding: 7px;
            border-radius: 13px;
          }

          .hb-token {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
            padding: 5px;
          }

          .hb-orbit-card strong {
            font-size: 10px;
          }

          .hb-orbit-card small {
            font-size: 8px;
          }

          .hb-card-arc {
            top: 20%;
            left: 0;
          }

          .hb-card-botchain {
            right: 0;
            bottom: 17%;
          }

          .hb-reward-card {
            top: 1%;
            left: 16%;
          }

          .hb-approval-card {
            bottom: 0;
            left: 0;
          }

          .hb-float-card {
            max-width: 185px;
            padding: 9px;
            gap: 7px;
          }

          .hb-float-card strong {
            font-size: 9px;
          }

          .hb-float-card small {
            font-size: 8px;
          }

          .hb-card-icon {
            width: 29px;
            height: 29px;
            flex-basis: 29px;
          }

          .hb-mini-label {
            font-size: 8px;
          }

          .hb-mini-left {
            top: 43%;
            left: 1%;
          }

          .hb-mini-right {
            right: 1%;
            bottom: 37%;
          }

          .hb-ticker-item {
            gap: 8px;
            padding: 12px 14px;
          }

          .hb-ticker-logo {
            width: 24px;
            height: 24px;
            flex-basis: 24px;
          }
        }

        @media (max-width: 390px) {
          .hb-orbit-card small {
            display: none;
          }

          .hb-orbit-card {
            padding: 6px;
          }

          .hb-card-arc {
            top: 21%;
            left: 0;
          }

          .hb-card-botchain {
            right: 0;
          }

          .hb-reward-card {
            left: 13%;
          }

          .hb-approval-card {
            max-width: 170px;
          }

          .hb-mini-label {
            font-size: 7px;
          }

          .hb-mini-left {
            top: 45%;
          }

          .hb-mini-right {
            bottom: 38%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-glow,
          .hb-orbit,
          .hb-center-glow,
          .hb-core,
          .hb-orbit-card,
          .hb-float-card,
          .hb-node,
          .hb-ticker-track {
            animation: none !important;
          }

          .hb-scene {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
