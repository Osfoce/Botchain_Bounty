import { useEffect, useRef, useState } from "react";
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
  FiSend,
  FiLoader,
  FiRefreshCw,
  FiMail,
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

const SUPPORT_EMAIL = "happybounty9@gmail.com";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hello! 👋 Welcome to Happy Bounty Help Center. I can help you understand how to create bounties, fund tasks, submit work, receive rewards, and use the platform. What would you like to know?",
};

const SUGGESTED_QUESTIONS = [
  "What is Happy Bounty?",
  "How do I create a bounty?",
  "How do I fund a bounty?",
  "How can I complete a bounty?",
  "How do I submit my work?",
  "How do I receive my rewards?",
  "Which networks does Happy Bounty support?",
  "What are the platform fees?",
];

// Detect standalone thank-you messages.
// Messages that contain an additional question still go to the AI assistant.
const isThankYouMessage = (message) => {
  const normalized = message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return /^(thanks|thank you|thank u|thx|many thanks|much appreciated|appreciate it|i appreciate it|cheers|got it thanks|okay thanks|ok thanks|alright thanks|cool thanks|great thanks|perfect thanks|thanks a bunch)( so much| a lot| very much)?$/.test(
    normalized
  );
};

function LandingPage({ dark, setDark }) {
  const [featuredBounties, setFeaturedBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalBounties: 0,
    totalRewards: 0,
    totalUsers: 0,
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Help Center state
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState("");

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const { handleNavigate } = useNav();

  const API_URL = import.meta.env.VITE_API_URL;

  // Scroll-to-top visibility
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

  // Reveal sections as they enter the viewport
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
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [loading, featuredBounties.length]);

  // Automatically scroll to the latest chat message
  useEffect(() => {
    if (assistantOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, assistantOpen, sendingMessage]);

  // Focus input when Help Center opens
  useEffect(() => {
    if (assistantOpen) {
      const timeout = setTimeout(() => {
        chatInputRef.current?.focus();
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [assistantOpen]);

  // FETCH FEATURED BOUNTIES AND STATS
  // Existing API endpoints and response fields are preserved.
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

    if (API_URL) {
      fetchFeaturedBounties();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [API_URL]);

  const navigateTo = (path) => (event) => {
    event.preventDefault();
    handleNavigate(path);
  };

  // SEND MESSAGE TO FAQ SUPPORT BACKEND
  const sendMessage = async (messageText = chatInput) => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || sendingMessage) return;

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setChatInput("");
    setChatError("");
    setSendingMessage(true);

    try {
      // Handle simple thank-you messages locally.
      // No backend or OpenAI request is needed for these.
      if (isThankYouMessage(trimmedMessage)) {
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              "You're very welcome! 😊 If you still have any questions, feel free to reach us through our Contact Us page or email us at happybounty9@gmail.com. We're always happy to help!",
            source: "greeting",
          },
        ]);

        return;
      }

      if (!API_URL) {
        throw new Error(
          "The support service is currently unavailable. Please email us at " +
            SUPPORT_EMAIL
        );
      }

      const conversation = updatedMessages
        .filter((message) =>
          ["user", "assistant"].includes(message.role)
        )
        .slice(-10)
        .map(({ role, content }) => ({
          role,
          content,
        }));

      const response = await axios.post(
        `${API_URL}/assistant/chat`,
        {
          messages: conversation,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (!response.data?.reply) {
        throw new Error("The support assistant returned an empty response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.reply,
          source: response.data.source || "support",
        },
      ]);
    } catch (error) {
      console.error("Happy Bounty Help Center error:", error);

      const serverMessage =
        error.response?.data?.reply ||
        error.response?.data?.error ||
        error.message;

      setChatError(
        serverMessage ||
          (error.code === "ECONNABORTED"
            ? "The support service is taking too long to respond. Please try again."
            : "Unable to connect to Happy Bounty support. Please try again or email us at " +
              SUPPORT_EMAIL)
      );
    } finally {
      setSendingMessage(false);

      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }
  };

  const resetChat = () => {
    if (sendingMessage) return;

    setMessages([INITIAL_MESSAGE]);
    setChatInput("");
    setChatError("");
  };

  const getMessageLabel = (source) => {
    if (source === "free") return "Quick answer";
    if (source === "support") return "Support guidance";
    if (source === "greeting") return "Happy to help";
    return "Help Center";
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
          hero-shell relative z-10 mx-3 md:mt-5 overflow-hidden rounded-2xl
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

      {/* IMPACT STATS */}
      <div data-reveal>
        <ImpactStats />
      </div>

      {/* TESTIMONIALS */}
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

      {/* HAPPY BOUNTY HELP CENTER */}
      <div className="fixed bottom-3 right-3 z-[110] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">

        {/* CHAT WINDOW */}
        {assistantOpen && (
          <div
            className={`
              hb-chat-window flex w-[min(390px,calc(100vw-1.5rem))]
              flex-col overflow-hidden rounded-[24px] border shadow-2xl
              ${
                dark
                  ? "border-white/10 bg-[#0B100E] text-white"
                  : "border-black/[0.08] bg-white text-[#171717]"
              }
            `}
            role="dialog"
            aria-label="Happy Bounty Help Center"
          >
            {/* CHAT HEADER */}
            <div className="relative shrink-0 overflow-hidden border-b border-[#00D6A0]/15 bg-[#0B1712] px-4 py-4 text-white">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#00D6A0]/10 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00D6A0]/30 bg-[#00D6A0]/10 text-[#00D6A0]">
                    <FiMessageCircle className="h-5 w-5" />

                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B1712] bg-[#00D6A0]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold tracking-tight">
                      Happy Bounty Help Center
                    </h3>

                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/55">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D6A0]" />
                      Your personal platform assistant
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={resetChat}
                    disabled={sendingMessage}
                    title="New conversation"
                    aria-label="Start a new conversation"
                    className="rounded-lg p-2 text-white/55 transition hover:bg-white/10 hover:text-[#00D6A0] disabled:opacity-30"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssistantOpen(false)}
                    aria-label="Close Help Center"
                    className="rounded-lg p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <div
              className="hb-chat-messages flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4"
              aria-live="polite"
            >
              <div className="mb-1 shrink-0 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] ${
                    dark
                      ? "bg-white/[0.045] text-white/35"
                      : "bg-black/[0.035] text-black/40"
                  }`}
                >
                  Happy Bounty support
                </span>
              </div>

              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={`${index}-${message.role}`}
                    className={`flex w-full shrink-0 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] break-words rounded-2xl px-3.5 py-3 text-[12px] leading-[1.75] ${
                        isUser
                          ? "rounded-br-md bg-[#00D6A0] text-[#06231B]"
                          : dark
                            ? "rounded-bl-md border border-white/[0.07] bg-white/[0.045] text-white/80"
                            : "rounded-bl-md border border-black/[0.06] bg-[#F4F6F4] text-[#333333]"
                      }`}
                    >
                      {!isUser && (
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#00A87D]">
                          <FiMessageCircle className="h-3 w-3" />
                          Happy Bounty Support

                          {message.source && (
                            <span className="ml-1 rounded-full bg-[#00D6A0]/10 px-2 py-1 text-[8px] font-semibold text-[#00A87D]">
                              {getMessageLabel(message.source)}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* SUPPORT CONTACT ACTIONS */}
                      {!isUser &&
                        ["support", "greeting"].includes(message.source) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a
                              href={`mailto:${SUPPORT_EMAIL}`}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#00D6A0] px-3 py-2 text-[10px] font-bold text-[#06231B] transition hover:bg-[#00B98A]"
                            >
                              <FiMail className="h-3.5 w-3.5" />
                              Email support
                            </a>

                            <Link
                              to="/contact"
                              onClick={() => setAssistantOpen(false)}
                              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold transition hover:border-[#00D6A0]/50 hover:text-[#00A87D] ${
                                dark
                                  ? "border-white/10 text-white/70"
                                  : "border-black/10 text-gray-600"
                              }`}
                            >
                              Contact Us
                            </Link>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              {/* TYPING INDICATOR */}
              {sendingMessage && (
                <div className="flex shrink-0 justify-start">
                  <div
                    className={`flex items-center gap-2 rounded-2xl rounded-bl-md border px-4 py-3 ${
                      dark
                        ? "border-white/[0.07] bg-white/[0.045] text-white/50"
                        : "border-black/[0.06] bg-[#F4F6F4] text-gray-500"
                    }`}
                  >
                    <span className="flex gap-1">
                      <span className="hb-typing-dot h-1.5 w-1.5 rounded-full bg-[#00A87D]" />
                      <span className="hb-typing-dot h-1.5 w-1.5 rounded-full bg-[#00A87D]" />
                      <span className="hb-typing-dot h-1.5 w-1.5 rounded-full bg-[#00A87D]" />
                    </span>

                    <span className="text-[10px]">Checking help topics...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTED QUESTIONS */}
            {messages.length === 1 && !sendingMessage && (
              <div className="shrink-0 px-4 pb-3">
                <p
                  className={`mb-2 text-[10px] font-semibold ${
                    dark ? "text-white/40" : "text-gray-400"
                  }`}
                >
                  YOU CAN ASK ME
                </p>

                <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      disabled={sendingMessage}
                      className={`rounded-xl border px-3 py-2 text-left text-[10px] font-medium transition-all hover:border-[#00D6A0]/50 hover:text-[#00A87D] disabled:opacity-40 ${
                        dark
                          ? "border-white/10 bg-white/[0.025] text-white/65"
                          : "border-black/[0.08] bg-white text-gray-600"
                      }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {chatError && (
              <div className="mx-4 mb-2 shrink-0 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2">
                <p className="text-[10px] leading-5 text-red-500">
                  {chatError}
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-[10px] font-bold text-[#00A87D] underline"
                  >
                    Email support
                  </a>

                  <button
                    type="button"
                    onClick={() => setChatError("")}
                    className="text-[10px] font-bold text-red-500 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* CHAT INPUT - ALWAYS AT THE BOTTOM */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className={`hb-chat-input shrink-0 border-t p-3 ${
                dark ? "border-white/[0.07]" : "border-black/[0.07]"
              }`}
            >
              <div
                className={`flex min-w-0 items-center gap-2 rounded-xl border p-1.5 transition focus-within:border-[#00D6A0]/60 ${
                  dark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-black/[0.08] bg-[#F7F8F7]"
                }`}
              >
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask Happy Bounty..."
                  maxLength={2000}
                  disabled={sendingMessage}
                  aria-label="Type your support question"
                  className={`min-w-0 w-full flex-1 bg-transparent px-2 py-2.5 text-xs outline-none placeholder:text-gray-500 disabled:opacity-50 ${
                    dark ? "text-white" : "text-gray-900"
                  }`}
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || sendingMessage}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00D6A0] text-[#06231B] transition-all hover:bg-[#00B98A] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {sendingMessage ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiSend className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                <span
                  className={`text-[9px] ${
                    dark ? "text-white/30" : "text-gray-400"
                  }`}
                >
                  Happy Bounty Help Center
                </span>

                <span
                  className={`text-[9px] ${
                    dark ? "text-white/25" : "text-gray-400"
                  }`}
                >
                  {chatInput.length}/2000
                </span>
              </div>
            </form>
          </div>
        )}

        {/* FLOATING CHAT BUTTON */}
        <button
          type="button"
          onClick={() => {
            setAssistantOpen((open) => !open);
            setChatError("");
          }}
          aria-label={
            assistantOpen
              ? "Close Happy Bounty Help Center"
              : "Open Happy Bounty Help Center"
          }
          title="Contact Happy Bounty support"
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

        /*
          Chat panel uses the available viewport height.
          The message list scrolls independently while the
          input and send button remain anchored at the bottom.
        */
        .hb-chat-window {
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: min(620px, calc(100dvh - 8rem));
          max-height: calc(100dvh - 8rem);
          transform-origin: bottom right;
          animation: panelEnter 240ms cubic-bezier(.22, 1, .36, 1) both;
        }

        .hb-chat-messages {
          min-height: 0;
          flex: 1 1 auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 168, 125, 0.35) transparent;
        }

        .hb-chat-messages::-webkit-scrollbar {
          width: 4px;
        }

        .hb-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 168, 125, 0.35);
          border-radius: 20px;
        }

        .hb-chat-input {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }

        .hb-typing-dot {
          animation: typingBounce 1.1s ease-in-out infinite;
        }

        .hb-typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .hb-typing-dot:nth-child(3) {
          animation-delay: 0.3s;
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

        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
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

          .hb-chat-window {
            width: min(420px, calc(100vw - 1.5rem));
            height: min(620px, calc(100dvh - 6rem));
            max-height: calc(100dvh - 6rem);
            border-radius: 20px;
          }

          .hb-chat-messages {
            padding-left: 0.85rem;
            padding-right: 0.85rem;
          }

          .hb-chat-input {
            padding: 0.65rem;
            padding-bottom: max(0.65rem, env(safe-area-inset-bottom));
          }
        }

        @media (max-height: 560px) {
          .hb-chat-window {
            height: calc(100dvh - 5rem);
            max-height: calc(100dvh - 5rem);
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