import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "../hooks/useNav";
import axios from "axios";
import {
  FiZap,
  FiShield,
  FiArrowRight,
  FiGlobe,
  FiBriefcase,
  FiArrowUp,
  FiMessageCircle,
  FiX,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";

import NavBar from "../components/Layout/NavBar";
import LiveTricker from "../components/Layout/LiveTricker";
import BountyCard from "../components/Bounty/BountyCard";
import Hero from "./Hero";
import HowItWorks from "./Howitwork";
import PlatformStats from "./PlatformStats";
import Features from "./Features";
import ImpactStats from "./ImpactStats";
import Testimonials from "./Testimonials";
import CallToAction from "./CallToAction";
import SupportedNetworks from "./SupportedNetworks";
import BuiltForWeb3 from "./BuiltForWeb3";
import Footer from "../components/Layout/Footer";

function LandingPage({ dark, setDark }) {
  const [featuredBounties, setFeaturedBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBounties: 0,
    totalRewards: 0,
    totalUsers: 0,
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { handleNavigate } = useNav();

  const API_URL = import.meta.env.VITE_API_URL;

  // Keep the existing scroll-to-top behavior.
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 420);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reveal sections smoothly as they enter the viewport.
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach((element) => {
        element.classList.add("reveal-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [loading, featuredBounties.length]);

  // FETCH FEATURED BOUNTIES AND STATS
  // Existing API endpoints, parameters, and response fields are preserved.
  useEffect(() => {
    const fetchFeaturedBounties = async () => {
      try {
        const response = await axios.get(`${API_URL}/bounty/bounties`, {
          params: {
            status: "active",
            limit: 3,
            page: 1,
          },
        });

        let bounties = response.data.bounties || [];

        // Fall back to recent bounties when no active ones are returned.
        if (bounties.length === 0) {
          const recentRes = await axios.get(`${API_URL}/bounty/bounties`, {
            params: {
              limit: 3,
              page: 1,
            },
          });

          bounties = recentRes.data.bounties || [];
        }

        setFeaturedBounties(bounties);
      } catch (err) {
        console.error("Error fetching featured bounties:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const allBounties = await axios.get(`${API_URL}/bounty/bounties`, {
          params: {
            limit: 1,
          },
        });

        const totalBounties = allBounties.data.pagination?.total || 0;

        setStats({
          totalBounties,
          totalRewards: 124500,
          totalUsers: 845,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchFeaturedBounties();
    fetchStats();
  }, []);

  const navigateTo = (path) => (event) => {
    event.preventDefault();
    handleNavigate(path);
  };

  const surfaceClass = dark
    ? "border-white/[0.08] bg-[#111311]/90"
    : "border-black/[0.07] bg-white/80";

  const mutedText = dark ? "text-white/50" : "text-[#77736b]";

  return (
    <div
      className={`
        landing-page relative z-10 flex min-h-screen flex-col
        overflow-x-clip transition-colors duration-500
        ${dark ? "bg-[#080908] text-white" : "bg-[#f6f5ef] text-[#111111]"}
      `}
    >
      {/* NAVIGATION */}
      <header className="relative z-50 mt-5 w-full py-4 sm:py-6">
        <NavBar dark={dark} setDark={setDark} />
      </header>

      {/* LIVE TICKER */}
      <div data-reveal>
        <LiveTricker />
      </div>

      {/* HERO */}
      <section
        className={`
          hero-shell relative z-10 mx-3 mt-5 overflow-hidden rounded-2xl
          transition-colors duration-500 sm:mx-6 lg:mx-12
          ${dark ? "bg-[#080908]" : "bg-[#f6f5ef]"}
        `}
      >
        <div className="hero-grid pointer-events-none absolute inset-0" />

        <div className="hero-glow hero-glow-one pointer-events-none absolute" />
        <div className="hero-glow hero-glow-two pointer-events-none absolute" />

        <div className="relative z-10">
          <Hero dark={dark} setDark={setDark} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section data-reveal className="relative">
        <HowItWorks />
      </section>

      {/* PLATFORM STATS */}
      <section data-reveal className="relative">
        <PlatformStats />
      </section>

      {/* FEATURED BOUNTIES */}
      <section className="featured-section relative z-10 my-14 px-4 py-8 sm:my-20 sm:px-8 lg:px-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="section-glow absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full" />
        </div>

        <div
          data-reveal
          className="relative z-10 mx-auto mb-9 flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <div
                className={`
                  flex h-9 w-9 items-center justify-center rounded-xl border
                  ${
                    dark
                      ? "border-[#00D6A0]/25 bg-[#101512] text-[#00D6A0]"
                      : "border-[#00D6A0]/25 bg-white text-[#008A66]"
                  }
                `}
              >
                <FiLayers className="h-4 w-4" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#008A66]">
                Explore opportunities
              </span>

              <span
                className={`h-1 w-1 rounded-full ${
                  dark ? "bg-white/25" : "bg-black/20"
                }`}
              />

              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${mutedText}`}
              >
                Across supported networks
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2
                className={`
                  text-[39px] font-black leading-[1.02] tracking-[-0.055em]
                  sm:text-[52px] md:text-[60px] lg:text-[66px]
                  ${dark ? "text-white" : "text-[#111111]"}
                `}
              >
                Featured
              </h2>

              <span className="text-[39px] font-black leading-[1.02] tracking-[-0.055em] text-[#008A66] sm:text-[52px] md:text-[60px] lg:text-[66px]">
                Bounties
              </span>
            </div>

            <p
              className={`mt-5 max-w-xl text-sm leading-7 sm:text-base ${mutedText}`}
            >
              Discover tasks, share your skills, and find rewarding
              opportunities. Whether you want to complete work or post a bounty,
              there is room to contribute.
            </p>
          </div>

          <Link
            to="/dashboard"
            onClick={navigateTo("/dashboard")}
            className={`
              group inline-flex w-fit items-center gap-3 rounded-xl border
              px-5 py-3 text-sm font-semibold backdrop-blur-xl
              transition-all duration-300 hover:-translate-y-1
              ${
                dark
                  ? "border-white/10 bg-white/[0.035] text-white/85 hover:border-[#00D6A0]/40 hover:text-[#00D6A0]"
                  : "border-black/[0.08] bg-white/80 text-[#383631] hover:border-[#00D6A0]/40 hover:text-[#008A66]"
              }
            `}
          >
            View all bounties
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`skeleton-card relative h-[280px] overflow-hidden rounded-[24px] border p-5 ${surfaceClass}`}
              >
                <div className="skeleton-shimmer absolute inset-0" />

                <div className="relative">
                  <div className="mb-6 flex justify-between">
                    <div
                      className={`h-10 w-10 rounded-xl ${
                        dark ? "bg-white/[0.06]" : "bg-black/[0.055]"
                      }`}
                    />
                    <div
                      className={`h-6 w-20 rounded-full ${
                        dark ? "bg-white/[0.06]" : "bg-black/[0.055]"
                      }`}
                    />
                  </div>

                  <div
                    className={`mb-3 h-5 w-3/4 rounded ${
                      dark ? "bg-white/[0.06]" : "bg-black/[0.055]"
                    }`}
                  />

                  <div
                    className={`mb-2 h-3 w-full rounded ${
                      dark ? "bg-white/[0.04]" : "bg-black/[0.035]"
                    }`}
                  />

                  <div
                    className={`mb-6 h-3 w-5/6 rounded ${
                      dark ? "bg-white/[0.04]" : "bg-black/[0.035]"
                    }`}
                  />

                  <div className="flex gap-2">
                    <div
                      className={`h-7 w-16 rounded-lg ${
                        dark ? "bg-white/[0.05]" : "bg-black/[0.04]"
                      }`}
                    />
                    <div
                      className={`h-7 w-20 rounded-lg ${
                        dark ? "bg-white/[0.05]" : "bg-black/[0.04]"
                      }`}
                    />
                  </div>

                  <div
                    className={`mt-8 h-9 w-full rounded-xl ${
                      dark ? "bg-white/[0.05]" : "bg-black/[0.045]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : featuredBounties.length === 0 ? (
          /* EMPTY STATE */
          <div
            data-reveal
            className={`relative z-10 mx-auto max-w-7xl overflow-hidden rounded-[26px] border backdrop-blur-xl ${surfaceClass}`}
          >
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
              <div
                className={`
                  mb-5 flex h-16 w-16 items-center justify-center rounded-2xl
                  border
                  ${
                    dark
                      ? "border-[#00D6A0]/25 bg-[#101512] text-[#00D6A0]"
                      : "border-[#00D6A0]/25 bg-white text-[#008A66]"
                  }
                `}
              >
                <FiBriefcase className="h-7 w-7" />
              </div>

              <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#008A66]">
                Your next opportunity
              </span>

              <h3 className="text-xl font-bold">No featured bounties yet</h3>

              <p className={`mt-3 max-w-md text-sm leading-6 ${mutedText}`}>
                There are no opportunities to display right now. Check back soon
                to discover new tasks posted by the community.
              </p>

              <Link
                to="/dashboard"
                onClick={navigateTo("/dashboard")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-bold text-[#06231B] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(0,214,160,0.18)]"
              >
                Browse bounties
                <FiArrowRight />
              </Link>
            </div>
          </div>
        ) : (
          /* FEATURED BOUNTY CARDS */
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredBounties.map((bounty, index) => (
              <div
                key={bounty._id}
                data-reveal
                className="featured-bounty-card group relative"
                style={{
                  "--reveal-delay": `${index * 100}ms`,
                }}
              >
                <div className="bounty-hover-glow pointer-events-none absolute -inset-2 rounded-[28px] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="bounty-top-line pointer-events-none absolute left-8 right-8 top-0 z-20 h-px overflow-hidden">
                  <div className="bounty-top-line-inner h-full w-1/3" />
                </div>

                <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                  <BountyCard bounty={bounty} dark={dark} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION FOOTER */}
        <div
          data-reveal
          className={`relative z-10 mx-auto mt-7 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t pt-5 ${
            dark ? "border-white/[0.07]" : "border-black/[0.07]"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiGlobe className={`h-4 w-4 ${mutedText}`} />
            <span
              className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${mutedText}`}
            >
              Open Web3 opportunities
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiShield className="h-4 w-4 text-[#008A66]" />
            <span
              className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${mutedText}`}
            >
              Rewards subject to bounty terms
            </span>
          </div>
        </div>
      </section>

      {/* SECOND LIVE TICKER */}
      <div data-reveal>
        <LiveTricker />
      </div>

      {/* FEATURES */}
      <section data-reveal>
        <Features />
      </section>

      {/* IMPACTSTATS */}
      <div data-reveal>
        <ImpactStats />
      </div>

      {/* TESTIMONIALS / COMMUNITY USE CASES */}
      <section data-reveal>
        <Testimonials />
      </section>

      {/* SUPPORTED NETWORKS */}
      <section data-reveal>
        <SupportedNetworks dark={dark} />
      </section>

      {/* BUILT FOR WEB3 */}
      <section data-reveal>
        <BuiltForWeb3 />
      </section>

      {/* THIRD LIVE TICKER */}
      <div data-reveal>
        <LiveTricker />
      </div>

      {/* FINAL CTA */}
      <section data-reveal>
        <CallToAction />
      </section>

      {/* FOOTER */}
      <footer className="relative z-10">
        <Footer />
      </footer>

      {/* FLOATING HELP BUTTON */}
      <div className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
        {assistantOpen && (
          <div
            className={`
              help-panel w-[min(340px,calc(100vw-2rem))]
              rounded-2xl border p-4 shadow-2xl backdrop-blur-xl
              ${
                dark
                  ? "border-white/10 bg-[#0B1210]/95 text-white"
                  : "border-black/10 bg-white/95 text-gray-900"
              }
            `}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold">
                <FiZap className="text-[#00D6A0]" />
                Happy Bounty Help
              </div>

              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                aria-label="Close help message"
                className="rounded-lg p-1 transition-colors hover:bg-[#00D6A0]/10 hover:text-[#00D6A0]"
              >
                <FiX />
              </button>
            </div>

            <p
              className={`text-sm leading-6 ${
                dark ? "text-white/65" : "text-gray-600"
              }`}
            >
              Welcome to Happy Bounty! Explore available tasks, choose an
              opportunity that matches your skills, and follow its requirements.
              You can also post your own bounty to get help from the community.
            </p>

            <Link
              to="/dashboard"
              onClick={(event) => {
                event.preventDefault();
                setAssistantOpen(false);
                handleNavigate("/dashboard");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-3 py-2.5 text-sm font-bold text-[#06231B] transition-all duration-300 hover:shadow-[0_6px_22px_rgba(0,214,160,0.2)]"
            >
              Explore bounties
              <FiArrowRight />
            </Link>

            <p
              className={`mt-3 text-[10px] ${
                dark ? "text-white/35" : "text-gray-400"
              }`}
            >
              Happy Bounty · Community opportunities
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setAssistantOpen((open) => !open)}
          aria-label={assistantOpen ? "Close help" : "Open Happy Bounty help"}
          title="Happy Bounty help"
          className="help-fab flex h-14 w-14 items-center justify-center rounded-full border border-[#00D6A0]/50 bg-[#00D6A0] text-[#06231B] shadow-[0_10px_35px_rgba(0,214,160,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-105"
        >
          {assistantOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* BACK TO TOP */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        title="Back to top"
        className={`
          back-to-top fixed bottom-5 left-4 z-[100]
          flex h-11 w-11 items-center justify-center rounded-full
          border border-[#00D6A0]/35 bg-[#0B1210] text-[#00D6A0]
          shadow-lg transition-all duration-300
          hover:-translate-y-1 hover:bg-[#00D6A0] hover:text-[#06231B]
          sm:bottom-7 sm:left-7
          ${
            showScrollTop
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }
        `}
      >
        <FiArrowUp className="h-5 w-5" />
      </button>

      {/* ANIMATIONS */}
      <style>{`
        .landing-page {
          scroll-behavior: smooth;
        }

        .hero-shell {
          isolation: isolate;
        }

        .hero-grid {
          opacity: 0.28;
          background-image:
            linear-gradient(
              ${dark ? "rgba(0,214,160,0.09)" : "rgba(0,138,102,0.07)"} 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              ${dark ? "rgba(0,214,160,0.09)" : "rgba(0,138,102,0.07)"} 1px,
              transparent 1px
            );
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 85%);
          animation: gridDrift 24s linear infinite;
        }

        .hero-glow {
          width: 300px;
          height: 300px;
          border-radius: 9999px;
          background: rgba(0, 214, 160, 0.09);
          filter: blur(85px);
          opacity: 0.65;
          animation: glowFloat 11s ease-in-out infinite alternate;
        }

        .hero-glow-one {
          top: 5%;
          right: -8%;
        }

        .hero-glow-two {
          bottom: -15%;
          left: -10%;
          animation-delay: -5s;
        }

        .section-glow {
          background: rgba(0, 214, 160, 0.045);
          filter: blur(80px);
        }

        [data-reveal] {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          transition:
            opacity 750ms cubic-bezier(.22, 1, .36, 1),
            transform 750ms cubic-bezier(.22, 1, .36, 1);
          transition-delay: var(--reveal-delay, 0ms);
        }

        [data-reveal].reveal-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        .skeleton-card {
          isolation: isolate;
        }

        .skeleton-shimmer {
          z-index: 0;
          pointer-events: none;
          transform: translateX(-100%);
          background: linear-gradient(
            105deg,
            transparent 20%,
            ${dark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.65)"} 50%,
            transparent 80%
          );
          animation: skeletonShimmer 2s ease-in-out infinite;
        }

        .featured-bounty-card {
          min-width: 0;
          animation: bountyEnter 700ms cubic-bezier(.22, 1, .36, 1) both;
          animation-delay: var(--reveal-delay, 0ms);
        }

        .bounty-hover-glow {
          background: rgba(0, 214, 160, 0.10);
        }

        .bounty-top-line-inner {
          background: linear-gradient(
            90deg,
            transparent,
            #00D6A0,
            transparent
          );
          animation: bountyLineMove 4s ease-in-out infinite;
        }

        .help-fab {
          animation: fabPulse 4s ease-in-out infinite;
        }

        .help-panel {
          transform-origin: bottom right;
          animation: panelEnter 240ms cubic-bezier(.22, 1, .36, 1) both;
        }

        .back-to-top {
          transition:
            opacity 250ms ease,
            transform 250ms ease,
            background-color 250ms ease,
            color 250ms ease;
        }

        @keyframes gridDrift {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 56px 56px;
          }
        }

        @keyframes glowFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(0.95);
          }
          100% {
            transform: translate3d(-18px, 22px, 0) scale(1.08);
          }
        }

        @keyframes skeletonShimmer {
          0% {
            transform: translateX(-100%);
          }
          60%, 100% {
            transform: translateX(120%);
          }
        }

        @keyframes bountyEnter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bountyLineMove {
          0% {
            transform: translateX(-140%);
            opacity: 0;
          }
          20%, 65% {
            opacity: 1;
          }
          100% {
            transform: translateX(420%);
            opacity: 0;
          }
        }

        @keyframes fabPulse {
          0%, 88%, 100% {
            box-shadow: 0 10px 35px rgba(0, 214, 160, 0.22);
          }
          94% {
            box-shadow: 0 10px 42px rgba(0, 214, 160, 0.38);
          }
        }

        @keyframes panelEnter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 767px) {
          .hero-grid {
            background-size: 38px 38px;
          }

          .hero-glow {
            width: 200px;
            height: 200px;
            filter: blur(65px);
          }

          [data-reveal] {
            transform: translate3d(0, 14px, 0);
            transition-duration: 550ms;
          }

          .featured-bounty-card {
            animation-duration: 550ms;
          }

          .help-fab {
            animation: none;
          }
        }

        @media (hover: none) {
          .featured-bounty-card .bounty-hover-glow {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-page,
          .landing-page * {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          [data-reveal] {
            opacity: 1 !important;
            transform: none !important;
          }

          .featured-bounty-card {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
