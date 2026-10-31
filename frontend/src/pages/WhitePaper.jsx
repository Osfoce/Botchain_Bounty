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
  FiGlobe,
  FiDollarSign,
  FiClipboard,
  FiCreditCard,
  FiAward,
  FiCode,
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

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 lg:px-10">
        {/* BACK BUTTON */}
        <div className="mb-10 flex w-full justify-start sm:mb-14">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/75 px-3.5 py-2 text-sm font-medium text-black/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00D6A0]/50 hover:bg-white hover:text-black active:scale-95"
          >
            <FiArrowLeft className="text-base text-[#007E62] transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back
          </Link>
        </div>

        {/* HERO */}
        <section className="mb-14 text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/[0.07] px-3 py-1.5">
            <FiBookOpen className="text-xs text-[#007E62]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#967414] sm:text-xs">
              Official Project Whitepaper
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-[#171714] sm:text-5xl md:text-6xl lg:text-7xl">
            Happy Bounty
            <br />
            <span className="text-[#007E62]">Whitepaper</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-black/50 sm:text-base sm:leading-7 md:text-lg">
            A detailed overview of the Happy Bounty platform, its mission,
            participation model, bounty lifecycle, reward distribution,
            platform economics, blockchain infrastructure, security
            considerations, and long-term development vision.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              "Web3 Earning Economy",
              "Open Participation",
              "Blockchain Rewards",
              "Multi-chain Vision",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-medium text-black/45 shadow-sm sm:text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* DOCUMENT OVERVIEW */}
        <section className="mb-12 overflow-hidden rounded-2xl border border-[#00D6A0]/25 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.045)] sm:rounded-3xl sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.08] text-[#007E62]">
              <FiBookOpen />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#171714] sm:text-xl">
                About this whitepaper
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                This whitepaper introduces Happy Bounty and explains the
                problem it aims to solve, how the platform works, and the
                opportunities it creates for people and businesses. It
                describes how bounty creators can publish tasks, how
                contributors can participate, how submissions are reviewed,
                and how approved work can result in blockchain-based rewards.
              </p>

              <p className="mt-3 text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                It also outlines the platform's current direction and future
                development plans. Features described as future developments
                should not be interpreted as features that are already
                available.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT SECTIONS */}
        <div className="space-y-5 sm:space-y-6">
          <WhitepaperSection number="01" icon={<FiTarget />} title="Introduction">
            <p>
              Happy Bounty is a Web3 task-based earning platform designed to
              connect people and organizations through digital tasks and
              reward-based opportunities. The platform gives individuals a
              way to contribute their time, skills, creativity, and knowledge
              in exchange for rewards.
            </p>

            <p>
              At the same time, businesses, startups, developers, and
              communities can use Happy Bounty to publish tasks and attract
              people who are interested in helping them achieve specific
              goals.
            </p>

            <p>
              Rather than relying only on traditional employment structures,
              Happy Bounty focuses on individual contributions. A person can
              discover an opportunity, understand its requirements, complete
              the requested work, submit evidence, and receive a reward when
              the work is approved.
            </p>

            <p>
              The broader vision is to make online earning opportunities more
              accessible, transparent, and connected to blockchain-based
              payments.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="02"
            icon={<FiAlertTriangle />}
            title="The Problem We Aim to Solve"
          >
            <p>
              Many people have useful skills and are willing to contribute to
              online projects, but finding legitimate opportunities to earn
              from those contributions can be difficult.
            </p>

            <p>
              At the same time, startups and online communities often need
              help with activities such as product testing, community
              engagement, feedback collection, promotion, research, and other
              digital work. Finding contributors and coordinating those
              activities can require significant time and effort.
            </p>

            <p>Some of the challenges include:</p>

            <BulletList
              items={[
                "Limited access to flexible online earning opportunities.",
                "Difficulty discovering projects that need specific contributions.",
                "Unclear task requirements and reward expectations.",
                "Time-consuming coordination between task creators and contributors.",
                "Payment processes that may be difficult to access across borders.",
                "Limited transparency around whether submitted work has been reviewed or rewarded.",
              ]}
            />

            <p>
              Happy Bounty aims to address these challenges through a
              centralized task-discovery experience combined with
              blockchain-based reward infrastructure.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="03"
            icon={<FiLayers />}
            title="The Happy Bounty Solution"
          >
            <p>
              Happy Bounty provides a platform where task creators and
              contributors can interact through clearly defined bounties.
              Each bounty describes a task, its requirements, its reward,
              and the conditions contributors must meet.
            </p>

            <p>
              Contributors can browse available opportunities and select
              tasks that match their interests or abilities. Once they have
              completed the requested work, they submit their results for
              review.
            </p>

            <p>
              The bounty creator can then evaluate the submission against
              the task requirements. When the submission is approved, the
              contributor can receive the associated reward according to
              the bounty's payment process.
            </p>

            <p>
              This model creates a shared environment in which creators can
              organize work and contributors can discover opportunities
              without needing a traditional employment relationship for
              every individual task.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="04"
            icon={<FiUsers />}
            title="Who Can Use Happy Bounty?"
          >
            <p>
              Happy Bounty is designed for different types of participants
              within the digital economy. The platform is not limited to
              professional developers or experienced blockchain users.
            </p>

            <div className="mt-4 space-y-3">
              <InfoCard
                icon={<FiGlobe />}
                title="Contributors"
                text="Individuals looking for online opportunities can discover bounties, complete tasks, submit their work, and earn rewards when their submissions are approved."
              />

              <InfoCard
                icon={<FiTarget />}
                title="Startups and Businesses"
                text="Organizations can publish tasks to attract contributors, collect feedback, promote products, test services, and coordinate specific digital activities."
              />

              <InfoCard
                icon={<FiCode />}
                title="Developers and Builders"
                text="Web3 developers and product builders can use bounties to invite community participation, gather testing feedback, and support ecosystem growth."
              />

              <InfoCard
                icon={<FiUsers />}
                title="Communities and Ecosystems"
                text="Blockchain communities and online projects can use task-based campaigns to encourage participation and reward useful contributions."
              />
            </div>
          </WhitepaperSection>

          <WhitepaperSection
            number="05"
            icon={<FiClipboard />}
            title="How the Platform Works"
          >
            <p>
              Happy Bounty follows a task-based workflow. Each stage helps
              participants understand what is expected and what happens
              after a task is completed.
            </p>

            <div className="mt-5 space-y-3">
              <WorkflowStep
                number="01"
                title="A bounty is created"
                text="A task creator connects to the platform and publishes a bounty with a description, instructions, reward amount, deadline, and any required submission details."
              />

              <WorkflowStep
                number="02"
                title="Contributors discover opportunities"
                text="Users browse the available bounties and review the task description, eligibility requirements, reward, and deadline before deciding whether to participate."
              />

              <WorkflowStep
                number="03"
                title="The task is completed"
                text="A contributor follows the instructions and completes the requested activity. Depending on the task, this may involve research, community participation, product testing, content creation, or another digital contribution."
              />

              <WorkflowStep
                number="04"
                title="Work is submitted"
                text="The contributor submits the required information or evidence through the platform. This may include a written explanation, project link, or supporting materials, depending on the bounty."
              />

              <WorkflowStep
                number="05"
                title="The submission is reviewed"
                text="The bounty creator reviews the submitted work and determines whether it satisfies the published requirements. A submission may be approved or rejected based on the task criteria."
              />

              <WorkflowStep
                number="06"
                title="The reward is received"
                text="After approval, the contributor can receive the bounty reward through the applicable blockchain payment process. The reward and network depend on the bounty."
              />
            </div>

            <div className="mt-5 rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.06] p-4">
              <p className="text-sm leading-6 text-[#007E62]">
                <strong>Important:</strong> Completing a task does not
                automatically guarantee payment. Contributors must satisfy
                the bounty requirements, submit the requested evidence, and
                receive approval according to the bounty's conditions.
              </p>
            </div>
          </WhitepaperSection>

          <WhitepaperSection
            number="06"
            icon={<FiAward />}
            title="Bounty Categories and Opportunities"
          >
            <p>
              The platform can support different types of digital tasks.
              The exact opportunities available depend on the bounties
              published by creators.
            </p>

            <BulletList
              items={[
                "Community engagement: participating in discussions, sharing useful feedback, and supporting community activities.",
                "Product testing: testing applications, identifying issues, and reporting user experiences.",
                "Content creation: producing articles, graphics, videos, tutorials, and other requested materials.",
                "Research and feedback: reviewing products, gathering information, and providing structured feedback.",
                "Development contributions: supporting software projects, testing features, and completing technical tasks.",
                "Marketing activities: helping projects reach new audiences through approved promotional tasks.",
                "Ecosystem participation: contributing to campaigns and activities organized by blockchain projects.",
              ]}
            />

            <p>
              Each bounty should communicate its expectations clearly so
              contributors can understand the work involved before
              participating.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="07"
            icon={<FiDollarSign />}
            title="Rewards and Payment System"
          >
            <p>
              Rewards are an important part of the Happy Bounty experience.
              They provide an incentive for contributors to complete useful
              work and help bounty creators attract participation.
            </p>

            <p>
              Each bounty creator specifies the reward associated with a
              task. The amount should reflect the nature of the work, its
              difficulty, the time involved, and the creator's budget.
            </p>

            <p>
              Happy Bounty's live Arc deployment supports USDC-based
              rewards. This allows supported bounties to use a
              blockchain-based digital dollar payment rather than relying
              only on traditional payment channels.
            </p>

            <p>
              Reward availability, payment requirements, and the supported
              network are determined by the specific bounty and the
              platform's available integrations.
            </p>

            <div className="mt-4 rounded-xl border border-black/[0.07] bg-[#F3F5F3] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#007E62]">
                  <FiCreditCard />
                </div>

                <div>
                  <h3 className="font-bold text-[#171714]">
                    Blockchain-based rewards
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Supported bounties can distribute rewards through
                    connected blockchain infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </WhitepaperSection>

          <WhitepaperSection
            number="08"
            icon={<FiDollarSign />}
            title="Platform Revenue Model"
          >
            <p>
              Happy Bounty uses a service-fee model to support the operation
              and continued development of the platform.
            </p>

            <p>
              The platform currently charges a 7% fee on the bounty payment
              made by the creator. This fee contributes to maintaining the
              platform, improving the user experience, supporting
              infrastructure, and developing additional features.
            </p>

            <div className="mt-4 rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#007E62]">
                Example fee calculation
              </span>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-black/[0.06] bg-white p-3">
                  <span className="text-xs text-black/45">
                    Bounty payment
                  </span>
                  <p className="mt-1 text-2xl font-black text-[#171714]">
                    100 USDC
                  </p>
                </div>

                <div className="rounded-lg border border-black/[0.06] bg-white p-3">
                  <span className="text-xs text-black/45">
                    Platform fee (7%)
                  </span>
                  <p className="mt-1 text-2xl font-black text-[#007E62]">
                    7 USDC
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-black/45">
                This is an illustrative calculation. The exact payment
                breakdown should be confirmed in the bounty creation and
                payment flow.
              </p>
            </div>

            <p>
              The long-term objective is to build a sustainable business
              model that supports platform operations while continuing to
              provide useful opportunities for contributors and task
              creators.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="09"
            icon={<FiLayers />}
            title="Blockchain Infrastructure and Multi-chain Direction"
          >
            <p>
              Blockchain technology is an important part of the Happy
              Bounty ecosystem. It provides the infrastructure for
              supported wallet interactions and reward payments.
            </p>

            <p>
              Happy Bounty's first live deployment is on Arc mainnet, where
              the platform supports USDC-based bounty rewards.
            </p>

            <p>
              The project is also expanding its multi-chain direction.
              Integration with Botchain is in progress, with the goal of
              making the platform accessible across additional blockchain
              ecosystems.
            </p>

            <div className="mt-4 space-y-3">
              <NetworkCard
                name="Arc Network"
                symbol="USDC"
                status="Live deployment"
                description="The first live Happy Bounty deployment, supporting USDC-based bounty rewards."
              />

              <NetworkCard
                name="Botchain"
                symbol="BOT"
                status="Integration in progress"
                description="An additional ecosystem integration intended to expand the platform's multi-chain reach."
              />
            </div>

            <p>
              Multi-chain development is intended to reduce dependence on
              a single blockchain ecosystem and create more opportunities
              for communities and users across supported networks.
            </p>

            <p>
              Network support, transaction fees, wallet compatibility, and
              available reward assets may differ depending on the
              integration.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="10"
            icon={<FiShield />}
            title="Security, Transparency and Verification"
          >
            <p>
              Trust is important in a reward-based platform. Contributors
              need to understand what they are expected to deliver, while
              bounty creators need a way to assess whether submitted work
              satisfies the task requirements.
            </p>

            <p>
              Happy Bounty uses a submission and review process to help
              creators evaluate completed tasks. Contributors are expected
              to provide accurate information and genuine evidence of
              their work.
            </p>

            <p>
              Users should also take care when interacting with blockchain
              applications and connecting wallets.
            </p>

            <BulletList
              items={[
                "Review bounty instructions carefully before participating.",
                "Only connect wallets to websites and applications you trust.",
                "Never share wallet recovery phrases or private keys.",
                "Check transaction details before signing blockchain transactions.",
                "Submit genuine work and accurate supporting information.",
                "Verify reward amounts, network details, and payment conditions.",
              ]}
            />

            <p>
              Blockchain transactions may be irreversible. Users should
              understand the risks associated with wallet interactions,
              network fees, and digital assets before participating.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="11"
            icon={<FiUsers />}
            title="Community and Ecosystem"
          >
            <p>
              Happy Bounty aims to create an environment where communities,
              projects, contributors, and builders can support one another.
              A healthy ecosystem depends on useful tasks, fair expectations,
              genuine contributions, and consistent participation.
            </p>

            <p>
              Projects can use the platform to organize campaigns and
              invite people to contribute. Contributors can discover
              projects, develop practical experience, and build a record
              of completed work.
            </p>

            <p>
              As the ecosystem grows, integrations with additional
              blockchain networks and communities can create more
              opportunities for collaboration.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="12"
            icon={<FiTrendingUp />}
            title="Development Roadmap"
          >
            <p>
              Happy Bounty's development is focused on improving the
              platform experience, expanding ecosystem support, and
              building a sustainable product.
            </p>

            <div className="mt-4 space-y-3">
              <RoadmapItem
                status="Foundation"
                title="Platform development"
                text="Establish the bounty creation, discovery, submission, review, and reward workflow."
              />

              <RoadmapItem
                status="Live deployment"
                title="Arc mainnet"
                text="Launch the first live deployment with support for USDC-based bounty rewards."
              />

              <RoadmapItem
                status="In progress"
                title="Botchain integration"
                text="Expand the platform's blockchain ecosystem support through Botchain integration."
              />

              <RoadmapItem
                status="Future development"
                title="Improved contributor experience"
                text="Explore better task discovery, contributor profiles, progress tracking, and clearer submission workflows."
              />

              <RoadmapItem
                status="Future development"
                title="Ecosystem expansion"
                text="Explore additional network integrations, partnerships, and community-driven campaigns."
              />

              <RoadmapItem
                status="Long-term vision"
                title="Governance and decentralization"
                text="Evaluate suitable community participation and governance models as the platform and ecosystem mature."
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-black/40">
              Roadmap items are development intentions, not guarantees of
              delivery dates or feature availability.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="13"
            icon={<FiUsers />}
            title="Governance and Future Participation"
          >
            <p>
              As Happy Bounty grows, community participation may become
              increasingly important in shaping the platform's direction.
              Contributors, creators, developers, and ecosystem partners
              can all provide valuable feedback.
            </p>

            <p>
              In the future, the project may explore structured ways for
              community members to participate in discussions and
              development priorities.
            </p>

            <p>
              Potential areas for community input could include platform
              improvements, new bounty categories, ecosystem partnerships,
              and contributor experience.
            </p>

            <p>
              Any formal governance system, voting mechanism, token-based
              rights, or staking functionality would require separate
              design and implementation. These should not be considered
              active platform features unless officially announced.
            </p>
          </WhitepaperSection>

          <WhitepaperSection
            number="14"
            icon={<FiGlobe />}
            title="Our Long-term Vision"
          >
            <p>
              Our vision is to make earning through online contributions
              more accessible to people around the world.
            </p>

            <p>
              We believe that useful work can come from anywhere. A person
              should be able to contribute to a project, demonstrate the
              value of their work, and receive a reward without being
              restricted by traditional geographical boundaries.
            </p>

            <p>
              Happy Bounty aims to become a platform where digital
              opportunities are easier to discover, tasks are easier to
              organize, and rewards can be distributed through accessible
              blockchain infrastructure.
            </p>

            <p>
              Our long-term focus is to build a reliable and sustainable
              platform that creates value for both the people who publish
              opportunities and the people who complete them.
            </p>
          </WhitepaperSection>

          {/* RISK DISCLAIMER */}
          <section className="rounded-2xl border border-amber-600/20 bg-[#fffaf0] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.035)] sm:rounded-3xl sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-600/20 bg-amber-500/[0.08] text-amber-700">
                <FiAlertTriangle />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-amber-700/55">
                    15
                  </span>

                  <h2 className="text-lg font-bold text-[#171714] sm:text-xl">
                    Risk Disclaimer
                  </h2>
                </div>

                <p className="text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                  Participation in Web3 platforms and blockchain-based
                  activities involves risks. These may include digital
                  asset price fluctuations, network congestion, transaction
                  fees, wallet security risks, smart contract vulnerabilities,
                  and changes in blockchain infrastructure.
                </p>

                <p className="mt-3 text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                  Rewards are subject to the conditions of individual
                  bounties and the applicable approval and payment process.
                  Completing a task does not guarantee approval or payment.
                  Users should review all task requirements and understand
                  the risks before participating.
                </p>

                <p className="mt-3 text-sm leading-6 text-black/50 sm:text-[15px] sm:leading-7">
                  This whitepaper is provided for informational purposes.
                  It is not financial, investment, or legal advice. It does
                  not guarantee future platform features, earnings, token
                  value, or project performance.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* FINAL CTA */}
        <section className="relative mt-12 overflow-hidden rounded-2xl border border-[#00D6A0]/25 bg-[#171714] p-7 text-center shadow-[0_15px_45px_rgba(0,0,0,0.10)] sm:mt-16 sm:rounded-3xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00D6A0]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/10 text-[#00D6A0]">
              <FiArrowRight className="text-lg" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your next opportunity starts here.
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55 sm:text-base">
              Discover available bounties, contribute your skills, and
              explore opportunities to earn through your work.
            </p>

            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-6 py-3 text-sm font-bold text-[#171714] shadow-[0_8px_25px_rgba(0,214,160,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#00e6ad] hover:shadow-[0_12px_30px_rgba(0,214,160,0.25)] active:scale-[0.98]"
            >
              Explore Bounties
              <FiArrowRight />
            </Link>
          </div>
        </section>

        <div className="h-10 sm:h-14" />
      </main>
    </div>
  );
}

/* -------------------------------- */
/* REUSABLE COMPONENTS */
/* -------------------------------- */

function WhitepaperSection({ number, icon, title, children }) {
  return (
    <section className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_6px_25px_rgba(0,0,0,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00D6A0]/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.055)] sm:rounded-3xl sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#007E62] transition-all duration-300 group-hover:border-[#00D6A0]/40 group-hover:bg-[#00D6A0]/10">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#007E62]/55">
              {number}
            </span>

            <h2 className="text-lg font-bold text-[#171714] sm:text-xl">
              {title}
            </h2>
          </div>

          <div className="space-y-3 text-sm leading-6 text-black/55 sm:text-[15px] sm:leading-7">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <FiCheckCircle className="mt-1 shrink-0 text-sm text-[#007E62]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-black/[0.07] bg-[#F3F5F3] p-4 transition-all hover:border-[#00D6A0]/30 hover:bg-white">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00D6A0]/10 text-[#007E62]">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-[#171714]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-black/50">{text}</p>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, text }) {
  return (
    <div className="flex gap-3 rounded-xl border border-black/[0.07] bg-[#F3F5F3] p-4 transition-all hover:border-[#00D6A0]/30 hover:bg-white">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00D6A0]/10 text-[10px] font-black text-[#007E62]">
        {number}
      </div>

      <div>
        <h3 className="font-bold text-[#171714]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-black/50">{text}</p>
      </div>
    </div>
  );
}

function NetworkCard({ name, symbol, status, description }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-[#F3F5F3] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-white text-[#007E62]">
            <FiLayers />
          </div>

          <div>
            <h3 className="font-bold text-[#171714]">{name}</h3>
            <p className="text-xs text-black/40">{symbol}</p>
          </div>
        </div>

        <span className="rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/10 px-3 py-1 text-[10px] font-bold text-[#007E62]">
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-black/50">{description}</p>
    </div>
  );
}

function RoadmapItem({ status, title, text }) {
  return (
    <div className="relative rounded-xl border border-black/[0.07] bg-[#F3F5F3] p-4 transition-all hover:border-[#00D6A0]/30 hover:bg-white">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-[#171714]">{title}</h3>

        <span className="rounded-full bg-[#00D6A0]/10 px-2.5 py-1 text-[10px] font-bold text-[#007E62]">
          {status}
        </span>
      </div>

      <p className="text-sm leading-6 text-black/50">{text}</p>
    </div>
  );
}