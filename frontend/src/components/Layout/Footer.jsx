
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaTelegramPlane,
  FaEnvelope,
} from "react-icons/fa";
import {
  FiArrowUp,
  FiCheck,
  FiDollarSign,
  FiFileText,
  FiHelpCircle,
  FiMessageCircle,
  FiExternalLink,
  FiBookOpen,
} from "react-icons/fi";
import HappyBounty from "../../assets/images/happy-bounty-logo.png";

function Footer() {
  const [dark, setDark] = useState(
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNavigation = () => {
    scrollToTop();
  };

  const headingStyle = `mb-7 text-sm font-bold tracking-tight ${
    dark ? "text-white" : "text-[#111111]"
  }`;

  const mutedText = dark ? "text-white/50" : "text-black/50";

  const linkStyle = `group flex w-fit items-center gap-3 text-sm transition-all duration-300 hover:translate-x-1 hover:text-[#00D6A0] ${
    dark ? "text-white/55" : "text-black/55"
  }`;

  const iconStyle = "h-[17px] w-[17px] shrink-0 text-[#00D6A0]";

  return (
    <footer
      className={`relative mt-16 overflow-hidden border-t transition-colors duration-300 ${
        dark
          ? "border-[#00D6A0]/20 bg-[#050908] text-white"
          : "border-[#00D6A0]/20 bg-white text-[#111111]"
      }`}
    >
      {/* BACKGROUND GLOW */}
      <div
        className={`pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full blur-[140px] ${
          dark ? "bg-[#00D6A0]/10" : "bg-[#00D6A0]/[0.07]"
        }`}
      />

      <div
        className={`pointer-events-none absolute -bottom-48 -right-32 h-[450px] w-[450px] rounded-full blur-[140px] ${
          dark ? "bg-[#00D6A0]/10" : "bg-[#00D6A0]/[0.06]"
        }`}
      />

      {/* GRID BACKGROUND */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          dark ? "opacity-[0.07]" : "opacity-[0.045]"
        }`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,214,160,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,214,160,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "54px 54px",
        }}
      />

      {/* DECORATIVE CORNERS */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-44 w-44 opacity-20 md:block">
        <div className="absolute right-8 top-8 h-24 w-24 border border-[#00D6A0]" />
        <div className="absolute right-0 top-14 h-24 w-24 border border-[#00D6A0]" />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 hidden h-40 w-40 opacity-15 md:block">
        <div className="absolute bottom-8 left-0 h-24 w-24 border border-[#00D6A0]" />
        <div className="absolute bottom-0 left-10 h-24 w-24 border border-[#00D6A0]" />
      </div>

      <div className="relative z-10 mx-auto max-w-screen-2xl px-6 pb-10 pt-16 md:px-10 lg:px-16 lg:pt-20">
        {/* MAIN FOOTER */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.95fr_0.9fr] lg:gap-14">
          {/* BRAND */}
          <div>
            <Link
              to="/"
              onClick={handleNavigation}
              className="group mb-7 flex w-fit items-center gap-4"
            >
              <div
                className={`relative flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#00D6A0]/60 ${
                  dark
                    ? "border-[#00D6A0]/30 bg-[#0B1410]"
                    : "border-[#00D6A0]/30 bg-white"
                }`}
              >
                <div className="absolute inset-0 bg-[#00D6A0]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <img
                  src={HappyBounty}
                  alt="Happy Bounty logo"
                  className="relative z-10 h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div>
                <h3
                  className={`text-2xl font-black leading-tight tracking-tight ${
                    dark ? "text-white" : "text-[#111111]"
                  }`}
                >
                  Happy
                  <span className="block text-[#00D6A0]">
                    Bounty
                  </span>
                </h3>

                <p
                  className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${mutedText}`}
                >
                  Web3 Bounty Platform
                </p>
              </div>
            </Link>

            <p className={`max-w-sm text-sm leading-7 ${mutedText}`}>
              A Web3 bounty platform connecting creators and
              contributors through on-chain opportunities and
              network-native rewards.
            </p>

            {/* PLATFORM BADGE */}
            <div
              className={`mt-7 inline-flex flex-wrap items-center gap-3 rounded-full border px-4 py-3 ${
                dark
                  ? "border-[#00D6A0]/30 bg-[#00D6A0]/[0.04]"
                  : "border-[#00D6A0]/30 bg-[#00D6A0]/[0.04]"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D6A0] opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-[#00D6A0]" />
              </span>

              <span className="text-[11px] font-semibold text-[#00D6A0]">
                Multi-network support
              </span>

              <span
                className={`h-4 w-px ${
                  dark ? "bg-white/20" : "bg-black/15"
                }`}
              />

              <FiDollarSign className="h-4 w-4 text-[#00D6A0]" />

              <span className={`text-[11px] font-semibold ${mutedText}`}>
                Native-token rewards
              </span>
            </div>
          </div>

          {/* RESOURCES */}
          <div>
            <h4 className={headingStyle}>Resources</h4>

            <ul className="space-y-6">
              <li>
                <Link
                  to="/docs"
                  onClick={handleNavigation}
                  className={linkStyle}
                >
                  <FiBookOpen className={iconStyle} />
                  Documentation
                </Link>
              </li>

              <li>
                <Link
                  to="/whitepaper"
                  onClick={handleNavigation}
                  className={linkStyle}
                >
                  <FiFileText className={iconStyle} />
                  White Paper
                </Link>
              </li>

              <li>
                <Link
                  to="/faqs"
                  onClick={handleNavigation}
                  className={linkStyle}
                >
                  <FiHelpCircle className={iconStyle} />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h4 className={headingStyle}>Connect</h4>

            <p className={`mb-7 max-w-xs text-sm leading-6 ${mutedText}`}>
              Join our community and stay connected with the
              latest opportunities and platform updates.
            </p>

            <ul className="space-y-6">
              <li>
                <a
                  href="https://x.com/Happy_bounty"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Happy Bounty on X"
                  className={linkStyle}
                >
                  <FaTwitter className={iconStyle} />
                  X (Twitter)
                  <FiExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </li>

              <li>
                <a
                  href="https://t.me/+a9DgNzdYxuJhNjJk"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Happy Bounty Telegram"
                  className={linkStyle}
                >
                  <FaTelegramPlane className={iconStyle} />
                  Telegram Community
                  <FiExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className={headingStyle}>Contact</h4>

            <p className={`mb-7 max-w-xs text-sm leading-6 ${mutedText}`}>
              Have a question, partnership idea, or need
              assistance? We'd love to hear from you.
            </p>

            <ul className="space-y-6">
              <li>
                <a
                  href="https://t.me/+a9DgNzdYxuJhNjJk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkStyle}
                >
                  <FaTelegramPlane className={iconStyle} />
                  Chat on Telegram
                  <FiExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </li>

              <li>
                <a
                  href="mailto:YOUR_EMAIL_ADDRESS"
                  className={linkStyle}
                >
                  <FaEnvelope className={iconStyle} />
                  Send an Email
                </a>
              </li>

              <li>
                <Link
                  to="/contact"
                  onClick={handleNavigation}
                  className={linkStyle}
                >
                  <FiMessageCircle className={iconStyle} />
                  Message Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-[#00D6A0]/50 to-transparent" />

        {/* BOTTOM FOOTER */}
        <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <p className={`text-xs ${mutedText}`}>
            © {new Date().getFullYear()} Happy Bounty. All rights reserved.
          </p>

          {/* LEGAL LINKS */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4 text-xs ${
              dark ? "text-white/45" : "text-black/45"
            }`}
          >
            <Link
              to="/privacy"
              onClick={handleNavigation}
              className="transition-colors hover:text-[#00D6A0]"
            >
              Privacy Policy
            </Link>

            <span className="opacity-30">|</span>

            <Link
              to="/terms"
              onClick={handleNavigation}
              className="transition-colors hover:text-[#00D6A0]"
            >
              Terms of Service
            </Link>

            <span className="opacity-30">|</span>

            <Link
              to="/security"
              onClick={handleNavigation}
              className="transition-colors hover:text-[#00D6A0]"
            >
              Security
            </Link>
          </div>

          {/* PLATFORM MESSAGE */}
          <div
            className={`flex flex-wrap items-center justify-center gap-2 text-xs ${mutedText}`}
          >
            <span>Built for</span>
            <span className="font-bold text-[#00D6A0]">
              multiple networks
            </span>
            <span className="text-[#00D6A0]">•</span>
            <span className="font-bold text-[#00D6A0]">
              native tokens
            </span>
            <FiCheck className="h-4 w-4 text-[#00D6A0]" />
          </div>
        </div>

        {/* BACK TO TOP */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className={`group inline-flex items-center gap-4 rounded-full border border-[#00D6A0]/40 px-6 py-3 text-xs font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-[#00D6A0] hover:text-[#04110C] ${
              dark
                ? "bg-[#07100C]/80 text-white/75"
                : "bg-white/80 text-black/65"
            }`}
          >
            Back to top

            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00D6A0]/10 text-[#00D6A0] transition-all duration-300 group-hover:bg-black/10 group-hover:text-[#04110C]">
              <FiArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>

        {/* BOTTOM SYSTEM LABEL */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.24em] ${
            dark ? "text-white/25" : "text-black/25"
          }`}
        >
          <span>Multi-chain</span>
          <span className="text-[#00D6A0]">•</span>
          <span>Native tokens</span>
          <span className="text-[#00D6A0]">•</span>
          <span>Web3 work</span>
          <span className="text-[#00D6A0]">•</span>
          <span>On-chain</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
