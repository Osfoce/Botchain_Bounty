
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiShield,
  FiLayers,
  FiTarget,
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowRight,
} from "react-icons/fi";

export default function WhitepaperPage() {
  return (
    <div className="theme-page min-h-screen overflow-x-hidden bg-[#F3F5F3] text-[#171714]">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,23,20,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,20,0.035) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00D6A0]/[0.07] blur-[130px]" />

        <div className="absolute top-1/2 -left-40 h-72 w-72 rounded-full bg-[#00D6A0]/[0.035] blur-[120px]" />

        <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-[#00D6A0]/[0.05] blur-[130px]" />
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 lg:px-10">
        {/* BACK BUTTON */}
        <div className="mb-10 flex w-full justify-start sm:mb-14">
          <Link
            to="/"
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-black/10
              bg-white/75
              px-3.5
              py-2
              text-sm
              font-medium
              text-black/60
              shadow-[0_4px_20px_rgba(0,0,0,0.04)]
              backdrop-blur-md
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-[#00D6A0]/50
              hover:bg-white
              hover:text-black
              active:scale-95
            "
          >
            <FiArrowLeft className="text-base text-[#007E62] transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back</span>
          </Link>
        </div>

        {/* HERO */}
        <section className="mb-14 text-center sm:mb-16">
          {/* LABEL */}
          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#00D6A0]/30
              bg-[#00D6A0]/[0.07]
              px-3
              py-1.5
            "
          >
            <FiBookOpen className="text-xs text-[#007E62]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#967414] sm:text-xs">
              Official Documentation
            </span>
          </div>

          {/* TITLE */}
          <h1
            className="
              mx-auto
              max-w-4xl
              text-4xl
              font-black
              leading-[1.05]
              tracking-tight
              text-[#171714]
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Happy Bounty
            <br />
            <span className="text-[#007E62]">Whitepaper</span>
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-6
              text-black/50
              sm:text-base
              sm:leading-7
              md:text-lg
            "
          >
            An overview of the Happy Bounty ecosystem, reward economy,
            governance model, security architecture, and long-term vision
            for a decentralized earning platform.
          </p>

          {/* META */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-medium text-black/45 shadow-sm sm:text-xs">
              Web3 Earning Economy
            </span>

            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-medium text-black/45 shadow-sm sm:text-xs">
              Decentralized
            </span>

            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-medium text-black/45 shadow-sm sm:text-xs">
              Community Driven
            </span>
          </div>
        </section>

        {/* INTRODUCTION CARD */}
        <section
          className="
            mb-12
            overflow-hidden
            rounded-2xl
            border
            border-[#00D6A0]/25
            bg-white
            p-5
            shadow-[0_10px_35px_rgba(0,0,0,0.045)]
            sm:rounded-3xl
            sm:p-7
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#00D6A0]/25
                bg-[#00D6A0]/[0.08]
                text-[#007E62]
              "
            >
              <FiBookOpen />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#171714] sm:text-xl">
                About this document
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                This document explains the principles behind Happy Bounty,
                including how users participate, how rewards are distributed,
                how the ecosystem operates, and the direction of future
                development.
              </p>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <div className="space-y-5 sm:space-y-6">
          {/* 1. INTRODUCTION */}
          <WhitepaperSection
            number="01"
            icon={<FiTarget />}
            title="Introduction"
          >
            <p>
              Happy Bounty is a Web3 task-based earning platform designed to
              connect users with decentralized opportunities. It allows anyone,
              regardless of background, to earn rewards by completing simple
              digital tasks.
            </p>
          </WhitepaperSection>

          {/* 2. HOW IT WORKS */}
          <WhitepaperSection
            number="02"
            icon={<FiLayers />}
            title="How It Works"
          >
            <p>
              Users participate by completing bounties such as social
              engagement, referrals, testing dApps, and on-chain interactions.
              Each task is verified using automated smart verification systems
              before rewards are distributed.
            </p>
          </WhitepaperSection>

          {/* 3. REWARDS */}
          <WhitepaperSection
            number="03"
            icon={<FiTrendingUp />}
            title="Rewards System"
          >
            <p>
              Rewards are distributed in native platform tokens. Task value
              depends on difficulty, time requirement, and engagement quality.
              Higher effort tasks yield higher rewards, ensuring fairness and
              motivation.
            </p>
          </WhitepaperSection>

          {/* 4. TOKEN UTILITY */}
          <WhitepaperSection
            number="04"
            icon={<FiCheckCircle />}
            title="Token Utility"
          >
            <p>
              The Happy Bounty token is used for rewards, governance voting,
              staking, and premium task access. Users can also use tokens to
              boost visibility for their own bounty listings.
            </p>
          </WhitepaperSection>

          {/* 5. SECURITY */}
          <WhitepaperSection
            number="05"
            icon={<FiShield />}
            title="Security & Verification"
          >
            <p>
              The platform uses fraud detection systems, wallet verification,
              and automated checks to ensure that all completed tasks are
              legitimate and fairly rewarded.
            </p>
          </WhitepaperSection>

          {/* 6. ECOSYSTEM */}
          <WhitepaperSection
            number="06"
            icon={<FiUsers />}
            title="Ecosystem"
          >
            <p>
              Happy Bounty connects users, advertisers, and developers in one
              ecosystem. Advertisers post tasks, users complete them, and
              developers build integrations that expand the platform’s
              functionality.
            </p>
          </WhitepaperSection>

          {/* 7. ROADMAP */}
          <WhitepaperSection
            number="07"
            icon={<FiTrendingUp />}
            title="Roadmap"
          >
            <div className="space-y-3">
              {[
                "Phase 1: Platform launch and basic bounty system",
                "Phase 2: Token integration and wallet support",
                "Phase 3: DAO governance and voting system",
                "Phase 4: Mobile app and global expansion",
                "Phase 5: Full decentralization",
              ].map((phase, index) => (
                <div
                  key={index}
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-black/[0.07]
                    bg-[#F3F5F3]
                    px-4
                    py-3
                    transition-all
                    duration-200
                    hover:border-[#00D6A0]/35
                    hover:bg-white
                  "
                >
                  <span
                    className="
                      mt-1
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#00D6A0]/10
                      text-[9px]
                      font-bold
                      text-[#007E62]
                    "
                  >
                    {index + 1}
                  </span>

                  <span className="text-sm leading-6 text-black/55">
                    {phase}
                  </span>
                </div>
              ))}
            </div>
          </WhitepaperSection>

          {/* 8. GOVERNANCE */}
          <WhitepaperSection
            number="08"
            icon={<FiUsers />}
            title="Governance"
          >
            <p>
              Token holders will have voting power on platform decisions such
              as task approval systems, reward adjustments, and future
              development proposals.
            </p>
          </WhitepaperSection>

          {/* 9. RISK */}
          <section
            className="
              rounded-2xl
              border
              border-amber-600/20
              bg-[#fffaf0]
              p-5
              shadow-[0_8px_30px_rgba(0,0,0,0.035)]
              sm:rounded-3xl
              sm:p-7
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-600/20
                  bg-amber-500/[0.08]
                  text-amber-700
                "
              >
                <FiAlertTriangle />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-amber-700/55">
                    09
                  </span>

                  <h2 className="text-lg font-bold text-[#171714] sm:text-xl">
                    Risk Disclaimer
                  </h2>
                </div>

                <p className="text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                  Participation in decentralized systems involves risks
                  including token volatility, smart contract bugs, and market
                  fluctuations. Users are encouraged to participate responsibly.
                </p>
              </div>
            </div>
          </section>

          {/* 10. FUTURE VISION */}
          <WhitepaperSection
            number="10"
            icon={<FiTarget />}
            title="Future Vision"
          >
            <p>
              Our goal is to build a global decentralized workforce where
              anyone can earn income by contributing value online without
              geographical limitations.
            </p>
          </WhitepaperSection>
        </div>

        {/* CTA */}
        <section
          className="
            relative
            mt-12
            overflow-hidden
            rounded-2xl
            border
            border-[#00D6A0]/25
            bg-[#171714]
            p-7
            text-center
            shadow-[0_15px_45px_rgba(0,0,0,0.10)]
            sm:mt-16
            sm:rounded-3xl
            sm:p-10
          "
        >
          {/* SUBTLE GOLD ACCENT */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00D6A0]/10 blur-3xl" />

          <div className="relative z-10">
            <div
              className="
                mx-auto
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-[#00D6A0]/25
                bg-[#00D6A0]/10
                text-[#00D6A0]
              "
            >
              <FiArrowRight className="text-lg" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to start earning?
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55 sm:text-base">
              Explore available bounties and begin your Web3 journey today.
            </p>

            <Link
              to="/dashboard"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#00D6A0]
                px-6
                py-3
                text-sm
                font-bold
                text-[#171714]
                shadow-[0_8px_25px_rgba(0, 214, 160,0.18)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#e0bd4d]
                hover:shadow-[0_12px_30px_rgba(0, 214, 160,0.25)]
                active:scale-[0.98]
              "
            >
              Explore Bounties
              <FiArrowRight />
            </Link>
          </div>
        </section>

        {/* FOOTER SPACE */}
        <div className="h-10 sm:h-14" />
      </main>
    </div>
  );
}

/* -------------------------------- */
/* REUSABLE WHITEPAPER SECTION */
/* -------------------------------- */

function WhitepaperSection({ number, icon, title, children }) {
  return (
    <section
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-black/[0.08]
        bg-white
        p-5
        shadow-[0_6px_25px_rgba(0,0,0,0.035)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-[#00D6A0]/30
        hover:shadow-[0_10px_30px_rgba(0,0,0,0.055)]
        sm:rounded-3xl
        sm:p-7
      "
    >
      <div className="flex items-start gap-4">
        {/* ICON */}
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-[#00D6A0]/20
            bg-[#00D6A0]/[0.07]
            text-[#007E62]
            transition-all
            duration-300
            group-hover:border-[#00D6A0]/40
            group-hover:bg-[#00D6A0]/10
          "
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          {/* TITLE */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#007E62]/55">
              {number}
            </span>

            <h2 className="text-lg font-bold text-[#171714] sm:text-xl">
              {title}
            </h2>
          </div>

          {/* CONTENT */}
          <div className="text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

