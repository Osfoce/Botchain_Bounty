
import { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiCode,
  FiGlobe,
  FiLayers,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import ArcLogo from "../assets/images/arc.png";
import BotchainLogo from "../assets/images/bot.png";
import WorldImage from "../assets/images/world.png";
import happyBountyVideo from "../Video/happy-demo.mp4";

const HowItWorks = () => {
  const [isDark, setIsDark] = useState(true);
  const animationObserver = useRef(null);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Scroll reveal animations
  useEffect(() => {
    const elements = document.querySelectorAll(".hb-reveal");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => {
        element.classList.add("hb-visible");
      });
      return;
    }

    animationObserver.current = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("hb-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    elements.forEach((element) => {
      animationObserver.current.observe(element);
    });

    return () => {
      animationObserver.current?.disconnect();
    };
  }, []);

  const theme = {
    background: isDark ? "bg-[#080908]" : "bg-[#f6f5ef]",
    text: isDark ? "text-white" : "text-[#151515]",
    muted: isDark ? "text-gray-400" : "text-gray-600",
    card: isDark
      ? "bg-[#101411] border-white/10"
      : "bg-white border-black/10",
    secondaryCard: isDark
      ? "bg-[#0b100d] border-white/10"
      : "bg-[#f0f2ec] border-black/10",
    green: "#00D6A0",
    greenHover: "#008A66",
  };

  const highlights = [
    {
      icon: FiLayers,
      title: "Multi-ecosystem",
      description:
        "Explore bounty opportunities across supported blockchain ecosystems.",
    },
    {
      icon: FiShield,
      title: "Wallet-powered",
      description:
        "Connect your wallet to participate in bounty opportunities.",
    },
    {
      icon: FiCheckCircle,
      title: "Work to rewards",
      description:
        "Complete tasks, submit your work, and earn rewards after approval.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: FiTarget,
      title: "Discover a bounty",
      description:
        "Explore available bounties and find tasks that match your skills and interests.",
    },
    {
      number: "02",
      icon: FiUserPlus,
      title: "Participate",
      description:
        "Connect your wallet and join a bounty to get started on the task.",
    },
    {
      number: "03",
      icon: FiCode,
      title: "Complete the work",
      description:
        "Follow the requirements, complete the task, and submit your work for review.",
    },
    {
      number: "04",
      icon: FiTrendingUp,
      title: "Get rewarded",
      description:
        "Once your submission is approved, receive the bounty reward.",
    },
  ];

  const ecosystems = [
    {
      name: "Arc",
      description: "Explore bounty opportunities in the Arc ecosystem.",
      logo: ArcLogo,
    },
    {
      name: "Botchain",
      description:
        "Discover tasks and opportunities in the Botchain ecosystem.",
      logo: BotchainLogo,
    },
  ];

  return (
    <main
      className={`${theme.background} ${theme.text} min-h-screen overflow-hidden transition-colors duration-300`}
    >
      {/* HERO SECTION */}
      <section className="relative px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00D6A0]/10 blur-[120px] hb-hero-glow" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="hb-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/10 px-4 py-2 text-sm font-medium text-[#00D6A0]">
              <FiZap />
              <span>How Happy Bounty Works</span>
            </div>

            <h1 className="hb-reveal hb-delay-1 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Turn your skills into{" "}
              <span className="text-[#00D6A0] hb-heading-glow">
                rewards.
              </span>
            </h1>

            <p
              className={`hb-reveal hb-delay-2 mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg ${theme.muted}`}
            >
              Discover opportunities, complete meaningful tasks, and earn
              rewards. Happy Bounty connects people who need work done with
              contributors ready to get it done.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {highlights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`${theme.card} hb-reveal hb-card group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40`}
                    style={{ "--reveal-delay": `${index * 130}ms` }}
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-xl text-[#00D6A0] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon />
                    </div>

                    <h3 className="text-base font-semibold">{item.title}</h3>

                    <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ROTATING WORLD SECTION */}
      <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D6A0]/[0.06] blur-[100px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-5 text-center">
            <span className="hb-reveal text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              Global opportunities
            </span>

            <h2 className="hb-reveal hb-delay-1 mt-4 text-3xl font-bold sm:text-4xl">
              Opportunities have no borders.
            </h2>

            <p className={`hb-reveal hb-delay-2 mx-auto mt-4 max-w-2xl leading-7 ${theme.muted}`}>
              Connect with bounty opportunities and contribute to growing
              communities from anywhere in the world.
            </p>
          </div>

          <div className="hb-reveal hb-globe-stage relative mx-auto mt-8 flex aspect-square w-full max-w-[420px] items-center justify-center sm:max-w-[480px]">
            {/* Ambient background glow */}
            <div className="hb-globe-glow pointer-events-none absolute inset-[12%] rounded-full bg-[#00D6A0]/20 blur-[65px]" />

            {/* Outer orbit */}
            <div className="hb-globe-orbit pointer-events-none absolute inset-[5%] rounded-full border border-[#00D6A0]/20" />

            {/* Second orbit */}
            <div className="hb-globe-orbit-two pointer-events-none absolute inset-[13%] rounded-[50%] border border-dashed border-[#00D6A0]/20" />

            {/* Horizontal orbit */}
            <div className="hb-globe-orbit-horizontal pointer-events-none absolute left-0 right-0 top-1/2 h-[35%] -translate-y-1/2 rounded-[50%] border border-[#00D6A0]/25" />

            {/* Globe image */}
            <div className="hb-globe-image-wrap relative z-10 flex h-[76%] w-[76%] items-center justify-center">
              <img
                src={WorldImage}
                alt="Global network of opportunities"
                className="hb-rotating-world h-full w-full object-contain"
              />
            </div>

            {/* Orbit markers */}
            <div className="hb-orbit-dot hb-orbit-dot-one absolute left-[16%] top-[25%] z-20" />
            <div className="hb-orbit-dot hb-orbit-dot-two absolute right-[13%] top-[40%] z-20" />
            <div className="hb-orbit-dot hb-orbit-dot-three absolute bottom-[20%] left-[36%] z-20" />

            {/* Floating ecosystem labels */}
            <div className={`${theme.card} hb-globe-label hb-globe-label-left absolute left-0 top-[35%] z-30 flex items-center gap-2 rounded-xl border px-3 py-2 shadow-xl sm:px-4 sm:py-3`}>
              <img src={ArcLogo} alt="Arc" className="h-6 w-6 object-contain" />
              <span className="text-sm font-semibold">Arc</span>
            </div>

            <div className={`${theme.card} hb-globe-label hb-globe-label-right absolute bottom-[27%] right-0 z-30 flex items-center gap-2 rounded-xl border px-3 py-2 shadow-xl sm:px-4 sm:py-3`}>
              <img
                src={BotchainLogo}
                alt="Botchain"
                className="h-6 w-6 object-contain"
              />
              <span className="text-sm font-semibold">Botchain</span>
            </div>
          </div>

          <div className="hb-reveal mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2 text-xs font-medium text-[#00D6A0]">
              <FiGlobe />
              Global participation
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2 text-xs font-medium text-[#00D6A0]">
              <FiZap />
              Growing ecosystems
            </span>
          </div>
        </div>
      </section>

      {/* ECOSYSTEMS SECTION */}
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="hb-reveal text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              Supported ecosystems
            </span>

            <h2 className="hb-reveal hb-delay-1 mt-4 text-3xl font-bold sm:text-4xl">
              Built for growing communities
            </h2>

            <p className={`hb-reveal hb-delay-2 mx-auto mt-4 max-w-2xl ${theme.muted}`}>
              Discover opportunities and participate in the ecosystems
              supported by Happy Bounty.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ecosystems.map((ecosystem, index) => (
              <div
                key={ecosystem.name}
                className={`${theme.card} hb-reveal hb-card group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40 sm:p-8`}
                style={{ "--reveal-delay": `${index * 160}ms` }}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00D6A0]/5 blur-3xl transition-all duration-300 group-hover:bg-[#00D6A0]/10" />

                <div className="relative flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/5 p-3 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110">
                    <img
                      src={ecosystem.logo}
                      alt={`${ecosystem.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">{ecosystem.name}</h3>

                      <span className="rounded-full border border-[#00D6A0]/25 bg-[#00D6A0]/10 px-2.5 py-1 text-xs font-medium text-[#00D6A0]">
                        Ecosystem
                      </span>
                    </div>

                    <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>
                      {ecosystem.description}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#00D6A0]">
                      <FiGlobe />
                      <span>Part of Happy Bounty</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="hb-reveal text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              The process
            </span>

            <h2 className="hb-reveal hb-delay-1 mt-4 text-3xl font-bold sm:text-4xl">
              Four steps to getting rewarded
            </h2>

            <p className={`hb-reveal hb-delay-2 mt-4 leading-7 ${theme.muted}`}>
              A straightforward process that takes you from discovering a
              task to receiving your reward.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className={`${theme.card} hb-reveal hb-card group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40`}
                  style={{ "--reveal-delay": `${index * 120}ms` }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-xl text-[#00D6A0] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon />
                    </div>

                    <span className="text-3xl font-bold text-[#00D6A0]/30 transition-all duration-300 group-hover:text-[#00D6A0]/60">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold">{step.title}</h3>

                  <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>
                    {step.description}
                  </p>

                  {index < steps.length - 1 && (
                    <div className="mt-6 hidden items-center text-[#00D6A0]/60 lg:flex">
                      <span className="h-px flex-1 bg-[#00D6A0]/20" />
                      <FiChevronRight className="ml-2" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <span className="hb-reveal text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              See it in action
            </span>

            <h2 className="hb-reveal hb-delay-1 mt-4 text-3xl font-bold sm:text-4xl">
              Get to know Happy Bounty
            </h2>

            <p className={`hb-reveal hb-delay-2 mx-auto mt-4 max-w-2xl ${theme.muted}`}>
              See how contributors discover tasks, submit work, and earn
              rewards through the platform.
            </p>
          </div>

          <div className="hb-reveal hb-video overflow-hidden rounded-3xl border border-[#00D6A0]/20 bg-black shadow-2xl shadow-[#00D6A0]/5">
            <video
              className="aspect-video w-full object-cover"
              autoPlay
              loop
              muted
              controls
              playsInline
              preload="auto"
            >
              <source src={happyBountyVideo} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      </section>

      {/* BOTTOM INFORMATION SECTION */}
      <section className="px-5 pb-20 pt-14 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-5xl">
          <div
            className={`${theme.secondaryCard} hb-reveal hb-bottom-card relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12`}
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-[#00D6A0]/10 blur-[80px] hb-hero-glow" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/10 text-3xl text-[#00D6A0] transition-transform duration-500 hover:rotate-6 hover:scale-110">
              <FiUsers />
            </div>

            <h2 className="relative mt-6 text-2xl font-bold sm:text-4xl">
              Built for contributors and communities
            </h2>

            <p
              className={`relative mx-auto mt-4 max-w-2xl leading-7 ${theme.muted}`}
            >
              Happy Bounty brings task creators and contributors together,
              helping communities turn ideas into completed work through
              transparent bounty opportunities.
            </p>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/50">
                <FiCheck className="text-[#00D6A0]" />
                <span>Community-driven</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/50">
                <FiShield className="text-[#00D6A0]" />
                <span>Wallet-powered</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/50">
                <FiStar className="text-[#00D6A0]" />
                <span>Reward-focused</span>
              </div>
            </div>

            <div className="relative mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#00D6A0]">
              <FiBriefcase />
              <span>Discover. Contribute. Get rewarded.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATION STYLES */}
      <style>{`
        /* INITIAL REVEAL STATE */
        .hb-reveal {
          opacity: 0;
          filter: blur(9px);
          transform: translate3d(0, 32px, 0) scale(.985);
          transition:
            opacity 800ms cubic-bezier(.2,.8,.2,1),
            transform 850ms cubic-bezier(.2,.8,.2,1),
            filter 850ms cubic-bezier(.2,.8,.2,1);
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform, filter;
        }

        .hb-reveal.hb-visible {
          opacity: 1;
          filter: blur(0);
          transform: translate3d(0, 0, 0) scale(1);
        }

        /* CARD REVEALS */
        .hb-card {
          transition:
            opacity 800ms cubic-bezier(.2,.8,.2,1),
            transform 850ms cubic-bezier(.2,.8,.2,1),
            filter 850ms cubic-bezier(.2,.8,.2,1),
            border-color 300ms ease,
            box-shadow 350ms ease,
            background-color 300ms ease;
        }

        .hb-card.hb-visible:hover {
          box-shadow: 0 16px 45px rgba(0, 214, 160, .08);
        }

        /* HERO GLOW */
        .hb-hero-glow {
          animation: hbAmbientGlow 7s ease-in-out infinite;
        }

        @keyframes hbAmbientGlow {
          0%, 100% {
            opacity: .5;
            transform: translateX(-50%) scale(.9);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.12);
          }
        }

        /* HEADING ACCENT */
        .hb-heading-glow {
          text-shadow: 0 0 28px rgba(0, 214, 160, .12);
          animation: hbHeadingGlow 4s ease-in-out infinite;
        }

        @keyframes hbHeadingGlow {
          0%, 100% {
            text-shadow: 0 0 12px rgba(0, 214, 160, .08);
          }
          50% {
            text-shadow: 0 0 30px rgba(0, 214, 160, .28);
          }
        }

        /* ROTATING GLOBE */
        .hb-globe-stage {
          perspective: 1100px;
          isolation: isolate;
        }

        .hb-globe-image-wrap {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .hb-rotating-world {
          display: block;
          object-fit: contain;
          transform-style: preserve-3d;
          backface-visibility: visible;
          transform-origin: center;
          animation: hbWorldRotate 35s linear infinite;
          will-change: transform;
          filter:
            drop-shadow(0 0 18px rgba(0, 214, 160, .2))
            drop-shadow(0 0 38px rgba(0, 214, 160, .1));
        }

        @keyframes hbWorldRotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        /* GLOBE GLOW */
        .hb-globe-glow {
          animation: hbGlobePulse 5s ease-in-out infinite;
        }

        @keyframes hbGlobePulse {
          0%, 100% {
            opacity: .4;
            transform: scale(.9);
          }
          50% {
            opacity: .85;
            transform: scale(1.1);
          }
        }

        /* ORBIT RINGS */
        .hb-globe-orbit {
          animation: hbOrbitRotate 24s linear infinite;
        }

        .hb-globe-orbit-two {
          animation: hbOrbitRotateReverse 32s linear infinite;
        }

        .hb-globe-orbit-horizontal {
          animation: hbHorizontalOrbit 18s ease-in-out infinite alternate;
        }

        @keyframes hbOrbitRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes hbOrbitRotateReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes hbHorizontalOrbit {
          from {
            transform: translateY(-50%) rotateX(65deg) rotateZ(-12deg);
          }
          to {
            transform: translateY(-50%) rotateX(65deg) rotateZ(12deg);
          }
        }

        /* GLOBE DOTS */
        .hb-orbit-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #00D6A0;
          box-shadow:
            0 0 8px rgba(0, 214, 160, .9),
            0 0 18px rgba(0, 214, 160, .5);
          animation: hbDotPulse 2.5s ease-in-out infinite;
        }

        .hb-orbit-dot-two {
          animation-delay: .8s;
        }

        .hb-orbit-dot-three {
          animation-delay: 1.5s;
        }

        @keyframes hbDotPulse {
          0%, 100% {
            opacity: .5;
            transform: scale(.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
          }
        }

        /* FLOATING LABELS */
        .hb-globe-label {
          animation: hbGlobeFloat 5s ease-in-out infinite;
          box-shadow: 0 12px 35px rgba(0, 0, 0, .08);
        }

        .hb-globe-label-right {
          animation-delay: 1.5s;
        }

        @keyframes hbGlobeFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* VIDEO REVEAL */
        .hb-video {
          transition:
            opacity 900ms ease,
            transform 900ms cubic-bezier(.2,.8,.2,1),
            box-shadow 400ms ease;
        }

        .hb-video.hb-visible:hover {
          box-shadow: 0 25px 80px rgba(0, 214, 160, .10);
        }

        /* BOTTOM CARD */
        .hb-bottom-card {
          transition:
            opacity 850ms ease,
            transform 900ms cubic-bezier(.2,.8,.2,1),
            filter 850ms ease,
            border-color 350ms ease,
            box-shadow 350ms ease;
        }

        .hb-bottom-card.hb-visible:hover {
          border-color: rgba(0, 214, 160, .3);
          box-shadow: 0 20px 65px rgba(0, 214, 160, .055);
        }

        /* MOBILE */
        @media (max-width: 640px) {
          .hb-reveal {
            transform: translate3d(0, 22px, 0) scale(.99);
            filter: blur(6px);
          }

          .hb-reveal.hb-visible {
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }

          .hb-globe-label {
            padding: 7px 10px;
          }

          .hb-globe-label img {
            width: 20px;
            height: 20px;
          }

          .hb-orbit-dot {
            width: 7px;
            height: 7px;
          }
        }

        /* ACCESSIBILITY */
        @media (prefers-reduced-motion: reduce) {
          .hb-reveal,
          .hb-reveal.hb-visible,
          .hb-card,
          .hb-video,
          .hb-bottom-card,
          .hb-hero-glow,
          .hb-heading-glow,
          .hb-rotating-world,
          .hb-globe-glow,
          .hb-globe-orbit,
          .hb-globe-orbit-two,
          .hb-globe-orbit-horizontal,
          .hb-orbit-dot,
          .hb-globe-label {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
            will-change: auto !important;
          }
        }
      `}</style>
    </main>
  );
};

export default HowItWorks;
