
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";

import {
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiCode,
  FiGift,
  FiHeart,
  FiMessageCircle,
  FiPenTool,
  FiZap,
} from "react-icons/fi";

import ArcLogo from "../assets/images/arc.png";
import BotchainLogo from "../assets/images/bot.png";
import WorldImage from "../assets/images/world.png";

const heroMessages = [
  "Earn Real Rewards.",
  "Complete Challenges.",
  "Build Your Skills.",
  "Create Opportunities.",
];

const skills = [
  {
    id: "coding",
    label: "Coding",
    detail: "Build & develop",
    icon: FiCode,
    className: "hb-skill-coding",
  },
  {
    id: "design",
    label: "Design",
    detail: "Create something",
    icon: FiPenTool,
    className: "hb-skill-design",
  },
  {
    id: "content",
    label: "Content",
    detail: "Share your ideas",
    icon: FiMessageCircle,
    className: "hb-skill-content",
  },
  {
    id: "ai",
    label: "AI & Innovation",
    detail: "Build the future",
    icon: FiZap,
    className: "hb-skill-ai",
  },
];

function NetworkBadge({ logo, name }) {
  return (
    <div className="hb-network-badge">
      <img src={logo} alt={`${name} logo`} />
      <span>{name}</span>
    </div>
  );
}

function FloatingSkill({ skill }) {
  const Icon = skill.icon;

  return (
    <div className={`hb-skill-float ${skill.className}`}>
      <span className="hb-skill-icon">
        <Icon />
      </span>

      <span className="hb-skill-info">
        <strong>{skill.label}</strong>
        <small>{skill.detail}</small>
      </span>
    </div>
  );
}

export default function Hero({ dark }) {
  const [heroText, setHeroText] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { handleNavigate } = useNav();

  useEffect(() => {
    const currentMessage = heroMessages[heroText];
    let timeout;

    if (!isDeleting && displayText === currentMessage) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setHeroText((previous) => (previous + 1) % heroMessages.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayText((previous) =>
          isDeleting
            ? previous.slice(0, -1)
            : currentMessage.slice(0, previous.length + 1)
        );
      }, isDeleting ? 30 : 65);
    }

    return () => clearTimeout(timeout);
  }, [displayText, heroText, isDeleting]);

  const navigate = (path) => (event) => {
    event.preventDefault();
    handleNavigate(path);
  };

  return (
    <section className={`hb-hero ${dark ? "hb-dark" : "hb-light"}`}>
      <div className="hb-grid" />
      <div className="hb-glow hb-glow-left" />
      <div className="hb-glow hb-glow-right" />

      <div className="hb-hero-container">
        {/* LEFT CONTENT */}

        <div className="hb-copy">
          <div className="hb-brand">
            <span className="hb-brand-icon">
              <FiZap />
            </span>
            <span>HAPPY BOUNTY</span>
          </div>

          <div className="hb-eyebrow">
            <span className="hb-live-dot" />
            <span>OPPORTUNITIES WITHOUT LIMITS</span>
          </div>

          <h1 className="hb-heading">
            Turn Your Skills
            <br />
            Into
            <br />
            <span>Real Rewards.</span>
          </h1>

          <p className="hb-description">
            Discover meaningful challenges, showcase what you can do, and
            earn rewards for your work. Your next opportunity starts here.
          </p>

          <div className="hb-typing">
            <span>{displayText}</span>
            <span className="hb-cursor" />
          </div>

          <div className="hb-actions">
            <Link
              to="/dashboard"
              onClick={navigate("/dashboard")}
              className="hb-button hb-button-primary"
            >
              Explore Bounties
              <FiArrowUpRight />
            </Link>

            <Link
              to="/create"
              onClick={navigate("/create")}
              className="hb-button hb-button-secondary"
            >
              Post a Bounty
              <FiArrowUpRight />
            </Link>
          </div>

          <div className="hb-powered">
            <span className="hb-powered-label">POWERED BY</span>
            <NetworkBadge logo={ArcLogo} name="Arc" />
            <NetworkBadge logo={BotchainLogo} name="Botchain" />
          </div>
        </div>

        {/* RIGHT SIDE - GLOBE VISUAL */}

        <div className="hb-visual">
          <div className="hb-visual-glow" />

          <div className="hb-orbit hb-orbit-one" />
          <div className="hb-orbit hb-orbit-two" />
          <div className="hb-orbit hb-orbit-three" />

          <div className="hb-visual-label">
            <span className="hb-live-dot" />
            CONNECTING SKILLS TO OPPORTUNITIES
          </div>

          {/* NETWORK LOGOS */}

          <div className="hb-floating-network hb-floating-arc">
            <img src={ArcLogo} alt="Arc Network" />
            <span>ARC</span>
          </div>

          <div className="hb-floating-network hb-floating-bot">
            <img src={BotchainLogo} alt="Botchain Network" />
            <span>BOTCHAIN</span>
          </div>

          {/* GLOBE */}

          <div className="hb-world-container">
            <div className="hb-world-halo" />

            <img
              src={WorldImage}
              alt="Digital world connecting creators, developers and opportunities"
              className="hb-world-image"
            />

            <div className="hb-world-shine" />
          </div>

          {/* FLOATING SKILL ICONS */}

          {skills.map((skill) => (
            <FloatingSkill key={skill.id} skill={skill} />
          ))}

          {/* REWARD NOTIFICATION */}

          <div className="hb-floating-reward">
            <span className="hb-floating-reward-icon">
              <FiGift />
            </span>

            <div>
              <small>REWARD UNLOCKED</small>
              <strong>250 USDC</strong>
            </div>

            <FiCheckCircle className="hb-floating-check" />
          </div>

          {/* APPROVAL NOTIFICATION */}

          <div className="hb-floating-approved">
            <span>
              <FiCheck />
            </span>
            Work Approved
          </div>

          {/* VISUAL CAPTION */}

          <div className="hb-visual-caption">
            <span>01</span>
            <i />
            <strong>ONE PLATFORM. MANY POSSIBILITIES.</strong>
          </div>
        </div>
      </div>

      <style>{`
        .hb-hero {
          --green: #00D6A0;
          --green-dark: #00A87D;
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 590px;
          overflow: hidden;
        }

        .hb-dark {
          background: #080B0D;
          color: #F8FFFC;
        }

        .hb-light {
          background: #F3F5F3;
          color: #111916;
        }

        .hb-grid {
          position: absolute;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          background-image:
            linear-gradient(
              ${dark ? "rgba(255,255,255,.025)" : "rgba(0,60,40,.035)"} 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              ${dark ? "rgba(255,255,255,.025)" : "rgba(0,60,40,.035)"} 1px,
              transparent 1px
            );
          background-size: 52px 52px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .hb-glow {
          position: absolute;
          z-index: -2;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: rgba(0,214,160,.11);
          filter: blur(85px);
          pointer-events: none;
        }

        .hb-glow-left {
          top: 8%;
          left: -220px;
        }

        .hb-glow-right {
          top: 12%;
          right: -180px;
          width: 480px;
          height: 480px;
          background: rgba(0,214,160,.13);
        }

        .hb-hero-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
          align-items: center;
          gap: 55px;
          width: 100%;
          max-width: 1320px;
          min-height: 590px;
          margin: 0 auto;
          padding: 80px 55px 65px;
        }

        /* LEFT CONTENT */

        .hb-copy {
          position: relative;
          z-index: 3;
          max-width: 490px;
          animation: hbFadeUp .8s ease both;
        }

        .hb-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 31px;
          font-size: 14px;
          font-weight: 950;
          letter-spacing: .12em;
        }

        .hb-brand-icon {
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.35);
          border-radius: 6px;
          background: rgba(0,214,160,.11);
          color: var(--green);
          font-size: 17px;
          box-shadow: 0 0 22px rgba(0,214,160,.12);
        }

        .hb-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 19px;
          padding: 8px 11px;
          border: 1px solid rgba(0,214,160,.25);
          border-radius: 4px;
          background: rgba(0,214,160,.07);
          color: ${dark ? "#9CF9DD" : "#007E62"};
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .11em;
        }

        .hb-live-dot {
          position: relative;
          display: inline-block;
          width: 6px;
          height: 6px;
          flex: 0 0 6px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 9px rgba(0,214,160,.7);
        }

        .hb-live-dot::after {
          position: absolute;
          inset: -3px;
          border: 1px solid var(--green);
          border-radius: 50%;
          content: "";
          animation: hbPing 2s ease-out infinite;
        }

        @keyframes hbPing {
          from {
            transform: scale(.5);
            opacity: .8;
          }
          to {
            transform: scale(2);
            opacity: 0;
          }
        }

        .hb-heading {
          margin: 0;
          font-size: clamp(42px, 4.5vw, 65px);
          font-weight: 950;
          line-height: 1.02;
          letter-spacing: -.07em;
        }

        .hb-heading span {
          color: var(--green);
          text-shadow: ${dark ? "0 0 30px rgba(0,214,160,.15)" : "none"};
        }

        .hb-description {
          max-width: 410px;
          margin-top: 21px;
          color: ${dark ? "rgba(255,255,255,.58)" : "#59665F"};
          font-size: 12px;
          line-height: 1.9;
        }

        .hb-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 25px;
          margin-top: 12px;
          color: var(--green);
          font-size: 12px;
          font-weight: 850;
        }

        .hb-cursor {
          display: inline-block;
          width: 2px;
          height: 15px;
          border-radius: 3px;
          background: var(--green);
          animation: hbBlink .8s step-end infinite;
        }

        @keyframes hbBlink {
          50% { opacity: 0; }
        }

        .hb-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 25px;
        }

        .hb-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 45px;
          padding: 0 19px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            background .25s ease,
            border-color .25s ease;
        }

        .hb-button svg {
          font-size: 15px;
          transition: transform .25s ease;
        }

        .hb-button:hover {
          transform: translateY(-2px);
        }

        .hb-button:hover svg {
          transform: translate(3px, -3px);
        }

        .hb-button-primary {
          background: var(--green);
          color: #05251B;
          box-shadow: 0 7px 20px rgba(0,214,160,.19);
        }

        .hb-button-primary:hover {
          background: #2BE8B8;
          box-shadow: 0 10px 25px rgba(0,214,160,.27);
        }

        .hb-button-secondary {
          border: 1px solid ${dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.13)"};
          background: ${dark ? "rgba(255,255,255,.045)" : "rgba(255,255,255,.8)"};
          color: ${dark ? "#fff" : "#17251D"};
        }

        .hb-button-secondary:hover {
          border-color: var(--green);
          color: var(--green);
          background: rgba(0,214,160,.07);
        }

        .hb-powered {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-top: 29px;
        }

        .hb-powered-label {
          margin-right: 3px;
          color: ${dark ? "rgba(255,255,255,.36)" : "#849188"};
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .11em;
        }

        .hb-network-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          border: 1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)"};
          border-radius: 4px;
          background: ${dark ? "rgba(255,255,255,.035)" : "#fff"};
          font-size: 9px;
          font-weight: 850;
          transition: .25s ease;
        }

        .hb-network-badge:hover {
          transform: translateY(-2px);
          border-color: rgba(0,214,160,.5);
        }

        .hb-network-badge img {
          width: 17px;
          height: 17px;
          object-fit: contain;
        }

        /* RIGHT GLOBE VISUAL */

        .hb-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          min-height: 500px;
          isolation: isolate;
          animation: hbVisualEnter 1s .15s ease both;
        }

        @keyframes hbVisualEnter {
          from {
            opacity: 0;
            transform: translateX(25px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hb-visual-glow {
          position: absolute;
          z-index: -3;
          width: 65%;
          height: 65%;
          border-radius: 50%;
          background: rgba(0,214,160,.18);
          filter: blur(85px);
          animation: hbGlowPulse 6s ease-in-out infinite;
        }

        @keyframes hbGlowPulse {
          0%, 100% {
            transform: scale(.85);
            opacity: .55;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .hb-orbit {
          position: absolute;
          z-index: -2;
          border: 1px solid rgba(0,214,160,.15);
          border-radius: 50%;
          pointer-events: none;
        }

        .hb-orbit-one {
          width: 90%;
          height: 57%;
          transform: rotate(-25deg);
          animation: hbOrbit 35s linear infinite;
        }

        .hb-orbit-two {
          width: 74%;
          height: 83%;
          transform: rotate(28deg);
          border-color: rgba(0,214,160,.10);
          animation: hbOrbit 45s linear infinite reverse;
        }

        .hb-orbit-three {
          width: 105%;
          height: 43%;
          transform: rotate(12deg);
          border-style: dashed;
          border-color: rgba(0,214,160,.09);
          animation: hbOrbit 55s linear infinite;
        }

        @keyframes hbOrbit {
          to { rotate: 360deg; }
        }

        .hb-visual-label {
          position: absolute;
          top: 2%;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 9px;
          color: ${dark ? "rgba(255,255,255,.55)" : "#718078"};
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .12em;
          white-space: nowrap;
          transform: translateX(-50%);
        }

        /* GLOBE IMAGE */

        .hb-world-container {
          position: relative;
          z-index: 1;
          display: grid;
          width: min(78%, 420px);
          aspect-ratio: 1;
          place-items: center;
          isolation: isolate;
          animation: hbWorldFloat 7s ease-in-out infinite;
        }

        @keyframes hbWorldFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .hb-world-halo {
          position: absolute;
          z-index: -2;
          inset: 8%;
          border-radius: 50%;
          background: rgba(0,214,160,.18);
          filter: blur(45px);
          animation: hbHaloPulse 5s ease-in-out infinite;
        }

        @keyframes hbHaloPulse {
          0%, 100% {
            transform: scale(.88);
            opacity: .45;
          }
          50% {
            transform: scale(1.12);
            opacity: .85;
          }
        }

        .hb-world-image {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          pointer-events: none;
          filter: ${dark
            ? "drop-shadow(0 0 24px rgba(0,214,160,.23))"
            : "drop-shadow(0 15px 25px rgba(0,120,80,.13))"};
          animation: hbWorldGlow 5s ease-in-out infinite;
        }

        @keyframes hbWorldGlow {
          0%, 100% {
            filter: ${dark
              ? "drop-shadow(0 0 20px rgba(0,214,160,.18))"
              : "drop-shadow(0 12px 22px rgba(0,120,80,.11))"};
          }
          50% {
            filter: ${dark
              ? "drop-shadow(0 0 34px rgba(0,214,160,.35))"
              : "drop-shadow(0 15px 30px rgba(0,120,80,.20))"};
          }
        }

        .hb-world-shine {
          position: absolute;
          z-index: 2;
          inset: 4%;
          border: 1px solid rgba(0,214,160,.16);
          border-radius: 50%;
          pointer-events: none;
          box-shadow:
            inset 0 0 30px rgba(0,214,160,.07),
            0 0 25px rgba(0,214,160,.06);
        }

        /* FLOATING NETWORK LOGOS */

        .hb-floating-network {
          position: absolute;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 7px;
          background: ${dark
            ? "rgba(9,28,20,.92)"
            : "rgba(255,255,255,.94)"};
          color: ${dark ? "#E9FFF5" : "#183B2D"};
          box-shadow: 0 10px 30px rgba(0,0,0,.10);
          backdrop-filter: blur(14px);
          animation: hbFloat 6s ease-in-out infinite;
        }

        .hb-floating-network img {
          width: 23px;
          height: 23px;
          object-fit: contain;
        }

        .hb-floating-network span {
          font-size: 8px;
          font-weight: 950;
          letter-spacing: .08em;
        }

        .hb-floating-arc {
          top: 12%;
          left: 1%;
        }

        .hb-floating-bot {
          top: 12%;
          right: 0;
          animation-delay: -3s;
        }

        /* FLOATING SKILL CARDS */

        .hb-skill-float {
          position: absolute;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 135px;
          padding: 10px 12px;
          border: 1px solid ${dark
            ? "rgba(0,214,160,.25)"
            : "rgba(0,145,99,.20)"};
          border-radius: 6px;
          background: ${dark
            ? "rgba(12,29,22,.94)"
            : "rgba(255,255,255,.95)"};
          color: ${dark ? "#F2FFF8" : "#1B3528"};
          box-shadow: 0 12px 30px rgba(0,0,0,.10);
          backdrop-filter: blur(14px);
          animation: hbFloat 5.5s ease-in-out infinite;
          transition: border-color .25s ease, box-shadow .25s ease;
        }

        .hb-skill-float:hover {
          border-color: var(--green);
          box-shadow: 0 12px 30px rgba(0,214,160,.14);
        }

        .hb-skill-icon {
          display: grid;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.2);
          border-radius: 5px;
          background: rgba(0,214,160,.12);
          color: var(--green);
          font-size: 16px;
        }

        .hb-skill-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hb-skill-info strong {
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
        }

        .hb-skill-info small {
          color: ${dark ? "rgba(255,255,255,.48)" : "#7B8980"};
          font-size: 7px;
          font-weight: 650;
          white-space: nowrap;
        }

        .hb-skill-coding {
          top: 28%;
          left: -1%;
          animation-delay: -1s;
        }

        .hb-skill-design {
          top: 32%;
          right: -2%;
          animation-delay: -3s;
        }

        .hb-skill-content {
          bottom: 23%;
          left: 0;
          animation-delay: -2s;
        }

        .hb-skill-ai {
          right: 0;
          bottom: 22%;
          animation-delay: -4s;
        }

        @keyframes hbFloat {
          0%, 100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -8px;
          }
        }

        /* REWARD NOTIFICATION */

        .hb-floating-reward {
          position: absolute;
          z-index: 6;
          bottom: 7%;
          left: 3%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 5px;
          background: ${dark
            ? "rgba(7,22,16,.96)"
            : "rgba(255,255,255,.97)"};
          box-shadow: 0 12px 30px rgba(0,0,0,.12);
          backdrop-filter: blur(15px);
          animation: hbFloat 5s ease-in-out infinite;
        }

        .hb-floating-reward-icon {
          display: grid;
          width: 29px;
          height: 29px;
          place-items: center;
          border-radius: 4px;
          background: rgba(0,214,160,.14);
          color: var(--green);
          font-size: 14px;
        }

        .hb-floating-reward small {
          display: block;
          color: ${dark ? "rgba(255,255,255,.48)" : "#7B8980"};
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .hb-floating-reward strong {
          display: block;
          margin-top: 3px;
          color: var(--green);
          font-size: 11px;
          font-weight: 950;
        }

        .hb-floating-check {
          margin-left: 2px;
          color: var(--green);
          font-size: 14px;
        }

        /* APPROVAL NOTIFICATION */

        .hb-floating-approved {
          position: absolute;
          z-index: 6;
          right: 2%;
          bottom: 7%;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 1px solid rgba(0,214,160,.28);
          border-radius: 5px;
          background: ${dark
            ? "rgba(7,22,16,.96)"
            : "rgba(255,255,255,.97)"};
          color: ${dark ? "#E4FFF4" : "#254336"};
          box-shadow: 0 10px 25px rgba(0,0,0,.10);
          font-size: 8px;
          font-weight: 900;
          backdrop-filter: blur(15px);
          animation: hbFloat 5s -2s ease-in-out infinite;
        }

        .hb-floating-approved > span {
          display: grid;
          width: 19px;
          height: 19px;
          place-items: center;
          border-radius: 50%;
          background: rgba(0,214,160,.15);
          color: var(--green);
        }

        .hb-visual-caption {
          position: absolute;
          right: 50%;
          bottom: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${dark ? "rgba(255,255,255,.4)" : "#849188"};
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .1em;
          white-space: nowrap;
          transform: translateX(50%);
        }

        .hb-visual-caption span {
          color: var(--green);
        }

        .hb-visual-caption i {
          width: 23px;
          height: 1px;
          background: var(--green);
        }

        @keyframes hbFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* TABLET */

        @media (max-width: 1100px) {
          .hb-hero-container {
            gap: 30px;
            padding-right: 30px;
            padding-left: 30px;
          }

          .hb-heading {
            font-size: clamp(39px, 5vw, 55px);
          }

          .hb-visual {
            min-height: 450px;
          }

          .hb-world-container {
            width: 75%;
          }

          .hb-skill-float {
            min-width: 120px;
            padding: 8px 9px;
          }
        }

        /* MOBILE AND SMALL TABLET */

        @media (max-width: 850px) {
          .hb-hero {
            min-height: auto;
          }

          .hb-hero-container {
            grid-template-columns: 1fr;
            gap: 20px;
            min-height: auto;
            padding: 85px 25px 40px;
          }

          .hb-copy {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
          }

          .hb-brand,
          .hb-actions,
          .hb-powered {
            justify-content: center;
          }

          .hb-brand {
            margin-bottom: 25px;
          }

          .hb-description {
            margin-right: auto;
            margin-left: auto;
          }

          .hb-typing {
            justify-content: center;
          }

          .hb-visual {
            width: 100%;
            max-width: 590px;
            min-height: 490px;
            margin: 0 auto;
          }

          .hb-world-container {
            width: min(70%, 390px);
          }

          .hb-floating-arc {
            left: 5%;
          }

          .hb-floating-bot {
            right: 5%;
          }

          .hb-skill-coding {
            left: 1%;
          }

          .hb-skill-design {
            right: 1%;
          }

          .hb-skill-content {
            left: 2%;
          }

          .hb-skill-ai {
            right: 2%;
          }
        }

        /* PHONE */

        @media (max-width: 560px) {
          .hb-hero-container {
            gap: 10px;
            padding: 78px 17px 35px;
          }

          .hb-brand {
            margin-bottom: 23px;
            font-size: 13px;
          }

          .hb-brand-icon {
            width: 29px;
            height: 29px;
          }

          .hb-eyebrow {
            margin-bottom: 16px;
            padding: 7px 9px;
            font-size: 7px;
          }

          .hb-heading {
            font-size: clamp(35px, 9vw, 47px);
            line-height: 1.03;
          }

          .hb-description {
            max-width: 350px;
            margin-top: 15px;
            font-size: 11px;
            line-height: 1.75;
          }

          .hb-typing {
            min-height: 22px;
            font-size: 11px;
          }

          .hb-actions {
            gap: 8px;
            margin-top: 19px;
          }

          .hb-button {
            min-height: 41px;
            padding: 0 13px;
            font-size: 9px;
          }

          .hb-powered {
            gap: 7px;
            margin-top: 21px;
          }

          .hb-powered-label {
            width: 100%;
            margin-bottom: 1px;
          }

          .hb-visual {
            min-height: 390px;
            margin-top: 8px;
          }

          .hb-visual-label {
            top: 1%;
            font-size: 6px;
          }

          .hb-world-container {
            width: 76%;
          }

          .hb-floating-network {
            gap: 5px;
            padding: 6px 8px;
          }

          .hb-floating-network img {
            width: 18px;
            height: 18px;
          }

          .hb-floating-network span {
            font-size: 6px;
          }

          .hb-floating-arc {
            top: 9%;
            left: 0;
          }

          .hb-floating-bot {
            top: 9%;
            right: 0;
          }

          .hb-skill-float {
            min-width: 108px;
            gap: 6px;
            padding: 7px;
          }

          .hb-skill-icon {
            width: 26px;
            height: 26px;
            flex-basis: 26px;
            font-size: 13px;
          }

          .hb-skill-info strong {
            font-size: 7px;
          }

          .hb-skill-info small {
            font-size: 6px;
          }

          .hb-skill-coding {
            top: 28%;
            left: -1%;
          }

          .hb-skill-design {
            top: 34%;
            right: -1%;
          }

          .hb-skill-content {
            bottom: 22%;
            left: -1%;
          }

          .hb-skill-ai {
            right: -1%;
            bottom: 21%;
          }

          .hb-floating-reward {
            bottom: 3%;
            left: 0;
            gap: 6px;
            padding: 6px 8px;
          }

          .hb-floating-reward-icon {
            width: 22px;
            height: 22px;
            font-size: 11px;
          }

          .hb-floating-reward small {
            font-size: 5px;
          }

          .hb-floating-reward strong {
            font-size: 9px;
          }

          .hb-floating-check {
            font-size: 11px;
          }

          .hb-floating-approved {
            right: 0;
            bottom: 3%;
            gap: 5px;
            padding: 6px 8px;
            font-size: 6px;
          }

          .hb-floating-approved > span {
            width: 15px;
            height: 15px;
          }

          .hb-visual-caption {
            bottom: -17px;
            font-size: 6px;
          }
        }

        @media (max-width: 390px) {
          .hb-hero-container {
            padding-right: 12px;
            padding-left: 12px;
          }

          .hb-heading {
            font-size: 33px;
          }

          .hb-button {
            padding: 0 10px;
            font-size: 8px;
          }

          .hb-visual {
            min-height: 350px;
          }

          .hb-world-container {
            width: 73%;
          }

          .hb-skill-float {
            min-width: 100px;
            padding: 6px;
          }

          .hb-skill-info strong {
            font-size: 6px;
          }

          .hb-skill-info small {
            font-size: 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-hero *,
          .hb-hero *::before,
          .hb-hero *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
