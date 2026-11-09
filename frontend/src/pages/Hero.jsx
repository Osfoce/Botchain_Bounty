
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";

import {
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiCode,
  FiGift,
  FiFileText,
  FiHeart,
  FiMessageCircle,
  FiPenTool,
  FiZap,
} from "react-icons/fi";

import ArcLogo from "../assets/images/arc.png";
import BotchainLogo from "../assets/images/bot.png";

const heroMessages = [
  "Earn Real Rewards.",
  "Complete Challenges.",
  "Build Your Skills.",
  "Create Opportunities.",
];

const floatingCards = [
  {
    id: "coding",
    title: "Frontend Development",
    category: "CODING",
    reward: "250 USDC",
    icon: FiCode,
    className: "hb-card-code",
    preview: (
      <div className="hb-card-code-preview">
        <div className="hb-mini-code-line"><i /> const project = await build();</div>
        <div className="hb-mini-code-line indent">return project.success;</div>
        <div className="hb-mini-code-line"><i /> // Ready to launch</div>
      </div>
    ),
  },
  {
    id: "design",
    title: "Creative Design",
    category: "GRAPHIC DESIGN",
    reward: "150 USDC",
    icon: FiPenTool,
    className: "hb-card-design",
    preview: (
      <div className="hb-card-design-preview">
        <div className="hb-design-shape shape-one" />
        <div className="hb-design-shape shape-two" />
        <div className="hb-design-shape shape-three" />
        <div className="hb-design-preview-text">
          <strong>THINK.</strong>
          <strong>CREATE.</strong>
        </div>
      </div>
    ),
  },
  {
    id: "content",
    title: "Social Media Content",
    category: "CONTENT",
    reward: "100 USDC",
    icon: FiMessageCircle,
    className: "hb-card-content",
    preview: (
      <div className="hb-card-content-preview">
        <div className="hb-content-avatar"><FiZap /></div>
        <div className="hb-content-lines">
          <i />
          <i />
          <i />
        </div>
        <div className="hb-content-art">
          <span>CREATE.</span>
          <strong>INSPIRE.</strong>
          <span>EARN.</span>
        </div>
        <div className="hb-content-reactions">
          <span><FiHeart /> 248</span>
          <span><FiMessageCircle /> 36</span>
        </div>
      </div>
    ),
  },
  {
    id: "writing",
    title: "Article Writing",
    category: "WRITING",
    reward: "80 USDC",
    icon: FiFileText,
    className: "hb-card-writing",
    preview: (
      <div className="hb-card-writing-preview">
        <span>FEATURED ARTICLE</span>
        <strong>Ideas can change everything.</strong>
        <i />
        <i />
        <i />
      </div>
    ),
  },
];

function NetworkBadge({ logo, name }) {
  return (
    <div className="hb-network-badge">
      <img src={logo} alt={name} />
      <span>{name}</span>
    </div>
  );
}

function FloatingWorkCard({ card, index }) {
  const Icon = card.icon;

  return (
    <article
      className={`hb-floating-card ${card.className}`}
      style={{ "--card-index": index }}
    >
      <div className="hb-card-top">
        <span className="hb-card-icon">
          <Icon />
        </span>

        <span className="hb-card-category">{card.category}</span>

        <span className="hb-card-live">
          <i />
          LIVE
        </span>
      </div>

      <div className="hb-card-title-row">
        <strong>{card.title}</strong>
        <span className="hb-card-arrow">
          <FiArrowUpRight />
        </span>
      </div>

      <div className="hb-card-preview">{card.preview}</div>

      <div className="hb-card-bottom">
        <span><FiGift /> BOUNTY REWARD</span>
        <strong>{card.reward}</strong>
      </div>
    </article>
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

        {/* RIGHT SIDE - FLOATING CARDS */}

        <div className="hb-visual">
          <div className="hb-visual-glow" />

          <div className="hb-orbit hb-orbit-one" />
          <div className="hb-orbit hb-orbit-two" />

          <div className="hb-floating-label">
            <span className="hb-live-dot" />
            REAL SKILLS. REAL OPPORTUNITIES.
          </div>

          <div className="hb-cards-stage">
            {floatingCards.map((card, index) => (
              <FloatingWorkCard
                key={card.id}
                card={card}
                index={index}
              />
            ))}
          </div>

          {/* NETWORK SYMBOLS */}

          <div className="hb-floating-network hb-floating-arc">
            <img src={ArcLogo} alt="Arc Network" />
          </div>

          <div className="hb-floating-network hb-floating-bot">
            <img src={BotchainLogo} alt="Botchain Network" />
          </div>

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
            <span><FiCheck /></span>
            Approved
          </div>

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
            linear-gradient(${dark ? "rgba(255,255,255,.025)" : "rgba(0,60,40,.035)"} 1px, transparent 1px),
            linear-gradient(90deg, ${dark ? "rgba(255,255,255,.025)" : "rgba(0,60,40,.035)"} 1px, transparent 1px);
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
          from { transform: scale(.5); opacity: .8; }
          to { transform: scale(2); opacity: 0; }
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
          transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
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

        /* RIGHT VISUAL */

        .hb-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          min-height: 480px;
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
          background: rgba(0,214,160,.2);
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
          border: 1px solid rgba(0,214,160,.13);
          border-radius: 50%;
          pointer-events: none;
        }

        .hb-orbit-one {
          width: 92%;
          height: 59%;
          transform: rotate(-24deg);
          animation: hbOrbit 35s linear infinite;
        }

        .hb-orbit-two {
          width: 75%;
          height: 82%;
          transform: rotate(28deg);
          border-color: rgba(0,214,160,.08);
          animation: hbOrbit 45s linear infinite reverse;
        }

        @keyframes hbOrbit {
          to { rotate: 360deg; }
        }

        .hb-floating-label {
          position: absolute;
          top: 1%;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 9px;
          color: ${dark ? "rgba(255,255,255,.55)" : "#718078"};
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .13em;
          white-space: nowrap;
          transform: translateX(-50%);
        }

        /* THE CARD ARRANGEMENT */

        .hb-cards-stage {
          position: relative;
          display: grid;
          width: 100%;
          max-width: 540px;
          min-height: 400px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(2, auto);
          align-items: center;
          justify-items: center;
          column-gap: 30px;
          row-gap: 27px;
          padding: 43px 15px 35px;
        }

        .hb-floating-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 235px;
          min-width: 0;
          padding: 13px;
          overflow: hidden;
          border: 1px solid ${dark ? "rgba(0,214,160,.26)" : "rgba(0,145,99,.22)"};
          border-radius: 5px;
          background: ${dark
            ? "linear-gradient(145deg, rgba(17,35,27,.97), rgba(7,17,13,.98))"
            : "linear-gradient(145deg, #FFFFFF, #EAF8F1)"};
          color: ${dark ? "#F5FFF9" : "#17251D"};
          box-shadow: 0 15px 38px rgba(0,0,0,.14), 0 0 20px rgba(0,214,160,.055);
          transition: border-color .3s ease, box-shadow .3s ease;
          animation: hbCardFloat 6s ease-in-out infinite;
          animation-delay: calc(var(--card-index) * -.9s);
        }

        .hb-floating-card:hover {
          z-index: 5;
          border-color: rgba(0,214,160,.7);
          box-shadow: 0 20px 45px rgba(0,0,0,.22), 0 0 24px rgba(0,214,160,.14);
        }

        @keyframes hbCardFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -9px; }
        }

        /* Each card has its own position and angle.
           The floating animation uses translate, so these rotations remain intact. */

        .hb-card-code {
          transform: rotate(-3deg) translateY(5px);
        }

        .hb-card-design {
          transform: rotate(3deg) translateY(17px);
        }

        .hb-card-content {
          transform: rotate(2deg) translateY(-5px);
        }

        .hb-card-writing {
          transform: rotate(-2deg) translateY(10px);
        }

        .hb-card-top {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          margin-bottom: 10px;
        }

        .hb-card-icon {
          display: grid;
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.25);
          border-radius: 4px;
          background: rgba(0,214,160,.12);
          color: var(--green);
          font-size: 13px;
        }

        .hb-card-category {
          overflow: hidden;
          flex: 1;
          color: var(--green);
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .09em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hb-card-live {
          display: flex;
          align-items: center;
          gap: 4px;
          color: ${dark ? "rgba(255,255,255,.55)" : "#718078"};
          font-size: 6px;
          font-weight: 900;
        }

        .hb-card-live i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 7px var(--green);
        }

        .hb-card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 10px;
        }

        .hb-card-title-row strong {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .hb-card-arrow {
          display: grid;
          width: 21px;
          height: 21px;
          flex: 0 0 21px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.2);
          border-radius: 3px;
          color: var(--green);
          font-size: 11px;
        }

        .hb-card-preview {
          min-height: 80px;
          overflow: hidden;
          border: 1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"};
          border-radius: 3px;
          background: ${dark ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.7)"};
        }

        .hb-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid ${dark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.07)"};
        }

        .hb-card-bottom span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: ${dark ? "rgba(255,255,255,.47)" : "#718078"};
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .05em;
        }

        .hb-card-bottom span svg {
          color: var(--green);
          font-size: 10px;
        }

        .hb-card-bottom strong {
          color: var(--green);
          font-size: 10px;
          font-weight: 950;
        }

        /* CODING PREVIEW */

        .hb-card-code-preview {
          display: flex;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          height: 80px;
          padding: 10px;
          color: ${dark ? "#A7F3D0" : "#087A58"};
          font-family: "Fira Code", Consolas, monospace;
          font-size: 7px;
        }

        .hb-mini-code-line {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hb-mini-code-line i {
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-right: 5px;
          border-radius: 50%;
          background: var(--green);
        }

        .hb-mini-code-line.indent {
          padding-left: 12px;
          opacity: .7;
        }

        /* DESIGN PREVIEW */

        .hb-card-design-preview {
          position: relative;
          display: flex;
          align-items: center;
          height: 80px;
          overflow: hidden;
          padding: 10px;
          background: linear-gradient(120deg, #073D2E, #087B59 65%, #00D6A0);
          color: white;
        }

        .hb-design-preview-text {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          font-size: 18px;
          font-weight: 950;
          line-height: .95;
          letter-spacing: -.07em;
        }

        .hb-design-preview-text strong:last-child {
          color: #A8FFDD;
        }

        .hb-design-shape {
          position: absolute;
          border: 1px solid rgba(255,255,255,.5);
          transform: rotate(35deg);
        }

        .shape-one {
          top: 12px;
          right: 25px;
          width: 39px;
          height: 39px;
          border-radius: 50%;
          background: rgba(255,255,255,.13);
        }

        .shape-two {
          right: 12px;
          bottom: 9px;
          width: 23px;
          height: 23px;
          background: #A8FFDD;
        }

        .shape-three {
          top: 9px;
          right: 10px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: rgba(255,255,255,.5);
        }

        /* CONTENT PREVIEW */

        .hb-card-content-preview {
          position: relative;
          display: grid;
          grid-template-columns: 25px 1fr;
          gap: 7px;
          min-height: 80px;
          padding: 9px;
        }

        .hb-content-avatar {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border-radius: 50%;
          background: rgba(0,214,160,.14);
          color: var(--green);
        }

        .hb-content-lines {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
        }

        .hb-content-lines i {
          width: 90%;
          height: 4px;
          border-radius: 4px;
          background: ${dark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.12)"};
        }

        .hb-content-lines i:nth-child(2) { width: 70%; }
        .hb-content-lines i:nth-child(3) { width: 45%; }

        .hb-content-art {
          display: flex;
          grid-column: 1 / -1;
          justify-content: center;
          flex-direction: column;
          min-height: 38px;
          padding: 5px 9px;
          border-radius: 2px;
          background: linear-gradient(110deg, #073D2E, #00A879);
          color: white;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .hb-content-art strong {
          color: #A8FFDD;
          font-size: 13px;
        }

        .hb-content-reactions {
          display: flex;
          grid-column: 1 / -1;
          gap: 13px;
          color: ${dark ? "rgba(255,255,255,.5)" : "#718078"};
          font-size: 6px;
        }

        .hb-content-reactions span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* WRITING PREVIEW */

        .hb-card-writing-preview {
          display: flex;
          justify-content: center;
          flex-direction: column;
          gap: 7px;
          min-height: 80px;
          padding: 10px;
        }

        .hb-card-writing-preview > span {
          color: var(--green);
          font-size: 6px;
          font-weight: 950;
          letter-spacing: .12em;
        }

        .hb-card-writing-preview strong {
          max-width: 160px;
          color: ${dark ? "#E8FFF3" : "#263C31"};
          font-size: 11px;
          line-height: 1.25;
        }

        .hb-card-writing-preview i {
          width: 95%;
          height: 3px;
          border-radius: 3px;
          background: ${dark ? "rgba(255,255,255,.17)" : "rgba(0,0,0,.1)"};
        }

        .hb-card-writing-preview i:nth-of-type(2) { width: 78%; }
        .hb-card-writing-preview i:nth-of-type(3) { width: 55%; }

        /* FLOATING NETWORK LOGOS */

        .hb-floating-network {
          position: absolute;
          z-index: 5;
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.4);
          border-radius: 50%;
          background: radial-gradient(circle at 35% 25%, ${dark ? "#174E3B" : "#D5F8E9"}, ${dark ? "#071B14" : "#A2EACD"} 75%);
          box-shadow: 0 0 22px rgba(0,214,160,.18);
          animation: hbFloat 6s ease-in-out infinite;
        }

        .hb-floating-network img {
          width: 55%;
          height: 55%;
          object-fit: contain;
        }

        .hb-floating-arc {
          top: 10%;
          left: 2%;
        }

        .hb-floating-bot {
          top: 10%;
          right: 2%;
          animation-delay: -3s;
        }

        @keyframes hbFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -8px; }
        }

        /* REWARD NOTIFICATION */

        .hb-floating-reward {
          position: absolute;
          z-index: 6;
          bottom: 8%;
          left: 1%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 4px;
          background: ${dark ? "rgba(7,22,16,.96)" : "rgba(255,255,255,.97)"};
          box-shadow: 0 12px 30px rgba(0,0,0,.17);
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

        /* APPROVED NOTIFICATION */

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
          border-radius: 4px;
          background: ${dark ? "rgba(7,22,16,.96)" : "rgba(255,255,255,.97)"};
          color: ${dark ? "#E4FFF4" : "#254336"};
          box-shadow: 0 10px 25px rgba(0,0,0,.13);
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

          .hb-cards-stage {
            column-gap: 18px;
            row-gap: 23px;
          }

          .hb-floating-card {
            padding: 11px;
          }

          .hb-card-title-row strong {
            font-size: 9px;
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
            min-height: 465px;
            margin: 0 auto;
          }

          .hb-cards-stage {
            max-width: 520px;
            min-height: 400px;
          }
        }

        /* PHONE */

        @media (max-width: 560px) {
          .hb-hero-container {
            gap: 12px;
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
            min-height: 400px;
            margin-top: 8px;
          }

          .hb-floating-label {
            top: 0;
            font-size: 6px;
          }

          .hb-cards-stage {
            width: 100%;
            min-height: 350px;
            column-gap: 13px;
            row-gap: 21px;
            padding: 35px 2px 40px;
          }

          .hb-floating-card {
            max-width: 220px;
            padding: 9px;
          }

          .hb-card-top {
            gap: 5px;
            margin-bottom: 7px;
          }

          .hb-card-icon {
            width: 22px;
            height: 22px;
            flex-basis: 22px;
          }

          .hb-card-category {
            font-size: 6px;
          }

          .hb-card-title-row {
            margin-bottom: 7px;
          }

          .hb-card-title-row strong {
            font-size: 8px;
          }

          .hb-card-preview {
            min-height: 70px;
          }

          .hb-card-bottom {
            margin-top: 7px;
            padding-top: 6px;
          }

          .hb-card-bottom span {
            font-size: 5px;
          }

          .hb-card-bottom strong {
            font-size: 8px;
          }

          .hb-card-code-preview,
          .hb-card-design-preview {
            height: 70px;
          }

          .hb-card-content-preview,
          .hb-card-writing-preview {
            min-height: 70px;
          }

          .hb-card-writing-preview strong {
            font-size: 9px;
          }

          .hb-card-code-preview {
            font-size: 6px;
          }

          .hb-floating-network {
            width: 31px;
            height: 31px;
          }

          .hb-floating-arc {
            top: 7%;
            left: 0;
          }

          .hb-floating-bot {
            top: 7%;
            right: 0;
          }

          .hb-floating-reward {
            bottom: 2%;
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
            bottom: 2%;
            gap: 5px;
            padding: 6px 8px;
            font-size: 6px;
          }

          .hb-floating-approved > span {
            width: 15px;
            height: 15px;
          }

          .hb-visual-caption {
            bottom: -19px;
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
            min-height: 365px;
          }

          .hb-cards-stage {
            min-height: 325px;
            column-gap: 9px;
            row-gap: 17px;
          }

          .hb-floating-card {
            padding: 7px;
          }

          .hb-card-title-row strong {
            font-size: 7px;
          }

          .hb-card-preview {
            min-height: 64px;
          }

          .hb-card-code-preview,
          .hb-card-design-preview {
            height: 64px;
          }

          .hb-card-content-preview,
          .hb-card-writing-preview {
            min-height: 64px;
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
