
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";

import {
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiGift,
  FiLayers,
  FiShield,
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

function NetworkBadge({ logo, name }) {
  return (
    <div className="hb-network-badge">
      <img src={logo} alt={name} />
      <span>{name}</span>
    </div>
  );
}

export default function Hero({ dark }) {
  const [heroText, setHeroText] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const visualRef = useRef(null);
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

  const handleVisualMove = (event) => {
    if (!visualRef.current || window.innerWidth < 1024) return;

    const rect = visualRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    visualRef.current.style.setProperty(
      "--rotate-x",
      `${(0.5 - y) * 2.5}deg`
    );

    visualRef.current.style.setProperty(
      "--rotate-y",
      `${(x - 0.5) * 4}deg`
    );
  };

  const resetVisualMove = () => {
    if (!visualRef.current) return;

    visualRef.current.style.setProperty("--rotate-x", "0deg");
    visualRef.current.style.setProperty("--rotate-y", "0deg");
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

        {/* RIGHT VISUAL */}
        <div
          className="hb-visual"
          onMouseMove={handleVisualMove}
          onMouseLeave={resetVisualMove}
        >
          <div className="hb-visual-glow" />

          {/* Background light trails */}
          <div className="hb-light-trails">
            <span />
            <span />
            <span />
            <span />
          </div>

          {/* Orbital rings */}
          <div className="hb-orbit hb-orbit-one" />
          <div className="hb-orbit hb-orbit-two" />
          <div className="hb-orbit hb-orbit-three" />

          {/* Central interface */}
          <div ref={visualRef} className="hb-interface">
            <div className="hb-interface-top">
              <div className="hb-interface-brand">
                <span className="hb-interface-mark">
                  <FiZap />
                </span>
                <strong>HAPPY BOUNTY</strong>
              </div>

              <div className="hb-interface-status">
                <span className="hb-live-dot" />
                LIVE
              </div>
            </div>

            <div className="hb-interface-content">
              <div className="hb-interface-heading">
                <div>
                  <span className="hb-interface-overline">
                    THE BOUNTY NETWORK
                  </span>
                  <h2>Make it happen.</h2>
                </div>

                <div className="hb-interface-heading-icon">
                  <FiLayers />
                </div>
              </div>

              <div className="hb-featured-bounty">
                <div className="hb-featured-top">
                  <span>FEATURED BOUNTY</span>
                  <span className="hb-active-tag">
                    <i />
                    OPEN
                  </span>
                </div>

                <div className="hb-featured-main">
                  <div className="hb-featured-icon">
                    <FiCode />
                  </div>

                  <div className="hb-featured-info">
                    <strong>Build. Create. Earn.</strong>
                    <span>Complete a challenge</span>
                  </div>

                  <FiArrowUpRight className="hb-featured-arrow" />
                </div>

                <div className="hb-interface-divider" />

                <div className="hb-featured-bottom">
                  <div>
                    <span>AVAILABLE REWARD</span>
                    <strong>250 <small>USDC</small></strong>
                  </div>

                  <div className="hb-reward-symbol">
                    <FiGift />
                  </div>
                </div>
              </div>

              <div className="hb-interface-progress">
                <div className="hb-progress-heading">
                  <span>OPPORTUNITY STATUS</span>
                  <strong>ACTIVE</strong>
                </div>
                <div className="hb-progress-track">
                  <span />
                </div>
              </div>
            </div>

            <div className="hb-interface-footer">
              <span><FiShield /> Secure rewards</span>
              <span>Explore opportunities <FiArrowUpRight /></span>
            </div>
          </div>

          {/* Large floating network coins */}
          <div className="hb-coin-platform hb-platform-left">
            <div className="hb-platform-ring" />
            <div className="hb-platform-base" />
            <div className="hb-coin hb-coin-happy">
              <div className="hb-coin-inner">
                <FiZap />
              </div>
            </div>
            <div className="hb-platform-light" />
          </div>

          <div className="hb-coin-platform hb-platform-right">
            <div className="hb-platform-ring" />
            <div className="hb-platform-base" />
            <div className="hb-coin hb-coin-bot">
              <div className="hb-coin-inner">
                <img src={BotchainLogo} alt="Botchain" />
              </div>
            </div>
            <div className="hb-platform-light" />
          </div>

          {/* Floating network symbols */}
          <div className="hb-floating-network hb-floating-arc">
            <img src={ArcLogo} alt="Arc Network" />
          </div>

          <div className="hb-floating-network hb-floating-bot">
            <img src={BotchainLogo} alt="Botchain Network" />
          </div>

          {/* Compact reward notification */}
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

          <div className="hb-floating-approved">
            <span><FiCheck /></span>
            Approved
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
          min-height: 550px;
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
          grid-template-columns: .9fr 1.1fr;
          align-items: center;
          gap: 25px;
          width: 100%;
          max-width: 1250px;
          min-height: 550px;
          margin: 0 auto;
          padding: 75px 48px 48px;
        }

        /* LEFT CONTENT */

        .hb-copy {
          position: relative;
          z-index: 3;
          max-width: 480px;
          animation: hbFadeUp .8s ease both;
        }

        .hb-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 29px;
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
          border-radius: 9px;
          background: rgba(0,214,160,.11);
          color: var(--green);
          font-size: 17px;
          box-shadow: 0 0 22px rgba(0,214,160,.12);
        }

        .hb-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 8px 11px;
          border: 1px solid rgba(0,214,160,.25);
          border-radius: 100px;
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
          font-size: clamp(39px, 4.4vw, 63px);
          font-weight: 950;
          line-height: 1;
          letter-spacing: -.07em;
        }

        .hb-heading span {
          color: var(--green);
          text-shadow: ${dark ? "0 0 30px rgba(0,214,160,.15)" : "none"};
        }

        .hb-description {
          max-width: 400px;
          margin-top: 19px;
          color: ${dark ? "rgba(255,255,255,.58)" : "#59665F"};
          font-size: 12px;
          line-height: 1.85;
        }

        .hb-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 25px;
          margin-top: 11px;
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
          gap: 10px;
          margin-top: 23px;
        }

        .hb-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 43px;
          padding: 0 18px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
          transition: transform .25s ease, box-shadow .25s ease,
            background .25s ease, border-color .25s ease;
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
          gap: 9px;
          margin-top: 27px;
        }

        .hb-powered-label {
          margin-right: 2px;
          color: ${dark ? "rgba(255,255,255,.36)" : "#849188"};
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .11em;
        }

        .hb-network-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border: 1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)"};
          border-radius: 30px;
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
          min-height: 470px;
          perspective: 1400px;
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
          width: 75%;
          height: 75%;
          border-radius: 50%;
          background: rgba(0,214,160,.2);
          filter: blur(85px);
          animation: hbGlowPulse 6s ease-in-out infinite;
        }

        @keyframes hbGlowPulse {
          0%, 100% { transform: scale(.85); opacity: .55; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        /* LIGHT TRAILS */

        .hb-light-trails {
          position: absolute;
          z-index: -1;
          inset: 10% -5% 5%;
          overflow: hidden;
          pointer-events: none;
          transform: rotate(-8deg);
        }

        .hb-light-trails span {
          position: absolute;
          left: -15%;
          width: 135%;
          height: 95px;
          border-top: 1px solid rgba(0,214,160,.55);
          border-radius: 50%;
          filter: drop-shadow(0 0 5px rgba(0,214,160,.75));
          transform: rotate(-8deg);
        }

        .hb-light-trails span:nth-child(1) {
          top: 39%;
        }

        .hb-light-trails span:nth-child(2) {
          top: 44%;
          height: 120px;
          border-color: rgba(0,214,160,.25);
          transform: rotate(-13deg);
        }

        .hb-light-trails span:nth-child(3) {
          top: 50%;
          height: 145px;
          border-color: rgba(0,214,160,.2);
          transform: rotate(-4deg);
        }

        .hb-light-trails span:nth-child(4) {
          top: 57%;
          height: 160px;
          border-color: rgba(0,214,160,.12);
          transform: rotate(-11deg);
        }

        /* ORBIT RINGS */

        .hb-orbit {
          position: absolute;
          z-index: -2;
          border: 1px solid rgba(0,214,160,.16);
          border-radius: 50%;
          pointer-events: none;
        }

        .hb-orbit-one {
          width: 105%;
          height: 44%;
          transform: rotate(-22deg);
          animation: hbOrbit 35s linear infinite;
        }

        .hb-orbit-two {
          width: 90%;
          height: 80%;
          transform: rotate(28deg);
          border-color: rgba(0,214,160,.1);
          animation: hbOrbit 45s linear infinite reverse;
        }

        .hb-orbit-three {
          width: 75%;
          height: 65%;
          border-color: rgba(0,214,160,.08);
          transform: rotate(-40deg);
        }

        @keyframes hbOrbit {
          to { rotate: 360deg; }
        }

        /* MAIN INTERFACE */

        .hb-interface {
          position: relative;
          z-index: 3;
          width: 77%;
          max-width: 430px;
          min-width: 300px;
          overflow: hidden;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 17px;
          background: ${dark
            ? "linear-gradient(145deg, rgba(13,29,23,.98), rgba(5,12,10,.99))"
            : "linear-gradient(145deg, #FFFFFF, #EAF8F1)"};
          color: ${dark ? "#F5FFF9" : "#17251D"};
          box-shadow:
            0 35px 85px rgba(0,0,0,.35),
            0 0 0 1px rgba(0,214,160,.07),
            0 0 45px rgba(0,214,160,.12),
            inset 0 1px 0 rgba(255,255,255,.1);
          backdrop-filter: blur(25px);
          transform:
            rotateY(calc(-8deg + var(--rotate-y, 0deg)))
            rotateX(calc(3deg + var(--rotate-x, 0deg)));
          transform-style: preserve-3d;
          transition: transform .2s ease;
          animation: hbInterfaceFloat 7s ease-in-out infinite;
        }

        @keyframes hbInterfaceFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -7px; }
        }

        .hb-interface::before {
          position: absolute;
          top: 0;
          left: 15%;
          width: 70%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0,214,160,.8),
            transparent
          );
          content: "";
        }

        .hb-interface-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 55px;
          padding: 12px 16px;
          border-bottom: 1px solid ${dark
            ? "rgba(255,255,255,.08)"
            : "rgba(0,0,0,.07)"};
          background: ${dark ? "rgba(255,255,255,.025)" : "rgba(0,100,65,.025)"};
        }

        .hb-interface-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 9px;
          letter-spacing: .12em;
        }

        .hb-interface-mark {
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.4);
          border-radius: 8px;
          background: rgba(0,214,160,.13);
          color: var(--green);
          font-size: 15px;
          box-shadow: 0 0 15px rgba(0,214,160,.12);
        }

        .hb-interface-status {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid rgba(0,214,160,.25);
          border-radius: 6px;
          color: var(--green);
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .1em;
        }

        .hb-interface-status .hb-live-dot {
          width: 5px;
          height: 5px;
          flex-basis: 5px;
        }

        .hb-interface-content {
          padding: 22px 20px 19px;
        }

        .hb-interface-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .hb-interface-overline {
          color: var(--green);
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .17em;
        }

        .hb-interface-heading h2 {
          margin-top: 7px;
          font-size: clamp(21px, 2.2vw, 28px);
          font-weight: 950;
          letter-spacing: -.06em;
        }

        .hb-interface-heading-icon {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.24);
          border-radius: 11px;
          background: rgba(0,214,160,.09);
          color: var(--green);
          font-size: 20px;
        }

        .hb-featured-bounty {
          position: relative;
          padding: 16px;
          border: 1px solid ${dark
            ? "rgba(255,255,255,.12)"
            : "rgba(0,90,60,.12)"};
          border-radius: 12px;
          background: ${dark
            ? "linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.018))"
            : "linear-gradient(135deg, #F8FFFB, #EAF8F1)"};
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
        }

        .hb-featured-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
          color: ${dark ? "rgba(255,255,255,.45)" : "#7A8980"};
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .12em;
        }

        .hb-active-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 5px;
          background: rgba(0,214,160,.11);
          color: var(--green);
          font-size: 7px;
        }

        .hb-active-tag i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 7px var(--green);
        }

        .hb-featured-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hb-featured-icon {
          display: grid;
          width: 47px;
          height: 47px;
          flex: 0 0 47px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 12px;
          background: linear-gradient(
            145deg,
            rgba(0,214,160,.2),
            rgba(0,214,160,.055)
          );
          color: var(--green);
          font-size: 22px;
          box-shadow: 0 0 22px rgba(0,214,160,.1);
        }

        .hb-featured-info {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          gap: 5px;
        }

        .hb-featured-info strong {
          font-size: 12px;
          font-weight: 950;
          letter-spacing: -.02em;
        }

        .hb-featured-info span {
          color: ${dark ? "rgba(255,255,255,.45)" : "#77877D"};
          font-size: 8px;
        }

        .hb-featured-arrow {
          color: var(--green);
          font-size: 17px;
        }

        .hb-interface-divider {
          height: 1px;
          margin: 17px 0;
          background: ${dark
            ? "rgba(255,255,255,.09)"
            : "rgba(0,0,0,.08)"};
        }

        .hb-featured-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hb-featured-bottom > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hb-featured-bottom > div:first-child > span {
          color: ${dark ? "rgba(255,255,255,.42)" : "#829087"};
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .hb-featured-bottom strong {
          color: var(--green);
          font-size: 27px;
          font-weight: 950;
          letter-spacing: -.06em;
        }

        .hb-featured-bottom strong small {
          font-size: 11px;
          letter-spacing: 0;
        }

        .hb-reward-symbol {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.25);
          border-radius: 50%;
          background: rgba(0,214,160,.1);
          color: var(--green);
          font-size: 19px;
        }

        .hb-interface-progress {
          margin-top: 18px;
        }

        .hb-progress-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .hb-progress-heading span {
          color: ${dark ? "rgba(255,255,255,.4)" : "#849188"};
        }

        .hb-progress-heading strong {
          color: var(--green);
        }

        .hb-progress-track {
          height: 4px;
          overflow: hidden;
          border-radius: 20px;
          background: ${dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"};
        }

        .hb-progress-track span {
          display: block;
          width: 72%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #008F69, #00E7AD);
          box-shadow: 0 0 12px rgba(0,214,160,.55);
          animation: hbProgress 2s ease both;
        }

        @keyframes hbProgress {
          from { width: 0; }
          to { width: 72%; }
        }

        .hb-interface-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid ${dark
            ? "rgba(255,255,255,.08)"
            : "rgba(0,0,0,.07)"};
          background: ${dark ? "rgba(255,255,255,.02)" : "rgba(0,100,65,.025)"};
          color: ${dark ? "rgba(255,255,255,.46)" : "#718078"};
          font-size: 7px;
          font-weight: 800;
        }

        .hb-interface-footer span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hb-interface-footer svg {
          color: var(--green);
          font-size: 11px;
        }

        .hb-interface-footer span:last-child {
          color: var(--green);
        }

        /* 3D NETWORK COINS */

        .hb-coin-platform {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 145px;
          height: 155px;
          pointer-events: none;
        }

        .hb-platform-left {
          bottom: 0;
          left: -1%;
          animation: hbCoinFloat 6s ease-in-out infinite;
        }

        .hb-platform-right {
          right: -1%;
          bottom: 1%;
          animation: hbCoinFloat 6s -3s ease-in-out infinite;
        }

        @keyframes hbCoinFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -9px; }
        }

        .hb-coin {
          position: absolute;
          z-index: 2;
          top: 4px;
          display: grid;
          width: 91px;
          height: 91px;
          place-items: center;
          border: 2px solid rgba(0,214,160,.85);
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 25%,
            #B5FFE5 0%,
            #19C994 24%,
            #007E5D 68%,
            #042B20 100%
          );
          box-shadow:
            0 0 15px rgba(0,214,160,.55),
            0 0 35px rgba(0,214,160,.35),
            inset 0 0 15px rgba(255,255,255,.25),
            inset -8px -10px 20px rgba(0,0,0,.4);
          transform: rotate(-12deg);
        }

        .hb-coin::before {
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(255,255,255,.24);
          border-radius: 50%;
          content: "";
        }

        .hb-coin-inner {
          display: grid;
          width: 55px;
          height: 55px;
          place-items: center;
          color: #E4FFF5;
          font-size: 36px;
          filter: drop-shadow(0 3px 5px rgba(0,0,0,.35));
        }

        .hb-coin-inner img {
          width: 43px;
          height: 43px;
          object-fit: contain;
          filter: brightness(0) invert(1) drop-shadow(0 3px 5px rgba(0,0,0,.3));
        }

        .hb-coin-bot {
          width: 98px;
          height: 98px;
          background: radial-gradient(
            circle at 30% 25%,
            #D5FFED 0%,
            #00B981 25%,
            #006E50 70%,
            #04251B 100%
          );
          box-shadow:
            0 0 18px rgba(0,214,160,.65),
            0 0 40px rgba(0,214,160,.4),
            inset 0 0 17px rgba(255,255,255,.2),
            inset -8px -10px 20px rgba(0,0,0,.45);
        }

        .hb-platform-ring {
          position: absolute;
          bottom: 20px;
          width: 140px;
          height: 35px;
          border: 1px solid rgba(0,214,160,.8);
          border-radius: 50%;
          box-shadow:
            0 0 12px rgba(0,214,160,.45),
            inset 0 0 10px rgba(0,214,160,.2);
          transform: rotateX(65deg);
        }

        .hb-platform-ring::after {
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 50%;
          content: "";
        }

        .hb-platform-base {
          position: absolute;
          bottom: 17px;
          width: 105px;
          height: 15px;
          border: 1px solid rgba(0,214,160,.55);
          border-radius: 50%;
          background: linear-gradient(
            180deg,
            rgba(0,214,160,.25),
            rgba(0,45,32,.9)
          );
          box-shadow: 0 8px 20px rgba(0,214,160,.2);
        }

        .hb-platform-light {
          position: absolute;
          bottom: 0;
          width: 100px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0,214,160,.3);
          filter: blur(18px);
        }

        /* SMALL FLOATING NETWORK LOGOS */

        .hb-floating-network {
          position: absolute;
          z-index: 5;
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          border: 1px solid rgba(0,214,160,.5);
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 25%,
            ${dark ? "#174E3B" : "#D5F8E9"},
            ${dark ? "#071B14" : "#A2EACD"} 75%
          );
          box-shadow:
            0 0 22px rgba(0,214,160,.22),
            0 0 45px rgba(0,214,160,.1);
          animation: hbFloat 6s ease-in-out infinite;
        }

        .hb-floating-network img {
          width: 55%;
          height: 55%;
          object-fit: contain;
        }

        .hb-floating-arc {
          top: 8%;
          left: 2%;
        }

        .hb-floating-bot {
          top: 7%;
          right: 1%;
          animation-delay: -3s;
        }

        @keyframes hbFloat {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -8px; }
        }

        /* FLOATING NOTIFICATIONS */

        .hb-floating-reward {
          position: absolute;
          z-index: 6;
          top: 0;
          left: 12%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          border: 1px solid rgba(0,214,160,.3);
          border-radius: 10px;
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
          border-radius: 8px;
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

        .hb-floating-approved {
          position: absolute;
          z-index: 6;
          right: 5%;
          bottom: 6%;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 1px solid rgba(0,214,160,.28);
          border-radius: 8px;
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
            grid-template-columns: .9fr 1.1fr;
            gap: 17px;
            padding-right: 30px;
            padding-left: 30px;
          }

          .hb-heading {
            font-size: clamp(38px, 5vw, 55px);
          }

          .hb-interface {
            width: 83%;
          }

          .hb-coin-platform {
            transform: scale(.83);
          }

          .hb-floating-network {
            width: 41px;
            height: 41px;
          }
        }

        /* MOBILE AND SMALL TABLET */

        @media (max-width: 850px) {
          .hb-hero {
            min-height: auto;
          }

          .hb-hero-container {
            grid-template-columns: 1fr;
            gap: 10px;
            min-height: auto;
            padding: 85px 23px 35px;
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
            min-height: 450px;
            margin: 0 auto;
          }

          .hb-interface {
            width: 76%;
            transform: none;
          }

          .hb-coin-platform {
            transform: scale(.9);
          }

          .hb-platform-left {
            left: -1%;
          }

          .hb-platform-right {
            right: -1%;
          }

          .hb-floating-reward {
            left: 7%;
          }
        }

        /* PHONE */

        @media (max-width: 560px) {
          .hb-hero-container {
            gap: 4px;
            padding: 80px 16px 28px;
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
            min-height: 370px;
            margin-top: 8px;
          }

          .hb-interface {
            width: 78%;
            min-width: 0;
            border-radius: 13px;
          }

          .hb-interface-top {
            min-height: 43px;
            padding: 8px 10px;
          }

          .hb-interface-brand {
            gap: 6px;
            font-size: 7px;
          }

          .hb-interface-mark {
            width: 23px;
            height: 23px;
            font-size: 12px;
          }

          .hb-interface-status {
            padding: 5px 7px;
            font-size: 6px;
          }

          .hb-interface-content {
            padding: 14px 12px 13px;
          }

          .hb-interface-heading {
            margin-bottom: 13px;
          }

          .hb-interface-overline {
            font-size: 6px;
          }

          .hb-interface-heading h2 {
            margin-top: 5px;
            font-size: 19px;
          }

          .hb-interface-heading-icon {
            width: 34px;
            height: 34px;
            font-size: 16px;
          }

          .hb-featured-bounty {
            padding: 11px;
          }

          .hb-featured-top {
            margin-bottom: 12px;
            font-size: 6px;
          }

          .hb-featured-main {
            gap: 8px;
          }

          .hb-featured-icon {
            width: 37px;
            height: 37px;
            flex-basis: 37px;
            font-size: 17px;
          }

          .hb-featured-info strong {
            font-size: 9px;
          }

          .hb-featured-info span {
            font-size: 7px;
          }

          .hb-featured-bottom strong {
            font-size: 23px;
          }

          .hb-featured-bottom strong small {
            font-size: 9px;
          }

          .hb-reward-symbol {
            width: 34px;
            height: 34px;
            font-size: 15px;
          }

          .hb-interface-progress {
            margin-top: 13px;
          }

          .hb-interface-footer {
            padding: 9px 10px;
            font-size: 6px;
          }

          .hb-coin-platform {
            transform: scale(.67);
          }

          .hb-platform-left {
            left: -9%;
            bottom: -1%;
          }

          .hb-platform-right {
            right: -9%;
            bottom: 0;
          }

          .hb-coin {
            width: 80px;
            height: 80px;
          }

          .hb-coin-bot {
            width: 86px;
            height: 86px;
          }

          .hb-coin-inner {
            font-size: 30px;
          }

          .hb-coin-inner img {
            width: 37px;
            height: 37px;
          }

          .hb-floating-network {
            width: 34px;
            height: 34px;
          }

          .hb-floating-arc {
            top: 3%;
            left: 0;
          }

          .hb-floating-bot {
            top: 3%;
            right: 0;
          }

          .hb-floating-reward {
            top: 0;
            left: 12%;
            gap: 6px;
            padding: 6px 8px;
          }

          .hb-floating-reward-icon {
            width: 23px;
            height: 23px;
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
            right: 5%;
            bottom: 2%;
            gap: 5px;
            padding: 6px 8px;
            font-size: 6px;
          }

          .hb-floating-approved > span {
            width: 15px;
            height: 15px;
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
            min-height: 335px;
          }

          .hb-interface {
            width: 80%;
          }

          .hb-coin-platform {
            transform: scale(.56);
          }

          .hb-platform-left {
            left: -12%;
          }

          .hb-platform-right {
            right: -12%;
          }

          .hb-floating-reward {
            left: 9%;
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
