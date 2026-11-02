
import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiCode,
  FiCopy,
  FiDollarSign,
  FiExternalLink,
  FiFileText,
  FiGithub,
  FiLayers,
  FiMenu,
  FiSearch,
  FiShield,
  FiX,
  FiZap,
  FiGlobe,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "how-it-works", label: "How Happy Bounty Works" },
      { id: "getting-started", label: "Getting Started" },
    ],
  },
  {
    title: "Using Happy Bounty",
    items: [
      { id: "discover-bounties", label: "Discover Bounties" },
      { id: "create-bounty", label: "Create a Bounty" },
      { id: "submit-work", label: "Submit Your Work" },
      { id: "rewards", label: "Rewards" },
    ],
  },
  {
    title: "Technical",
    items: [
      { id: "ecosystems", label: "Supported Ecosystems" },
      { id: "bounty-types", label: "Bounty Types" },
      { id: "statuses", label: "Bounty Statuses" },
      { id: "fees", label: "Fees" },
      { id: "smart-contract", label: "Smart Contract" },
    ],
  },
  {
    title: "Resources",
    items: [
      { id: "faq", label: "FAQ" },
      { id: "developers", label: "For Developers" },
    ],
  },
];

const codeExample = `// Example bounty structure

{
  "title": "Build a landing page",
  "description": "Create a modern landing page",
  "reward": "500",
  "payoutType": "SINGLE",
  "maxWinners": 1,
  "network": "Arc or Botchain"
}`;

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#008A66] dark:text-[#00D6A0]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white md:text-4xl">
        {title}
      </h2>

      {children && (
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-black/60 dark:text-white/60">
          {children}
        </p>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="group rounded-2xl border border-black/[0.08] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/50 hover:shadow-[0_15px_50px_rgba(0,214,160,0.10)] dark:border-white/[0.08] dark:bg-[#111311]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#00D6A0]/30 bg-[#00D6A0]/10 text-[#008A66] dark:text-[#00D6A0]">
        <Icon size={19} />
      </div>

      <h3 className="font-semibold text-black dark:text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
        {children}
      </p>
    </div>
  );
}

function StepCard({ number, title, children }) {
  return (
    <div className="relative rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311]">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00D6A0] text-sm font-bold text-[#06251c]">
          {number}
        </div>

        <h3 className="font-semibold text-black dark:text-white">{title}</h3>
      </div>

      <p className="text-sm leading-6 text-black/60 dark:text-white/60">
        {children}
      </p>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={copyText}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
    >
      {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/[0.08] last:border-0 dark:border-white/[0.08]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="font-medium text-black dark:text-white">
          {question}
        </span>

        <FiChevronDown
          className={`shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          size={18}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl text-sm leading-7 text-black/60 dark:text-white/60">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function NetworkCard({ name, symbol, description, details, className = "" }) {
  return (
    <div className={`rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311] ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/10 text-sm font-bold text-[#008A66] dark:text-[#00D6A0]">
          {symbol}
        </div>

        <div>
          <h3 className="font-semibold text-black dark:text-white">{name}</h3>
          <p className="text-xs text-black/45 dark:text-white/45">
            {details}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-black/60 dark:text-white/60">
        {description}
      </p>
    </div>
  );
}

export default function Docs() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const sectionIds = sections.flatMap((section) =>
      section.items.map((item) => item.id)
    );

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      let currentSection = sectionIds[0];

      for (const id of sectionIds) {
        const element = document.getElementById(id);

        if (element && element.offsetTop <= scrollPosition) {
          currentSection = id;
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenu) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileMenu(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenu]);

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileMenu(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const sidebarContent = (
    <nav className="space-y-7">
      {filteredSections.map((section) => (
        <div key={section.title}>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/35">
            {section.title}
          </p>

          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-[#00D6A0]/10 font-medium text-[#008A66] dark:text-[#00D6A0]"
                      : "text-black/55 hover:bg-black/5 hover:text-black dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#00D6A0] transition-all duration-300 ${
                      isActive
                        ? "scale-y-100 opacity-100"
                        : "scale-y-0 opacity-0"
                    }`}
                  />

                  <span className={isActive ? "translate-x-1" : ""}>
                    {item.label}
                  </span>

                  <FiChevronRight
                    size={14}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "translate-x-0 opacity-100 text-[#00A87D] dark:text-[#00D6A0]"
                        : "-translate-x-1 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f5ef] text-black dark:bg-[#080908] dark:text-white">
      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-[#f6f5ef]/90 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#080908]/90">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenu(true)}
              aria-label="Open documentation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5 lg:hidden"
            >
              <FiMenu size={18} />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 font-bold tracking-tight"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D6A0] text-[#06251c]">
                <FiZap size={17} />
              </div>

              <span className="hidden sm:block">Happy Bounty</span>

              <span className="hidden rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#008A66] dark:text-[#00D6A0] sm:block">
                Docs
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-black/60 transition hover:text-[#008A66] dark:text-white/60 dark:hover:text-[#00D6A0]"
            >
              <FiArrowLeft size={15} />
              Back to Happy Bounty
            </Link>

            <div className="h-5 w-px bg-black/10 dark:bg-white/10" />

            <a
              href="https://github.com/Osfoce/Bounty_on_Arc_Network"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-black/60 transition hover:text-[#008A66] dark:text-white/60 dark:hover:text-[#00D6A0]"
            >
              <FiGithub size={16} />
              GitHub
              <FiExternalLink size={13} />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-black/[0.08] px-6 py-8 dark:border-white/[0.08] lg:block">
          <div className="mb-6">
            <div className="relative">
              <FiSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search docs..."
                className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/35 focus:border-[#00D6A0] dark:border-white/10 dark:bg-[#111311] dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {sidebarContent}
        </aside>

        {/* MOBILE SIDEBAR */}
        {mobileMenu && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              aria-label="Close menu"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenu(false)}
            />

            <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-[#f6f5ef] p-5 shadow-2xl dark:bg-[#0d0e0d]">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D6A0] text-[#06251c]">
                    <FiZap size={17} />
                  </div>
                  Documentation
                </div>

                <button
                  onClick={() => setMobileMenu(false)}
                  aria-label="Close documentation menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="relative mb-7">
                <FiSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search docs..."
                  className="h-10 w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#00D6A0] dark:border-white/10 dark:bg-[#111311]"
                />
              </div>

              {sidebarContent}
            </aside>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16 lg:px-14">

            {/* INTRODUCTION */}
            <section
              id="introduction"
              className="scroll-mt-28 transition-all duration-500"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/10 px-3 py-1.5 text-xs font-semibold text-[#008A66] dark:text-[#00D6A0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
                MULTI-ECOSYSTEM BOUNTY PLATFORM
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.04em] text-black dark:text-white md:text-6xl">
                Happy Bounty
                <span className="block text-[#008A66] dark:text-[#00D6A0]">
                  Documentation
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-black/60 dark:text-white/60 md:text-lg">
                A practical guide to discovering bounties, contributing your
                skills, creating tasks, and earning rewards across the Arc
                and Botchain ecosystems.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => scrollToSection("getting-started")}
                  className="flex items-center gap-2 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-semibold text-[#06251c] transition hover:-translate-y-0.5 hover:bg-[#00C495]"
                >
                  Get Started
                  <FiArrowUpRight size={16} />
                </button>

                <button
                  onClick={() => scrollToSection("ecosystems")}
                  className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:border-[#00D6A0] dark:border-white/10 dark:bg-[#111311]"
                >
                  Explore Ecosystems
                </button>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard icon={FiLayers} title="Discover Bounties">
                  Find tasks and challenges created by teams, builders, and
                  organizations.
                </InfoCard>

                <InfoCard icon={FiDollarSign} title="Real Rewards">
                  Complete accepted work and receive rewards according to
                  the selected bounty and network.
                </InfoCard>

                <InfoCard icon={FiGlobe} title="Multi-Ecosystem">
                  Participate in opportunities across Arc and Botchain.
                </InfoCard>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section
              id="how-it-works"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Overview" title="How Happy Bounty Works">
                Happy Bounty connects people who need work completed with
                contributors who have the skills to complete it.
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <StepCard number="01" title="Discover">
                  Browse available bounties and find tasks that match your
                  skills, interests, and experience.
                </StepCard>

                <StepCard number="02" title="Contribute">
                  Join a bounty and work on the requirements defined by
                  its creator.
                </StepCard>

                <StepCard number="03" title="Complete">
                  Finish the requested work and submit your result for review.
                </StepCard>

                <StepCard number="04" title="Earn Rewards">
                  When your submission is selected, receive the reward
                  according to the bounty's payout configuration.
                </StepCard>
              </div>
            </section>

            {/* GETTING STARTED */}
            <section
              id="getting-started"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Start Here" title="Getting Started">
                You can use Happy Bounty as either a bounty creator or a
                contributor.
              </SectionTitle>

              <div className="space-y-4">
                {[
                  [
                    "1. Connect your wallet",
                    "Connect a supported wallet to interact with Happy Bounty and access your account.",
                  ],
                  [
                    "2. Select your ecosystem",
                    "Choose a supported network, such as Arc or Botchain, depending on the bounty you want to participate in.",
                  ],
                  [
                    "3. Start creating or contributing",
                    "Explore opportunities, publish a bounty, or complete tasks to earn rewards.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311]"
                  >
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00D6A0]/15 text-[#008A66] dark:text-[#00D6A0]">
                        <FiCheck size={16} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-black dark:text-white">
                          {title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-black/60 dark:text-white/60">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DISCOVER BOUNTIES */}
            <section
              id="discover-bounties"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Contributors" title="Discover Bounties">
                Bounties represent individual tasks that need to be completed.
                Each bounty contains the information contributors need before
                deciding whether to participate.
              </SectionTitle>

              <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white dark:border-white/[0.08] dark:bg-[#111311]">
                <div className="grid border-b border-black/[0.08] bg-black/[0.025] px-5 py-4 text-xs font-bold uppercase tracking-wider text-black/40 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-white/40 md:grid-cols-2">
                  <span>Bounty information</span>
                  <span className="hidden md:block">What it means</span>
                </div>

                {[
                  ["Title", "The name of the task that needs to be completed."],
                  ["Description", "Requirements, expectations, and task details."],
                  ["Reward", "The amount allocated for successful work."],
                  ["Network", "The blockchain ecosystem associated with the bounty."],
                  ["Category", "The general area the bounty belongs to."],
                  ["Tags", "Labels that help contributors discover relevant work."],
                ].map(([name, description]) => (
                  <div
                    key={name}
                    className="grid gap-2 border-b border-black/[0.06] px-5 py-4 last:border-0 dark:border-white/[0.06] md:grid-cols-2"
                  >
                    <span className="text-sm font-medium text-black dark:text-white">
                      {name}
                    </span>

                    <span className="text-sm text-black/55 dark:text-white/55">
                      {description}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* CREATE BOUNTY */}
            <section
              id="create-bounty"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Creators" title="Create a Bounty">
                Bounty creators can define the work, reward amount, payout
                structure, and number of winners.
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard icon={FiDollarSign} title="Single Winner">
                  One contributor receives the bounty reward after their
                  work is selected.
                </InfoCard>

                <InfoCard icon={FiLayers} title="Equal Winners">
                  The reward can be distributed equally among multiple
                  selected contributors.
                </InfoCard>

                <InfoCard icon={FiZap} title="Percentage Winners">
                  The available reward can be distributed according to
                  configured percentages.
                </InfoCard>
              </div>

              <div className="mt-6 rounded-2xl border border-[#00D6A0]/30 bg-[#00D6A0]/10 p-6">
                <div className="flex gap-4">
                  <FiFileText
                    size={20}
                    className="mt-1 shrink-0 text-[#008A66] dark:text-[#00D6A0]"
                  />

                  <div>
                    <h3 className="font-semibold text-black dark:text-white">
                      Write clear requirements
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-black/65 dark:text-white/65">
                      Clear bounty descriptions help contributors understand
                      exactly what needs to be delivered and make the review
                      process easier.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SUBMIT WORK */}
            <section
              id="submit-work"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Contributors" title="Submit Your Work">
                After completing a bounty, contributors can submit their
                result for the bounty creator to review.
              </SectionTitle>

              <div className="space-y-3">
                {[
                  "Complete the requirements described by the bounty.",
                  "Prepare the requested deliverable or proof of work.",
                  "Submit your work through the bounty submission flow.",
                  "Wait for the bounty creator to review submissions.",
                  "If selected, receive the configured reward.",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-xl border border-black/[0.07] bg-white p-4 dark:border-white/[0.07] dark:bg-[#111311]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00D6A0]/15 text-xs font-bold text-[#008A66] dark:text-[#00D6A0]">
                      {index + 1}
                    </span>

                    <p className="pt-1 text-sm leading-6 text-black/65 dark:text-white/65">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* REWARDS */}
            <section
              id="rewards"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Payments" title="Rewards">
                Happy Bounty supports blockchain-based bounty rewards. The
                reward asset and payment details depend on the selected
                ecosystem and bounty configuration.
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <NetworkCard
                  name="Arc"
                  symbol="ARC"
                  details="USDC ecosystem"
                  description="On Arc, Happy Bounty uses USDC for bounty rewards and payment-related interactions."
                />

                <NetworkCard
                  name="Botchain"
                  symbol="BOT"
                  details="Botchain ecosystem"
                  description="Botchain provides another ecosystem for Happy Bounty opportunities. Check each bounty's displayed reward asset and network before participating."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-[#00D6A0]/30 bg-[#00D6A0]/10 p-6">
                <h3 className="font-semibold text-black dark:text-white">
                  Check the selected network before interacting
                </h3>

                <p className="mt-2 text-sm leading-7 text-black/65 dark:text-white/65">
                  Always confirm the network and reward asset displayed on
                  the bounty before funding, submitting, or claiming rewards.
                  The reward asset should not be assumed to be identical
                  across every ecosystem.
                </p>
              </div>
            </section>

            {/* ECOSYSTEMS */}
            <section
              id="ecosystems"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Infrastructure" title="Supported Ecosystems">
                Happy Bounty is expanding across multiple blockchain
                ecosystems, making it possible to create and participate
                in bounty opportunities across different networks.
              </SectionTitle>

              <div className="grid gap-5 md:grid-cols-2">
                <NetworkCard
                  name="Arc Network"
                  symbol="ARC"
                  details="Arc Mainnet"
                  description="Arc is an ecosystem where Happy Bounty supports USDC-focused bounty payments and blockchain-based settlement."
                />

                <NetworkCard
                  name="Botchain"
                  symbol="BOT"
                  details="Botchain Mainnet"
                  description="Botchain is another supported ecosystem for Happy Bounty, extending the platform to more builders and bounty opportunities."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311]">
                <div className="flex items-start gap-4">
                  <FiGlobe className="mt-1 shrink-0 text-[#008A66] dark:text-[#00D6A0]" size={22} />

                  <div>
                    <h3 className="font-semibold text-black dark:text-white">
                      One platform, multiple ecosystems
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-black/60 dark:text-white/60">
                      The goal is to make bounty creation, participation,
                      and rewards accessible across supported networks
                      without changing the core Happy Bounty experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* BOUNTY TYPES */}
            <section
              id="bounty-types"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Payouts" title="Bounty Types">
                Happy Bounty supports different payout structures depending
                on how a creator wants to reward contributors.
              </SectionTitle>

              <div className="space-y-4">
                {[
                  [
                    "SINGLE",
                    "One selected winner receives the reward.",
                    "1 Winner",
                  ],
                  [
                    "MULTI_EQUAL",
                    "The available reward is divided equally between selected winners.",
                    "Multiple",
                  ],
                  [
                    "MULTI_PERCENTAGE",
                    "Selected winners receive portions of the reward based on configured percentages.",
                    "Flexible",
                  ],
                ].map(([title, description, label]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311]"
                  >
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <h3 className="font-semibold text-black dark:text-white">
                          {title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
                          {description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#00D6A0]/10 px-3 py-1 text-xs font-bold text-[#008A66] dark:text-[#00D6A0]">
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* STATUSES */}
            <section
              id="statuses"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Lifecycle" title="Bounty Statuses">
                A bounty moves through different stages during its lifecycle.
              </SectionTitle>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Upcoming",
                    "The bounty has been created but is not active yet.",
                  ],
                  [
                    "Active",
                    "Contributors can participate and submit work.",
                  ],
                  [
                    "Completed",
                    "The bounty has finished and its outcome has been determined.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-black/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-[#111311]"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#00D6A0]" />

                      <h3 className="font-semibold text-black dark:text-white">
                        {title}
                      </h3>
                    </div>

                    <p className="text-sm leading-6 text-black/55 dark:text-white/55">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FEES */}
            <section
              id="fees"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Costs" title="Fees">
                Happy Bounty may collect a platform fee when a bounty is
                created or funded, according to the applicable contract
                configuration.
              </SectionTitle>

              <div className="rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311]">
                <div className="flex gap-4">
                  <FiDollarSign
                    className="mt-1 shrink-0 text-[#008A66] dark:text-[#00D6A0]"
                    size={21}
                  />

                  <div>
                    <h3 className="font-semibold text-black dark:text-white">
                      Platform fee
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-black/60 dark:text-white/60">
                      The platform fee is currently configured at 7% of the
                      payment made for a bounty. Always check the current
                      contract configuration and transaction details for
                      the applicable fee.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SMART CONTRACT */}
            <section
              id="smart-contract"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Blockchain" title="Smart Contract">
                Smart contracts handle blockchain-side bounty and reward
                operations. Contract addresses and configurations may differ
                between supported ecosystems.
              </SectionTitle>

              <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#0d0e0d] shadow-xl dark:border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FiCode size={15} className="text-[#00D6A0]" />

                    <span className="text-xs text-white/50">
                      bounty-example.json
                    </span>
                  </div>

                  <CopyButton text={codeExample} />
                </div>

                <pre className="overflow-x-auto p-5 text-xs leading-7 text-white/80">
                  <code>{codeExample}</code>
                </pre>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://github.com/Osfoce/bounty-arc-solidity-contract"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#00D6A0]/30 bg-[#00D6A0]/10 px-4 py-2.5 text-sm font-semibold text-[#008A66] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00D6A0] hover:bg-[#00D6A0]/15 dark:text-[#00D6A0]"
                >
                  <FiGithub size={16} />
                  <span>View Arc Source Code</span>
                  <FiExternalLink size={14} />
                </a>
              </div>

              <p className="mt-4 text-xs leading-6 text-black/45 dark:text-white/40">
                Always use the deployed contract address for the selected
                network. Do not assume that an address deployed on one
                ecosystem is also valid on another.
              </p>
            </section>

            {/* FAQ */}
            <section
              id="faq"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Questions" title="Frequently Asked Questions" />

              <div className="rounded-2xl border border-black/[0.08] bg-white px-6 dark:border-white/[0.08] dark:bg-[#111311]">
                <FAQItem
                  question="What is Happy Bounty?"
                  answer="Happy Bounty is a bounty platform where creators can publish tasks and contributors can complete those tasks in exchange for rewards."
                />

                <FAQItem
                  question="Which ecosystems does Happy Bounty support?"
                  answer="Happy Bounty supports the Arc and Botchain ecosystems. Check the platform for the currently available network options."
                />

                <FAQItem
                  question="Do I need a wallet?"
                  answer="A wallet is required to interact with the blockchain-powered parts of the platform, including wallet connection and on-chain payment actions."
                />

                <FAQItem
                  question="What can I earn?"
                  answer="You can earn the reward specified by each bounty. The reward asset and network are displayed in the bounty details."
                />

                <FAQItem
                  question="Can multiple people win a bounty?"
                  answer="Yes. Happy Bounty supports single-winner, equal multi-winner, and percentage-based multi-winner payout structures."
                />

                <FAQItem
                  question="Can I create my own bounty?"
                  answer="Yes. Bounty creators can define the task, requirements, reward, payout structure, and winner configuration."
                />

                <FAQItem
                  question="Does every network use the same reward asset?"
                  answer="Not necessarily. Reward assets depend on the selected ecosystem and bounty configuration. Always check the reward details before participating."
                />
              </div>
            </section>

            {/* DEVELOPERS */}
            <section
              id="developers"
              className="mt-28 scroll-mt-28 border-t border-black/[0.08] pt-20 dark:border-white/[0.08]"
            >
              <SectionTitle eyebrow="Builders" title="For Developers">
                Developers can integrate with the Happy Bounty ecosystem,
                explore the source code, or contribute to the project.
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <a
                  href="https://github.com/Osfoce/Bounty_on_Arc_Network"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-black/[0.08] bg-white p-6 transition hover:-translate-y-1 hover:border-[#00D6A0]/50 dark:border-white/[0.08] dark:bg-[#111311]"
                >
                  <FiGithub size={22} className="text-[#008A66] dark:text-[#00D6A0]" />

                  <h3 className="mt-5 font-semibold text-black dark:text-white">
                    GitHub
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
                    Explore the Happy Bounty source code, contribute changes,
                    and follow development.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#008A66] dark:text-[#00D6A0]">
                    View repository
                    <FiArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </a>

                <div className="rounded-2xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111311]">
                  <FiBookOpen size={22} className="text-[#008A66] dark:text-[#00D6A0]" />

                  <h3 className="mt-5 font-semibold text-black dark:text-white">
                    Documentation
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
                    Use this documentation to understand the platform,
                    supported ecosystems, and bounty lifecycle.
                  </p>
                </div>
              </div>
            </section>

            {/* FOOTER CTA */}
            <section className="mt-28 border-t border-black/[0.08] pt-16 dark:border-white/[0.08]">
              <div className="relative overflow-hidden rounded-3xl border border-[#00D6A0]/30 bg-[#080908] p-8 text-white md:p-12">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00D6A0]/15 blur-3xl" />

                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0] text-[#06251c]">
                    <FiZap size={19} />
                  </div>

                  <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
                    Ready to discover your next bounty?
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                    Explore Happy Bounty, find work that matches your skills,
                    and start contributing across the Arc and Botchain
                    ecosystems.
                  </p>

                  <Link
                    to="/"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-bold text-[#06251c] transition hover:bg-[#00C495]"
                  >
                    Explore Happy Bounty
                    <FiArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </section>

            <footer className="py-12 text-center text-xs text-black/40 dark:text-white/35">
              © {new Date().getFullYear()} Happy Bounty. Built for multiple ecosystems.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
