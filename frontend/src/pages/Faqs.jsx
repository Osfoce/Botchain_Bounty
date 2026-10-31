
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiChevronDown,
  FiSearch,
  FiMessageCircle,
  FiHelpCircle,
  FiX,
  FiBookOpen,
  FiShield,
  FiCreditCard,
} from "react-icons/fi";

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const faqs = [
    {
      question: "How do I earn on Happy Bounty?",
      answer:
        "Users earn rewards by completing campaigns, referrals, social tasks, and community activities. Browse available opportunities, follow each task's instructions, and submit your work for review. Once approved, you can receive the associated reward.",
      category: "Getting Started",
    },
    {
      question: "How long do withdrawals take?",
      answer:
        "Withdrawal processing times can depend on the reward network and any required verification. Check your account and transaction status for the latest information. If a withdrawal is taking longer than expected, contact our support team.",
      category: "Payments & Rewards",
    },
    {
      question: "Can I create multiple accounts?",
      answer:
        "No. Multiple accounts may lead to account suspension. We encourage every user to maintain one account and use it responsibly.",
      category: "Account & Security",
    },
    {
      question: "Why was my submission rejected?",
      answer:
        "Your submission may be rejected if task instructions were not followed correctly, required evidence is missing, or the submitted work does not meet the campaign requirements. Review the task instructions carefully before submitting again.",
      category: "Campaigns",
    },
    {
      question: "How do I participate in a bounty?",
      answer:
        "Explore the available bounties, open the opportunity that interests you, and carefully read its requirements. Complete the requested work and submit your entry using the submission instructions provided on the bounty page.",
      category: "Getting Started",
    },
    {
      question: "Which blockchain networks does Happy Bounty support?",
      answer:
        "Happy Bounty is expanding as a multi-chain bounty platform. Arc is our first live deployment, and Botchain is being integrated. Network availability can vary as integrations progress, so check the platform for currently available networks.",
      category: "Networks & Payments",
    },
    {
      question: "How do I receive my bounty reward?",
      answer:
        "After your submission has been reviewed and approved, the bounty reward can be distributed according to the campaign's reward details and supported blockchain network. Always verify the selected network before interacting with your wallet.",
      category: "Payments & Rewards",
    },
    {
      question: "Can I create my own bounty?",
      answer:
        "Yes. Happy Bounty allows users and project teams to create opportunities for contributors. You can publish a bounty, provide its requirements, set a reward, and review submissions from participants.",
      category: "Campaigns",
    },
  ];

  const categories = [
    { name: "All", icon: FiBookOpen },
    { name: "Getting Started", icon: FiHelpCircle },
    { name: "Campaigns", icon: FiBookOpen },
    { name: "Payments & Rewards", icon: FiCreditCard },
    { name: "Networks & Payments", icon: FiCreditCard },
    { name: "Account & Security", icon: FiShield },
  ];

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="theme-page relative min-h-screen overflow-hidden bg-[#F5F7F5] text-[#171714]">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,23,20,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,20,0.035) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute -top-48 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#00D6A0]/[0.10] blur-[150px]" />
        <div className="absolute right-[-140px] top-[45%] h-[360px] w-[360px] rounded-full bg-[#00D6A0]/[0.06] blur-[140px]" />
        <div className="absolute bottom-[-180px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[#00A87D]/[0.05] blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        {/* TOP NAVIGATION */}
        <div className="mb-12 flex items-center justify-between sm:mb-16">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white/80 px-4 py-2.5 text-sm font-semibold text-black/60 shadow-sm backdrop-blur-xl transition hover:border-[#00D6A0]/50 hover:text-[#008A66]"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#00D6A0]" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
              Happy Bounty Support
            </span>
          </div>
        </div>

        {/* HERO */}
        <section className="mx-auto mb-12 max-w-4xl text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/25 bg-[#00D6A0]/[0.07] px-4 py-2">
            <FiHelpCircle className="text-sm text-[#008A66]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007E62] sm:text-xs">
              Help & Support Center
            </span>
          </div>

          <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.045em] text-[#171714] sm:text-5xl md:text-6xl lg:text-7xl">
            How can we{" "}
            <span className="relative inline-block text-[#00A87D]">
              help you?
              <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[#00D6A0]/40" />
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-black/50 sm:text-base sm:leading-8">
            Everything you need to know about earning rewards, participating in
            bounties, managing your account, and exploring the Happy Bounty
            ecosystem.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-9 max-w-2xl">
            <div className="group flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-4 shadow-[0_15px_50px_rgba(0,0,0,0.055)] transition duration-300 focus-within:border-[#00D6A0]/60 focus-within:shadow-[0_15px_50px_rgba(0,214,160,0.10)] sm:px-5">
              <FiSearch className="shrink-0 text-xl text-black/30 transition-colors group-focus-within:text-[#00A87D]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for answers..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171714] outline-none placeholder:font-normal placeholder:text-black/30 sm:text-base"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-black/40 transition hover:bg-[#00D6A0]/10 hover:text-[#008A66]"
                >
                  <FiX />
                </button>
              )}

              <span className="hidden rounded-lg border border-black/[0.07] bg-[#F7F8F7] px-2.5 py-1 text-[10px] font-semibold text-black/30 sm:block">
                SEARCH
              </span>
            </div>

            <p className="mt-3 text-xs text-black/35">
              Search topics like rewards, campaigns, networks, and account
              security.
            </p>
          </div>
        </section>

        {/* CONTENT AREA */}
        <section className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#008A66]">
                Knowledge Base
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#171714] sm:text-3xl">
                Frequently asked questions
              </h2>
            </div>

            <p className="text-xs font-medium text-black/40">
              {filteredFaqs.length}{" "}
              {filteredFaqs.length === 1 ? "question" : "questions"} found
            </p>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setActiveCategory(category.name)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-[#00A87D] bg-[#00A87D] text-white shadow-[0_6px_18px_rgba(0,168,125,0.18)]"
                      : "border-black/[0.08] bg-white text-black/50 hover:border-[#00D6A0]/40 hover:text-[#008A66]"
                  }`}
                >
                  <Icon className="text-sm" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ LIST */}
          <div className="grid gap-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_5px_24px_rgba(0,0,0,0.025)] transition-all duration-300 hover:border-[#00D6A0]/35 hover:shadow-[0_10px_35px_rgba(0,0,0,0.05)] open:border-[#00D6A0]/45 open:shadow-[0_12px_35px_rgba(0,168,125,0.07)]"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-5 sm:px-6 sm:py-6">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F6F3] text-xs font-bold text-[#008A66] transition-colors group-open:bg-[#00D6A0]/15">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#00A87D]">
                        {faq.category}
                      </span>
                      <h3 className="mt-1 text-sm font-bold leading-6 text-[#252520] transition-colors group-hover:text-[#008A66] sm:text-base">
                        {faq.question}
                      </h3>
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-[#F8F9F8] text-black/40 transition-all duration-300 group-hover:border-[#00D6A0]/40 group-hover:text-[#008A66] group-open:rotate-180 group-open:border-[#00D6A0]/40 group-open:bg-[#00D6A0]/10 group-open:text-[#008A66]">
                      <FiChevronDown className="text-base" />
                    </span>
                  </summary>

                  <div className="ml-[4.25rem] mr-4 border-t border-black/[0.06] pb-5 pt-4 sm:mr-6 sm:pb-6">
                    <p className="max-w-3xl text-sm leading-7 text-black/55">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 px-5 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00D6A0]/10 text-[#008A66]">
                  <FiSearch className="text-xl" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#171714]">
                  No matching questions
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
                  We couldn't find an answer matching your search. Try another
                  keyword or contact our support team.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                  className="mt-5 rounded-xl bg-[#00A87D] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#008A66]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SUPPORT CTA */}
        <section className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="relative overflow-hidden rounded-[28px] bg-[#111A16] px-6 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.10)] sm:px-10 sm:py-14">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/[0.06]" />
            <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[#00D6A0]/10 blur-[90px]" />

            <div className="relative z-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/10 text-[#00D6A0]">
                <FiMessageCircle className="text-2xl" />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#00D6A0]">
                We're here to help
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                Still need a hand?
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/50 sm:text-base">
                Can't find what you're looking for? Get in touch with our
                support team and we'll help point you in the right direction.
              </p>

              <Link
                to="/contact"
                className="group mt-7 inline-flex items-center justify-center gap-3 rounded-xl bg-[#00D6A0] px-6 py-3.5 text-sm font-bold text-[#07130F] shadow-[0_8px_30px_rgba(0,214,160,0.16)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#35E6B7] hover:shadow-[0_12px_35px_rgba(0,214,160,0.25)] active:scale-[0.98]"
              >
                Contact Support
                <FiArrowUpRight className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER NOTE */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-black/[0.07] pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-black/35">
            © {new Date().getFullYear()} Happy Bounty. All rights reserved.
          </p>

          <Link
            to="/"
            className="text-xs font-semibold text-black/40 transition hover:text-[#008A66]"
          >
            Back to Happy Bounty
          </Link>
        </div>
      </main>
    </div>
  );
}
