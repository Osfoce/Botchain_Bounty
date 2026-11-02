import { useEffect, useState } from "react";
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
import happyBountyVideo from "../Video/happy-demo.mp4";

const HowItWorks = () => {
  const [isDark, setIsDark] = useState(true);

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
      {/* Hero Section */}
      <section className="relative px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00D6A0]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/10 px-4 py-2 text-sm font-medium text-[#00D6A0]">
              <FiZap />
              <span>How Happy Bounty Works</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Turn your skills into{" "}
              <span className="text-[#00D6A0]">rewards.</span>
            </h1>

            <p
              className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg ${theme.muted}`}
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
                    className={`${theme.card} group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-xl text-[#00D6A0] transition-transform duration-300 group-hover:scale-110">
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

      {/* Ecosystems Section */}
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              Supported ecosystems
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Built for growing communities
            </h2>

            <p className={`mx-auto mt-4 max-w-2xl ${theme.muted}`}>
              Discover opportunities and participate in the ecosystems
              supported by Happy Bounty.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ecosystems.map((ecosystem, index) => (
              <div
                key={ecosystem.name}
                className={`${theme.card} group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40 sm:p-8`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00D6A0]/5 blur-3xl transition-all duration-300 group-hover:bg-[#00D6A0]/10" />

                <div className="relative flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/5 p-3">
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

      {/* How It Works Section */}
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              The process
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Four steps to getting rewarded
            </h2>

            <p className={`mt-4 leading-7 ${theme.muted}`}>
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
                  className={`${theme.card} group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-xl text-[#00D6A0] transition-transform duration-300 group-hover:scale-110">
                      <Icon />
                    </div>

                    <span className="text-3xl font-bold text-[#00D6A0]/30">
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

      {/* Video Section */}
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00D6A0]">
              See it in action
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Get to know Happy Bounty
            </h2>

            <p className={`mx-auto mt-4 max-w-2xl ${theme.muted}`}>
              See how contributors discover tasks, submit work, and earn
              rewards through the platform.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#00D6A0]/20 bg-black shadow-2xl shadow-[#00D6A0]/5">
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

      {/* Bottom Information Section */}
      <section className="px-5 pb-20 pt-14 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-5xl">
          <div
            className={`${theme.secondaryCard} relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12`}
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-[#00D6A0]/10 blur-[80px]" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/10 text-3xl text-[#00D6A0]">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2.5 text-sm font-medium">
                <FiCheck className="text-[#00D6A0]" />
                <span>Community-driven</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2.5 text-sm font-medium">
                <FiShield className="text-[#00D6A0]" />
                <span>Wallet-powered</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/5 px-4 py-2.5 text-sm font-medium">
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
    </main>
  );
};

export default HowItWorks;