import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiCode,
  FiCompass,
  FiDollarSign,
  FiGlobe,
  FiLayers,
  FiPenTool,
  FiShield,
  FiTarget,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import botLogo from "../assets/images/bot.png";
import arcLogo from "../assets/images/arc.png";

const communityUseCases = [
  {
    icon: FiCode,
    role: "Bounty Creator",
    type: "For project builders",
    category: "CREATE",
    message:
      "Turn your project goals into clear, rewarding tasks. Define requirements, set rewards, and invite contributors to bring your ideas to life.",
    footer: "Create opportunities",
    number: "01",
  },
  {
    icon: FiPenTool,
    role: "Bounty Contributor",
    type: "For independent talent",
    category: "CONTRIBUTE",
    message:
      "Discover opportunities that match your skills, complete the work, submit your contribution, and earn rewards when your work is approved.",
    footer: "Put your skills to work",
    number: "02",
  },
  {
    icon: FiLayers,
    role: "Web3 Developer",
    type: "For technical teams",
    category: "BUILD",
    message:
      "Break ambitious ideas into focused tasks. Give contributors clear requirements and a straightforward path from submission to reward.",
    footer: "Build with clarity",
    number: "03",
  },
  {
    icon: FiDollarSign,
    role: "Project Founder",
    type: "For growing projects",
    category: "REWARD",
    message:
      "Define the work that needs to be done and the reward attached to it. Help contributors understand each opportunity before they begin.",
    footer: "Reward good work",
    number: "04",
  },
  {
    icon: FiGlobe,
    role: "Global Contributor",
    type: "For remote collaboration",
    category: "GLOBAL",
    message:
      "Find opportunities beyond your immediate network. Connect your skills with projects and communities that need your contributions.",
    footer: "Work across communities",
    number: "05",
  },
  {
    icon: FiUsers,
    role: "Community Builder",
    type: "For Web3 communities",
    category: "COMMUNITY",
    message:
      "Turn community goals into actionable tasks. Give people a shared objective and meaningful reasons to participate and contribute.",
    footer: "Bring people together",
    number: "06",
  },
  {
    icon: FiTarget,
    role: "Creative Contributor",
    type: "For creative projects",
    category: "CREATIVITY",
    message:
      "From content and design to research and social campaigns, turn creative skills into meaningful contributions for growing projects.",
    footer: "Create and contribute",
    number: "07",
  },
  {
    icon: FiShield,
    role: "Independent Builder",
    type: "For transparent workflows",
    category: "CLARITY",
    message:
      "Keep tasks, submission requirements, and rewards clear so creators and contributors know what to expect when working together.",
    footer: "Work with confidence",
    number: "08",
  },
];

const networks = [
  {
    name: "Arc",
    symbol: "ARC",
    logo: arcLogo,
    description: "Explore opportunities in the Arc ecosystem.",
  },
  {
    name: "BOTCHAIN",
    symbol: "BOT",
    logo: botLogo,
    description: "Discover tasks and contribute to BOTCHAIN projects.",
  },
];

const valuePoints = [
  {
    icon: FiCompass,
    title: "Discover opportunities",
    description:
      "Explore tasks that match your interests, goals, and skills.",
  },
  {
    icon: FiZap,
    title: "Turn effort into value",
    description:
      "Complete meaningful work and pursue the rewards attached to it.",
  },
  {
    icon: FiShield,
    title: "Know what to expect",
    description:
      "Understand task requirements and reward details before you begin.",
  },
];

function useDarkTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

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

  return dark;
}

function useReveal() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      typeof IntersectionObserver === "undefined" ||
      reduceMotion
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.06 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return { sectionRef, isVisible };
}

export default function Testimonials() {
  const dark = useDarkTheme();
  const { sectionRef, isVisible } = useReveal();

  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [slideStep, setSlideStep] = useState(0);

  const viewportRef = useRef(null);
  const firstSlideRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const maxSlide = Math.max(
    0,
    communityUseCases.length - visibleCount,
  );

  // Keep the number of visible cards responsive.
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();

    window.addEventListener("resize", updateVisibleCount);

    return () =>
      window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Measure one card plus the real CSS gap so the track moves
  // by exactly one card on mobile, tablet, and desktop.
  useEffect(() => {
    const viewport = viewportRef.current;
    const firstSlide = firstSlideRef.current;

    if (!viewport || !firstSlide) return;

    const measureSlide = () => {
      const slideWidth = firstSlide.getBoundingClientRect().width;
      const track = firstSlide.parentElement;

      if (!track) return;

      const trackStyles = window.getComputedStyle(track);
      const gap =
        parseFloat(trackStyles.columnGap) ||
        parseFloat(trackStyles.gap) ||
        0;

      setSlideStep(slideWidth + gap);
    };

    measureSlide();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measureSlide);

      observer.observe(viewport);
      observer.observe(firstSlide);

      return () => observer.disconnect();
    }

    window.addEventListener("resize", measureSlide);

    return () =>
      window.removeEventListener("resize", measureSlide);
  }, [visibleCount]);

  // Keep the active position valid after a responsive layout change.
  useEffect(() => {
    setActiveSlide((current) => Math.min(current, maxSlide));
  }, [maxSlide]);

  // Automatically advance the carousel every 3.5 seconds.
  // Pause when the section is not visible, when the user is
  // interacting with it, or when reduced motion is requested.
  useEffect(() => {
    if (!isVisible || isPaused || maxSlide === 0) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (motionPreference.matches) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) =>
        current >= maxSlide ? 0 : current + 1,
      );
    }, 3500);

    return () => window.clearInterval(timer);
  }, [isVisible, isPaused, maxSlide]);

  const goToSlide = (index) => {
    setActiveSlide(Math.max(0, Math.min(index, maxSlide)));
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      current >= maxSlide ? 0 : current + 1,
    );
  };

  const previousSlide = () => {
    setActiveSlide((current) =>
      current <= 0 ? maxSlide : current - 1,
    );
  };

  const theme = dark
    ? {
        section: "border-white/[0.07] bg-[#080908] text-white",
        muted: "text-white/50",
        subtle: "text-white/35",
        surface: "border-white/[0.08] bg-[#101310]",
        softSurface: "border-white/[0.07] bg-white/[0.025]",
        heading: "text-white",
        description: "text-white/55",
        divider: "border-white/[0.08]",
        networkSurface: "border-white/[0.09] bg-white/[0.025]",
      }
    : {
        section: "border-black/[0.06] bg-[#f6f5ef] text-[#171916]",
        muted: "text-[#72776e]",
        subtle: "text-[#8a8e85]",
        surface: "border-black/[0.07] bg-white",
        softSurface: "border-black/[0.06] bg-white/70",
        heading: "text-[#171916]",
        description: "text-[#72776e]",
        divider: "border-black/[0.07]",
        networkSurface: "border-black/[0.07] bg-white/80",
      };

  return (
    <>
      <style>{`
        @keyframes hb-section-enter {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hb-soft-glow {
          0%, 100% {
            opacity: .4;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: .75;
            transform: translateX(-50%) scale(1.08);
          }
        }

        .hb-community-reveal {
          opacity: 0;
        }

        .hb-community-reveal.hb-community-visible {
          animation: hb-section-enter .75s cubic-bezier(.2,.75,.25,1) forwards;
        }

        .hb-community-network {
          transition: transform .25s ease, border-color .25s ease,
            box-shadow .25s ease;
        }

        .hb-community-network:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 214, 160, .4);
          box-shadow: 0 12px 35px rgba(0, 214, 160, .07);
        }

        .hb-community-grid {
          background-image:
            linear-gradient(rgba(0,214,160,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,214,160,.035) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .hb-community-glow {
          animation: hb-soft-glow 9s ease-in-out infinite;
        }

        /* Curved card carousel */
        .hb-curve-viewport {
          overflow: hidden;
          padding: 30px 2px 38px;
          touch-action: pan-y;
        }

        .hb-curve-track {
          display: flex;
          align-items: center;
          gap: 18px;
          transition: transform .65s cubic-bezier(.22,.75,.25,1);
          will-change: transform;
        }

        .hb-curve-slide {
          flex: 0 0 calc((100% - 36px) / 3);
          min-width: 0;
          transform: translateY(22px) scale(.94);
          opacity: .78;
          transition:
            transform .65s cubic-bezier(.22,.75,.25,1),
            opacity .5s ease,
            filter .5s ease;
        }

        .hb-curve-slide.is-active {
          transform: translateY(-16px) scale(1);
          opacity: 1;
          z-index: 2;
        }

        .hb-curve-slide.is-near {
          transform: translateY(8px) scale(.97);
          opacity: .94;
        }

        .hb-curve-slide .hb-community-card {
          height: 100%;
        }

        .hb-curve-controls button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          border: 1px solid rgba(0,214,160,.25);
          background: rgba(0,214,160,.07);
          color: #00A87D;
          transition: background .2s ease, transform .2s ease,
            border-color .2s ease;
        }

        .hb-curve-controls button:hover:not(:disabled) {
          background: rgba(0,214,160,.16);
          border-color: rgba(0,214,160,.55);
          transform: translateY(-2px);
        }

        .hb-curve-controls button:focus-visible,
        .hb-curve-dot:focus-visible {
          outline: 2px solid #00D6A0;
          outline-offset: 4px;
        }

        .hb-curve-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .hb-curve-dot {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 0;
          border-radius: 9999px;
          background: rgba(0,168,125,.28);
          transition: width .3s ease, background .3s ease;
        }

        .hb-curve-dot.is-current {
          width: 24px;
          background: #00D6A0;
        }

        @media (max-width: 1023px) {
          .hb-curve-track {
            gap: 16px;
          }

          .hb-curve-slide {
            flex-basis: calc((100% - 16px) / 2);
          }

          .hb-curve-slide.is-active {
            transform: translateY(-12px) scale(1);
          }
        }

        @media (max-width: 639px) {
          .hb-curve-viewport {
            padding: 18px 2px 24px;
          }

          .hb-curve-track {
            gap: 12px;
          }

          .hb-curve-slide {
            flex-basis: 100%;
            transform: translateY(8px) scale(.97);
            opacity: .85;
          }

          .hb-curve-slide.is-active {
            transform: translateY(-4px) scale(1);
            opacity: 1;
          }

          .hb-curve-slide.is-near {
            transform: translateY(4px) scale(.985);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-community-reveal,
          .hb-community-reveal.hb-community-visible {
            opacity: 1;
            animation: none !important;
            transform: none !important;
          }

          .hb-community-glow {
            animation: none !important;
          }

          .hb-community-network,
          .hb-curve-track,
          .hb-curve-slide,
          .hb-curve-dot,
          .hb-curve-controls button {
            transition: none !important;
          }

          .hb-community-network:hover,
          .hb-curve-controls button:hover:not(:disabled) {
            transform: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        aria-labelledby="hb-community-title"
        className={`relative isolate mx-3 my-6 overflow-hidden rounded-[28px] border transition-colors duration-300 sm:mx-5 sm:my-8 md:mx-8 md:rounded-[36px] lg:mx-12 ${theme.section}`}
      >
        <div
          aria-hidden="true"
          className="hb-community-grid pointer-events-none absolute inset-0 -z-10"
        />

        <div
          aria-hidden="true"
          className="hb-community-glow pointer-events-none absolute -top-36 left-1/2 -z-10 h-80 w-[min(760px,100%)] -translate-x-1/2 rounded-full bg-[#00D6A0]/[0.09] blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -right-24 -z-10 h-96 w-96 rounded-full bg-[#00D6A0]/[0.045] blur-[100px]"
        />

        <div className="relative mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 md:py-20 lg:px-12 lg:py-24">
          {/* Hero heading */}
          <header
            className={`hb-community-reveal ${
              isVisible ? "hb-community-visible" : ""
            } mx-auto max-w-4xl text-center`}
          >
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/[0.06] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#00A87D] sm:text-[10px]">
                Built for people who build
              </span>
            </div>

            <h2
              id="hb-community-title"
              className={`text-[clamp(2.5rem,6.5vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.065em] ${theme.heading}`}
            >
              Your skills have
              <br />
              <span className="bg-gradient-to-r from-[#008A66] via-[#00D6A0] to-[#00A87D] bg-clip-text text-transparent">
                real potential.
              </span>
            </h2>

            <p
              className={`mx-auto mt-6 max-w-2xl text-sm leading-7 sm:mt-7 sm:text-base sm:leading-8 ${theme.description}`}
            >
              Happy Bounty connects project creators with people ready
              to contribute. Discover tasks, deliver valuable work, and
              pursue rewards for your skills.
            </p>
          </header>

          {/* Ecosystem cards */}
          <div
            className={`hb-community-reveal ${
              isVisible ? "hb-community-visible" : ""
            } mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4`}
            style={{ animationDelay: "100ms" }}
          >
            {networks.map((network) => (
              <article
                key={network.symbol}
                className={`hb-community-network group flex items-center gap-4 rounded-2xl border p-4 sm:p-5 ${theme.networkSurface}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/15 bg-[#00D6A0]/[0.06] p-2.5">
                  <img
                    src={network.logo}
                    alt={`${network.name} logo`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold sm:text-base ${theme.heading}`}>
                      {network.name}
                    </h3>
                    <span className="rounded-md bg-[#00D6A0]/[0.09] px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[#00A87D]">
                      {network.symbol}
                    </span>
                  </div>

                  <p className={`mt-1.5 text-xs leading-5 ${theme.muted}`}>
                    {network.description}
                  </p>
                </div>

                <FiArrowUpRight
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 ${
                    dark ? "text-white/35" : "text-black/35"
                  }`}
                />
              </article>
            ))}
          </div>

          <p className={`mt-4 text-center text-[10px] ${theme.subtle}`}>
            Opportunities across the Arc and BOTCHAIN ecosystems.
          </p>

          {/* Curved carousel heading */}
          <div
            className={`hb-community-reveal ${
              isVisible ? "hb-community-visible" : ""
            } mb-3 mt-16 flex flex-col gap-3 sm:mb-5 sm:mt-20 sm:flex-row sm:items-end sm:justify-between`}
            style={{ animationDelay: "180ms" }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A87D]">
                One platform. Many possibilities.
              </p>

              <h3 className={`mt-3 text-2xl font-bold tracking-[-0.045em] sm:text-3xl lg:text-4xl ${theme.heading}`}>
                Find your place here.
              </h3>

              <p className={`mt-3 max-w-xl text-sm leading-7 ${theme.muted}`}>
                Whether you create tasks or complete them, there is a
                way to turn your skills and ideas into meaningful work.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className={`text-xs ${theme.muted}`}>
                {String(activeSlide + 1).padStart(2, "0")}{" "}
                <span className="mx-1 text-[#00A87D]">/</span>{" "}
                {String(maxSlide + 1).padStart(2, "0")}
              </span>

              <div className="hb-curve-controls flex gap-2">
                <button
                  type="button"
                  aria-label="Previous community card"
                  onClick={previousSlide}
                  onFocus={() => setIsPaused(true)}
                >
                  <FiArrowLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next community card"
                  onClick={nextSlide}
                  onFocus={() => setIsPaused(true)}
                >
                  <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Curved community carousel */}
          <div
            className={`hb-community-reveal ${
              isVisible ? "hb-community-visible" : ""
            }`}
            style={{ animationDelay: "220ms" }}
          >
            <div
              ref={viewportRef}
              className="hb-curve-viewport"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setIsPaused(false);
                }
              }}
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
                touchStartY.current = event.touches[0].clientY;
                setIsPaused(true);
              }}
              onTouchEnd={(event) => {
                if (
                  touchStartX.current === null ||
                  touchStartY.current === null
                ) {
                  setIsPaused(false);
                  return;
                }

                const deltaX =
                  event.changedTouches[0].clientX -
                  touchStartX.current;
                const deltaY =
                  event.changedTouches[0].clientY -
                  touchStartY.current;

                if (
                  Math.abs(deltaX) > 45 &&
                  Math.abs(deltaX) > Math.abs(deltaY)
                ) {
                  if (deltaX < 0) nextSlide();
                  else previousSlide();
                }

                touchStartX.current = null;
                touchStartY.current = null;

                // Allow the user to finish the swipe before resuming.
                window.setTimeout(() => setIsPaused(false), 1800);
              }}
              onTouchCancel={() => {
                touchStartX.current = null;
                touchStartY.current = null;
                setIsPaused(false);
              }}
            >
              <div
                className="hb-curve-track"
                style={{
                  transform: `translate3d(-${activeSlide * slideStep}px, 0, 0)`,
                }}
              >
                {communityUseCases.map((item, index) => {
                  const distance = Math.abs(index - activeSlide);
                  const isActive =
                    index === activeSlide + Math.floor(visibleCount / 2);
                  const isNear = distance <= 1;

                  return (
                    <div
                      key={item.number}
                      ref={index === 0 ? firstSlideRef : undefined}
                      className={`hb-curve-slide ${
                        isActive ? "is-active" : ""
                      } ${isNear ? "is-near" : ""}`}
                    >
                      <CommunityCard
                        item={item}
                        dark={dark}
                        visible={isVisible}
                        index={index}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="hb-curve-dots mt-2"
              aria-label="Choose a carousel page"
            >
              {Array.from({ length: maxSlide + 1 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to carousel position ${index + 1}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  className={`hb-curve-dot ${
                    activeSlide === index ? "is-current" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  onFocus={() => setIsPaused(true)}
                />
              ))}
            </div>

            <p className={`mt-3 text-center text-[10px] ${theme.subtle}`}>
              {isPaused
                ? "Carousel paused"
                : "Cards advance automatically"}
            </p>
          </div>

          {/* Value points */}
          <div
            className={`hb-community-reveal ${
              isVisible ? "hb-community-visible" : ""
            } mt-14 sm:mt-20`}
            style={{ animationDelay: "250ms" }}
          >
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00A87D]">
                Designed around contribution
              </p>

              <h3 className={`mt-3 text-xl font-bold tracking-[-0.04em] sm:text-2xl ${theme.heading}`}>
                A clearer way to get work done.
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {valuePoints.map((point) => (
                <ValuePoint
                  key={point.title}
                  point={point}
                  dark={dark}
                />
              ))}
            </div>
          </div>

          {/* Closing CTA */}
          <div
            className={`hb-community-reveal ${
              isVisible ? "hb-community-visible" : ""
            } mt-8 flex flex-col gap-6 rounded-3xl border p-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:p-9 ${
              dark
                ? "border-white/[0.08] bg-white/[0.025]"
                : "border-black/[0.06] bg-white/75"
            }`}
            style={{ animationDelay: "320ms" }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.08] text-[#00A87D]">
                <FiUsers className="h-5 w-5" />
              </div>

              <div>
                <h3 className={`text-base font-bold tracking-tight sm:text-lg ${theme.heading}`}>
                  Your next opportunity starts here.
                </h3>

                <p className={`mt-2 max-w-xl text-xs leading-6 sm:text-sm ${theme.muted}`}>
                  Discover a task, share your expertise, or create a
                  bounty that moves your project forward.
                </p>
              </div>
            </div>

            <a
              href="/dashboard"
              className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-bold text-[#06251c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18e6b1] hover:shadow-lg hover:shadow-[#00D6A0]/15 focus:outline-none focus:ring-2 focus:ring-[#00D6A0] focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Explore bounties
              <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Brand footer */}
          <div className={`mt-10 flex items-center justify-center gap-3 text-center text-[9px] font-semibold tracking-[0.2em] sm:mt-12 ${theme.subtle}`}>
            <span className="h-px w-8 bg-[#00D6A0]/40" />
            CREATE. CONTRIBUTE. EARN.
            <span className="h-px w-8 bg-[#00D6A0]/40" />
          </div>
        </div>
      </section>
    </>
  );
}

function CommunityCard({ item, dark, visible, index }) {
  const Icon = item.icon;

  return (
    <article
      className={`hb-community-card hb-community-reveal ${
        visible ? "hb-community-visible" : ""
      } group flex min-h-[320px] flex-col overflow-hidden rounded-2xl border p-5 sm:min-h-[340px] sm:rounded-3xl sm:p-6 ${
        dark
          ? "border-white/[0.08] bg-[#101310]"
          : "border-black/[0.07] bg-white shadow-sm"
      }`}
      style={{
        animationDelay: `${Math.min(index * 40, 250)}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#00A87D] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-[#00D6A0]/[0.13]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>

        <span
          className={`rounded-full border px-2.5 py-1.5 text-[9px] font-bold tracking-[0.12em] ${
            dark
              ? "border-white/[0.08] bg-white/[0.025] text-white/45"
              : "border-black/[0.06] bg-[#f7f8f3] text-[#74796f]"
          }`}
        >
          {item.category}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-[#00A87D]">
          {item.number} / 08
        </p>

        <h4
          className={`mt-2 text-xl font-bold tracking-[-0.04em] sm:text-[22px] ${
            dark ? "text-white" : "text-[#20241e]"
          }`}
        >
          {item.role}
        </h4>

        <p
          className={`mt-1.5 text-xs font-medium ${
            dark ? "text-white/40" : "text-[#85897f]"
          }`}
        >
          {item.type}
        </p>

        <p
          className={`mt-4 text-[13px] leading-6 sm:text-sm sm:leading-7 ${
            dark ? "text-white/55" : "text-[#62665d]"
          }`}
        >
          {item.message}
        </p>
      </div>

      <div
        className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 ${
          dark ? "border-white/[0.08]" : "border-black/[0.06]"
        }`}
      >
        <span
          className={`text-[11px] font-medium ${
            dark ? "text-white/45" : "text-[#777b72]"
          }`}
        >
          {item.footer}
        </span>

        <FiArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#00A87D] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
    </article>
  );
}

function ValuePoint({ dark, point }) {
  const Icon = point.icon;

  return (
    <article
      className={`group flex items-start gap-4 rounded-2xl border p-4 transition-colors duration-300 hover:border-[#00D6A0]/30 sm:p-5 ${
        dark
          ? "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]"
          : "border-black/[0.06] bg-white/70 hover:bg-white"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#00A87D] transition-transform duration-300 group-hover:scale-105">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h4
          className={`text-sm font-bold ${
            dark ? "text-white/90" : "text-[#292e27]"
          }`}
        >
          {point.title}
        </h4>

        <p
          className={`mt-1.5 text-xs leading-6 ${
            dark ? "text-white/45" : "text-[#7a7e75]"
          }`}
        >
          {point.description}
        </p>
      </div>

      <FiCheckCircle
        aria-hidden="true"
        className="mt-1 h-4 w-4 shrink-0 text-[#00A87D]/60"
      />
    </article>
  );
}
