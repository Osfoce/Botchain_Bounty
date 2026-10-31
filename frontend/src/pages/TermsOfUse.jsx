
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiShield,
  FiLock,
  FiGlobe,
  FiDatabase,
  FiFileText,
  FiExternalLink,
  FiMenu,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiLayers,
  FiCode,
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiMessageCircle,
} from "react-icons/fi";

const sections = [
  { id: "introduction", title: "Introduction", icon: FiFileText },
  { id: "eligibility", title: "Eligibility", icon: FiUsers },
  { id: "accounts", title: "Accounts and Wallets", icon: FiCreditCard },
  { id: "services", title: "Platform Services", icon: FiLayers },
  { id: "bounties", title: "Bounties and Challenges", icon: FiCheckCircle },
  { id: "submissions", title: "Submissions and Approval", icon: FiCode },
  { id: "payments", title: "Payments and Platform Fees", icon: FiDollarSign },
  { id: "rewards", title: "Rewards and Payouts", icon: FiCreditCard },
  { id: "refunds", title: "Refund Policy", icon: FiRefreshCw },
  { id: "blockchain", title: "Blockchain and Digital Assets", icon: FiGlobe },
  { id: "conduct", title: "User Conduct", icon: FiShield },
  { id: "intellectual", title: "Intellectual Property", icon: FiCode },
  { id: "ai", title: "Artificial Intelligence", icon: FiDatabase },
  { id: "privacy", title: "Privacy and Data", icon: FiLock },
  { id: "thirdparty", title: "Third-Party Services", icon: FiExternalLink },
  { id: "termination", title: "Termination", icon: FiAlertCircle },
  { id: "disclaimers", title: "Disclaimers", icon: FiShield },
  { id: "liability", title: "Limitation of Liability", icon: FiShield },
  { id: "indemnification", title: "Indemnification", icon: FiShield },
  { id: "modifications", title: "Changes to These Terms", icon: FiRefreshCw },
  { id: "governing", title: "Governing Law and Disputes", icon: FiShield },
  { id: "contact", title: "Contact Us", icon: FiFileText },
];

function TermsOfUse() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        let current = "introduction";

        sections.forEach((section) => {
          const element = document.getElementById(section.id);

          if (element && element.getBoundingClientRect().top <= 150) {
            current = section.id;
          }
        });

        setActiveSection(current);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setActiveSection(id);
    setMobileMenuOpen(false);
    setSearch("");
  };

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  const SectionHeading = ({ children }) => (
    <h2 className="mb-5 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
      {children}
    </h2>
  );

  const SubHeading = ({ children }) => (
    <h3 className="mb-3 mt-7 text-base font-semibold text-gray-900 dark:text-white">
      {children}
    </h3>
  );

  const Paragraph = ({ children }) => (
    <p className="mb-4 text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-[15px]">
      {children}
    </p>
  );

  const BulletList = ({ items }) => (
    <ul className="mb-6 ml-1 space-y-3">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-3 text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-[15px]"
        >
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D6A0]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  const Section = ({ id, title, children }) => (
    <section
      id={id}
      className="mb-10 scroll-mt-28 border-b border-gray-200 pb-10 last:border-0 dark:border-white/[0.07]"
    >
      <SectionHeading>{title}</SectionHeading>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-gray-900 transition-colors duration-300 dark:bg-[#080908] dark:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#080908]/90">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/10">
              <FiShield className="text-xl text-[#00D6A0]" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Happy Bounty
              </h1>
              <p className="text-[10px] uppercase tracking-[2px] text-gray-500">
                Legal Center
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#00D6A0] sm:flex"
            >
              <FiArrowLeft />
              Back to Home
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-terms-navigation"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-white/[0.07]">
        <div className="pointer-events-none absolute -right-20 -top-40 h-[450px] w-[450px] rounded-full bg-[#00D6A0]/[0.07] blur-[120px]" />

        <div className="relative mx-auto max-w-[1500px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
              <span className="text-xs font-semibold tracking-wide text-[#00A87D] dark:text-[#00D6A0]">
                HAPPY BOUNTY LEGAL
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Terms of{" "}
              <span className="text-[#00B889]">Use Agreement.</span>
            </h1>

            <p className="max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 sm:text-lg">
              These terms explain your rights, responsibilities, and the
              rules that apply when using Happy Bounty. Please read them
              carefully before creating bounties, submitting work, or
              participating in opportunities on our platform.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiFileText className="text-[#00D6A0]" />
                Last updated: October 31, 2026
              </div>

              <span className="h-1 w-1 rounded-full bg-gray-400" />

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiGlobe className="text-[#00D6A0]" />
                Happy Bounty Platform
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[72px] z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            id="mobile-terms-navigation"
            className="max-h-[75vh] overflow-y-auto border-b border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#101310]"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search terms..."
              aria-label="Search terms sections"
              className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:border-[#00D6A0] dark:border-white/10 dark:bg-white/[0.04]"
            />

            <nav className="space-y-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                      activeSection === section.id
                        ? "bg-[#00D6A0]/10 text-[#00A87D] dark:text-[#00D6A0]"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon />
                    {section.title}
                  </button>
                );
              })}

              {filteredSections.length === 0 && (
                <p className="px-3 py-4 text-sm text-gray-500">
                  No sections found.
                </p>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-20">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                On this page
              </p>

              <div className="relative mb-5">
                <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Find a section..."
                  aria-label="Find a terms section"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none transition-colors focus:border-[#00D6A0] dark:border-white/10 dark:bg-white/[0.03]"
                />
              </div>

              <nav className="custom-scrollbar max-h-[calc(100vh-230px)] space-y-1 overflow-y-auto pr-2">
                {filteredSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <button
                      type="button"
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-[#00D6A0]/10 font-semibold text-[#009B73] dark:text-[#00D6A0]"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.04] dark:hover:text-white"
                      }`}
                    >
                      <Icon className="shrink-0 text-sm" />
                      <span>{section.title}</span>

                      {activeSection === section.id && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
                      )}
                    </button>
                  );
                })}

                {filteredSections.length === 0 && (
                  <p className="px-3 py-4 text-xs text-gray-500">
                    No sections found.
                  </p>
                )}
              </nav>

              <div className="mt-8 rounded-2xl border border-[#00D6A0]/15 bg-[#00D6A0]/[0.06] p-4">
                <FiShield className="mb-3 text-xl text-[#00B889]" />

                <p className="mb-1 text-sm font-semibold">
                  Your trust matters.
                </p>

                <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                  We aim to make online opportunities transparent,
                  accessible, and rewarding.
                </p>
              </div>
            </div>
          </aside>

          {/* Terms content */}
          <div className="min-w-0 max-w-4xl">
            <div className="mb-12 rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.05] p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10">
                  <FiAlertCircle className="text-lg text-[#00B889]" />
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Important information
                  </h3>

                  <p className="text-xs leading-6 text-gray-600 dark:text-gray-400 sm:text-sm">
                    By accessing or using Happy Bounty, you agree to these
                    Terms of Use. If you do not agree, please do not use
                    the platform. These terms apply to bounty creators,
                    contributors, visitors, and all other platform users.
                  </p>
                </div>
              </div>
            </div>

            <Section id="introduction" title="1. Introduction">
              <Paragraph>
                This Terms of Use Agreement ("Agreement" or "Terms") is a
                legally binding agreement between you ("User", "you", or
                "your") and Happy Bounty ("Company", "we", "us", or "our"),
                governing your access to and use of the Happy Bounty platform,
                website, applications, and related services (collectively,
                the "Platform").
              </Paragraph>

              <Paragraph>
                Happy Bounty is a platform designed to connect individuals,
                developers, creators, organizations, and businesses through
                digital tasks, challenges, and bounty opportunities. Users
                can create opportunities with rewards, while contributors
                can discover tasks, submit their work, and earn rewards
                when their submissions are approved under the applicable
                bounty rules.
              </Paragraph>

              <Paragraph>
                The Platform may operate across supported blockchain
                networks, including Arc Network and Botchain, and may
                support USDC or other supported digital assets as reward
                methods.
              </Paragraph>

              <Paragraph>
                By registering, connecting a wallet, creating a bounty,
                submitting work, or otherwise accessing the Platform,
                you acknowledge that you have read, understood, and
                agreed to these Terms and our applicable policies.
              </Paragraph>
            </Section>

            <Section id="eligibility" title="2. Eligibility">
              <Paragraph>
                You may use Happy Bounty only if you have the legal capacity
                to enter into a binding agreement and your use of the
                Platform is permitted under applicable laws.
              </Paragraph>

              <BulletList
                items={[
                  "You must be at least 18 years old, or the age of legal majority in your jurisdiction, whichever is higher, unless applicable law permits otherwise with valid parental or guardian consent.",
                  "You must not be located in, or ordinarily resident in, a jurisdiction where access to the Platform is prohibited by applicable law.",
                  "You must not be subject to applicable sanctions, restrictions, or prohibitions that prevent you from using the Platform.",
                  "You must comply with all laws and regulations applicable to your use of the Platform.",
                  "You must provide truthful information when registering or interacting with the Platform.",
                ]}
              />

              <Paragraph>
                We reserve the right to restrict access where we reasonably
                believe a user does not satisfy these requirements.
              </Paragraph>
            </Section>

            <Section id="accounts" title="3. Accounts and Wallets">
              <Paragraph>
                Certain features of Happy Bounty may require you to create
                an account, connect a supported cryptocurrency wallet,
                or both.
              </Paragraph>

              <SubHeading>Account responsibilities</SubHeading>

              <BulletList
                items={[
                  "You are responsible for maintaining accurate account information.",
                  "You must protect your login credentials and account access.",
                  "You are responsible for activity conducted through your account.",
                  "You must promptly notify us if you suspect unauthorized access.",
                  "You must not impersonate another person or create accounts using false information.",
                ]}
              />

              <SubHeading>Wallet responsibilities</SubHeading>

              <Paragraph>
                When connecting a cryptocurrency wallet, you acknowledge
                that Happy Bounty does not control your private keys,
                recovery phrases, or wallet credentials.
              </Paragraph>

              <Paragraph>
                You are solely responsible for securing your wallet and
                verifying transactions before approving them. Happy Bounty
                will never require you to disclose your private key or
                recovery phrase.
              </Paragraph>

              <Paragraph>
                We are not responsible for losses resulting from compromised
                wallets, stolen credentials, unauthorized wallet access,
                or transactions approved by you.
              </Paragraph>
            </Section>

            <Section id="services" title="4. Platform Services">
              <Paragraph>
                Happy Bounty provides tools and services that enable users
                to discover, create, manage, and participate in online
                bounty opportunities.
              </Paragraph>

              <SubHeading>Our services may include:</SubHeading>

              <BulletList
                items={[
                  "Bounty creation: Tools for individuals and organizations to publish tasks and define their requirements and rewards.",
                  "Bounty discovery: Tools that allow contributors to browse and discover available opportunities.",
                  "Submissions: Functionality for submitting completed tasks, project links, descriptions, files, and other requested materials.",
                  "Review and approval: Tools that allow bounty creators or authorized reviewers to evaluate submissions.",
                  "Rewards: Supported processes for distributing rewards to eligible contributors.",
                  "Multi-chain functionality: Integration with supported blockchain networks and digital asset payment systems.",
                  "User profiles and dashboards: Features for viewing activity, submissions, completed tasks, and earnings.",
                ]}
              />

              <Paragraph>
                We may introduce, modify, suspend, or discontinue features
                from time to time. We do not guarantee that every feature
                will always be available.
              </Paragraph>
            </Section>

            <Section id="bounties" title="5. Bounties and Challenges">
              <Paragraph>
                A bounty is an opportunity created by a user or organization
                ("Bounty Creator") that allows other users ("Contributors")
                to complete specified tasks in exchange for advertised
                rewards.
              </Paragraph>

              <SubHeading>Bounty Creator responsibilities</SubHeading>

              <BulletList
                items={[
                  "Provide clear and accurate descriptions of bounty requirements.",
                  "Specify the reward amount, supported payment network, deadlines, and eligibility requirements where applicable.",
                  "Ensure that the advertised reward is genuine and that they have the ability and intention to honor it.",
                  "Provide fair and reasonable evaluation criteria.",
                  "Review submissions in good faith and within any stated review period.",
                  "Distribute approved rewards according to the published bounty conditions.",
                ]}
              />

              <SubHeading>Contributor responsibilities</SubHeading>

              <BulletList
                items={[
                  "Read and understand the bounty requirements before participating.",
                  "Submit original work or work that you are legally authorized to submit.",
                  "Provide accurate information and evidence of completed work.",
                  "Meet stated deadlines and submission requirements.",
                  "Avoid plagiarism, fraud, manipulation, and dishonest claims.",
                  "Respect the intellectual property rights of others.",
                ]}
              />

              <Paragraph>
                Happy Bounty is a platform facilitating interactions between
                Bounty Creators and Contributors. Unless expressly stated
                otherwise, the Bounty Creator is responsible for the
                requirements, funding, review, and fulfillment of the
                advertised bounty.
              </Paragraph>

              <Paragraph>
                We reserve the right to remove or suspend a bounty that
                violates these Terms, appears fraudulent, or creates a
                security, legal, or operational risk.
              </Paragraph>
            </Section>

            <Section id="submissions" title="6. Submissions and Approval">
              <Paragraph>
                Contributors may submit work through the submission tools
                provided by Happy Bounty. A submission may include text,
                descriptions, project links, images, documents, code, and
                other materials requested by the Bounty Creator.
              </Paragraph>

              <Paragraph>
                Submitting work does not automatically guarantee approval
                or payment. Submissions are evaluated according to the
                requirements and conditions published for the relevant
                bounty.
              </Paragraph>

              <SubHeading>Review process</SubHeading>

              <BulletList
                items={[
                  "Bounty Creators or authorized reviewers are responsible for evaluating submitted work.",
                  "A submission may be approved, rejected, or returned for clarification where the Platform supports such functionality.",
                  "Contributors must not manipulate submission records, fabricate evidence, or submit work belonging to another person without authorization.",
                  "Any disputes about the quality or acceptance of work should first be addressed between the Contributor and Bounty Creator.",
                ]}
              />

              <Paragraph>
                Happy Bounty may provide tools to support the review process
                but does not guarantee that every decision made by a Bounty
                Creator is correct or fair. We may investigate reports of
                fraud, abuse, or serious misconduct.
              </Paragraph>
            </Section>

            <Section id="payments" title="7. Payments and Platform Fees">
              <Paragraph>
                Happy Bounty may charge service fees for the use of certain
                Platform services, including bounty creation and reward
                transactions.
              </Paragraph>

              <SubHeading>Platform service fee</SubHeading>

              <div className="my-6 rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.05] p-6">
                <p className="mb-2 text-xs uppercase tracking-widest text-gray-500">
                  Current platform fee
                </p>

                <div className="mb-2 text-4xl font-bold text-[#00B889]">
                  7%
                </div>

                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Happy Bounty currently charges a platform service fee
                  of 7% of the applicable bounty payment. The applicable
                  fee and payment breakdown should be displayed before
                  the transaction is confirmed.
                </p>
              </div>

              <Paragraph>
                The fee may be collected or deducted through the payment
                process, depending on the transaction and supported payment
                method. Users are responsible for reviewing the fee
                breakdown before confirming a transaction.
              </Paragraph>

              <SubHeading>Payment responsibilities</SubHeading>

              <BulletList
                items={[
                  "Bounty Creators are responsible for ensuring that they have sufficient funds to honor advertised rewards.",
                  "Contributors are responsible for providing accurate wallet addresses and selecting the correct supported network.",
                  "Network transaction fees, where applicable, may be charged separately by blockchain networks or third-party providers.",
                  "Payments may be subject to processing delays, network congestion, or smart contract execution conditions.",
                  "Users are responsible for any applicable taxes arising from their activities on the Platform.",
                ]}
              />

              <Paragraph>
                Happy Bounty reserves the right to update its fee policy.
                Changes will be communicated through the Platform and will
                apply as stated in the updated policy.
              </Paragraph>
            </Section>

            <Section id="rewards" title="8. Rewards and Payouts">
              <Paragraph>
                Rewards are provided in accordance with the conditions of
                the relevant bounty. Supported reward methods may include
                USDC and other digital assets available on supported
                networks.
              </Paragraph>

              <Paragraph>
                A Contributor becomes eligible for a reward when the
                applicable bounty requirements have been satisfied and
                the submission has been approved under the bounty's
                published rules.
              </Paragraph>

              <BulletList
                items={[
                  "Contributors must provide a valid wallet address compatible with the selected network and reward asset.",
                  "Contributors are responsible for verifying the accuracy of their wallet address.",
                  "Reward distribution may be delayed by network congestion, technical issues, or third-party services.",
                  "Happy Bounty does not guarantee the market value of any digital asset.",
                  "Rewards are subject to the terms and conditions published for the relevant bounty.",
                ]}
              />

              <Paragraph>
                We are not responsible for rewards sent to an incorrect
                wallet address supplied by a user or for losses resulting
                from unsupported wallets or networks.
              </Paragraph>
            </Section>

            <Section id="refunds" title="9. Refund Policy">
              <Paragraph>
                Payments made through Happy Bounty may be subject to
                blockchain transaction limitations and the specific
                conditions of the relevant bounty.
              </Paragraph>

              <Paragraph>
                Because blockchain transactions are generally irreversible,
                confirmed on-chain payments cannot ordinarily be reversed
                through Happy Bounty.
              </Paragraph>

              <SubHeading>Refund considerations</SubHeading>

              <BulletList
                items={[
                  "Platform service fees are generally non-refundable once the applicable service has been provided or the transaction has been processed, except where required by applicable law.",
                  "Cancellation of a bounty does not automatically guarantee a refund.",
                  "Any refund of an unused or unallocated bounty reward will depend on the bounty's funding arrangements, transaction status, and applicable laws.",
                  "Users should contact Happy Bounty support when they believe a payment was processed incorrectly.",
                  "Nothing in this policy excludes any refund or consumer rights that cannot legally be excluded.",
                ]}
              />

              <Paragraph>
                We reserve the right to review payment disputes and take
                reasonable steps to investigate suspected errors or
                unauthorized activity.
              </Paragraph>
            </Section>

            <Section id="blockchain" title="10. Blockchain and Digital Assets">
              <Paragraph>
                Happy Bounty may integrate with blockchain networks,
                including Arc Network and Botchain, and may support
                transactions involving USDC and other digital assets.
              </Paragraph>

              <Paragraph>
                By using blockchain-related features, you acknowledge
                and accept that blockchain networks operate independently
                of Happy Bounty.
              </Paragraph>

              <SubHeading>Blockchain risks</SubHeading>

              <BulletList
                items={[
                  "Transactions may be irreversible once confirmed.",
                  "Network fees may change without notice.",
                  "Network congestion may delay transactions.",
                  "Smart contracts may contain vulnerabilities or experience unexpected behavior.",
                  "Digital assets may fluctuate in value or lose some or all of their value.",
                  "Supported networks, wallets, and digital assets may become unavailable.",
                ]}
              />

              <Paragraph>
                Happy Bounty does not control the underlying blockchain
                networks and cannot guarantee their availability, security,
                performance, or transaction confirmation times.
              </Paragraph>

              <Paragraph>
                You are responsible for verifying the network, token,
                wallet address, and transaction details before confirming
                any blockchain transaction.
              </Paragraph>

              <Paragraph>
                Happy Bounty does not provide investment, financial, legal,
                or tax advice. References to digital assets or supported
                networks do not constitute an endorsement or investment
                recommendation.
              </Paragraph>
            </Section>

            <Section
              id="conduct"
              title="11. User Conduct and Prohibited Activities"
            >
              <Paragraph>
                Users are expected to interact honestly, respectfully,
                and responsibly while using Happy Bounty.
              </Paragraph>

              <SubHeading>You must not:</SubHeading>

              <BulletList
                items={[
                  "Use the Platform for illegal activities, fraud, scams, or money laundering.",
                  "Create fake bounties or advertise rewards you do not intend or cannot afford to pay.",
                  "Submit plagiarized, stolen, misleading, or fraudulent work.",
                  "Manipulate submissions, reviews, approvals, or reward distributions.",
                  "Attempt to gain unauthorized access to accounts, wallets, servers, or Platform systems.",
                  "Use bots, scripts, scraping tools, or automated methods without our authorization.",
                  "Distribute malware, malicious code, phishing links, or harmful content.",
                  "Harass, threaten, discriminate against, or abuse other users.",
                  "Impersonate another individual, organization, or project.",
                  "Exploit bugs, vulnerabilities, or weaknesses in the Platform.",
                  "Interfere with the proper operation or security of Happy Bounty.",
                  "Use the Platform to violate the intellectual property or privacy rights of others.",
                ]}
              />

              <Paragraph>
                We may investigate suspected violations and take appropriate
                action, including removing content, suspending accounts,
                restricting access, or reporting unlawful activity to
                relevant authorities.
              </Paragraph>
            </Section>

            <Section id="intellectual" title="12. Intellectual Property">
              <SubHeading>Platform ownership</SubHeading>

              <Paragraph>
                Happy Bounty and its licensors retain ownership of the
                Platform, including its software, interface, branding,
                logos, designs, features, documentation, and related
                intellectual property rights, except where otherwise
                expressly stated.
              </Paragraph>

              <Paragraph>
                You may not copy, modify, distribute, reverse engineer,
                reproduce, or commercially exploit Platform materials
                without our prior written permission, except where
                applicable law permits such activity.
              </Paragraph>

              <SubHeading>User submissions and ownership</SubHeading>

              <Paragraph>
                You retain ownership of the original intellectual property
                rights in work and materials that you submit to Happy Bounty,
                subject to any separate agreement or license that applies
                to a particular bounty.
              </Paragraph>

              <Paragraph>
                By submitting content to the Platform, you grant Happy
                Bounty a non-exclusive, worldwide, royalty-free license
                to host, store, reproduce, display, and process that content
                as reasonably necessary to operate, maintain, promote,
                and improve the Platform and provide its services.
              </Paragraph>

              <Paragraph>
                This license does not transfer ownership of your original
                work to Happy Bounty. Any commercial use, transfer of
                ownership, or additional licensing requirements must be
                clearly established in the applicable bounty conditions
                or a separate agreement.
              </Paragraph>

              <Paragraph>
                Bounty Creators and Contributors are responsible for
                ensuring that their use of submitted materials respects
                third-party intellectual property rights.
              </Paragraph>
            </Section>

            <Section id="ai" title="13. Artificial Intelligence">
              <Paragraph>
                Happy Bounty may introduce artificial intelligence-powered
                features to assist with task discovery, content generation,
                submission review, support, recommendations, and other
                Platform functions.
              </Paragraph>

              <Paragraph>
                AI-generated information may be inaccurate, incomplete,
                outdated, or misleading. AI-assisted recommendations and
                outputs should not be treated as professional advice or
                guaranteed results.
              </Paragraph>

              <BulletList
                items={[
                  "Users remain responsible for reviewing and verifying AI-generated content.",
                  "AI-assisted reviews do not necessarily replace the judgment of a human bounty creator or reviewer.",
                  "Users must not use AI features for fraud, impersonation, harassment, or unlawful purposes.",
                  "Users must not submit confidential third-party information unless they have permission to do so.",
                ]}
              />

              <Paragraph>
                Where AI features process personal information, such
                processing will be subject to our Privacy Policy and
                applicable data protection laws.
              </Paragraph>
            </Section>

            <Section id="privacy" title="14. Privacy and Data Protection">
              <Paragraph>
                We respect your privacy and aim to handle personal
                information responsibly.
              </Paragraph>

              <Paragraph>
                When you use Happy Bounty, we may collect information
                necessary to operate the Platform, including account
                information, wallet addresses, transaction references,
                bounty activity, submissions, and technical usage data.
              </Paragraph>

              <SubHeading>How information may be used</SubHeading>

              <BulletList
                items={[
                  "To create and manage user accounts.",
                  "To facilitate bounty participation and submissions.",
                  "To support payment and reward processing.",
                  "To maintain Platform security and prevent fraud.",
                  "To provide customer support.",
                  "To improve Platform functionality and user experience.",
                  "To comply with applicable legal and regulatory obligations.",
                ]}
              />

              <Paragraph>
                We do not ask users to provide private wallet keys or
                recovery phrases.
              </Paragraph>

              <Paragraph>
                Your use of Happy Bounty is also subject to our Privacy
                Policy, which should be read together with these Terms.
              </Paragraph>
            </Section>

            <Section id="thirdparty" title="15. Third-Party Services">
              <Paragraph>
                Happy Bounty may connect with or provide links to third-party
                services, including wallet providers, blockchain networks,
                payment processors, analytics tools, and external websites.
              </Paragraph>

              <Paragraph>
                These services operate independently and may have their
                own terms, privacy policies, security practices, and
                operational limitations.
              </Paragraph>

              <Paragraph>
                Happy Bounty does not control or guarantee the availability,
                security, accuracy, or performance of third-party services.
                Your use of such services is at your own risk and subject
                to their applicable terms.
              </Paragraph>
            </Section>

            <Section id="termination" title="16. Suspension and Termination">
              <Paragraph>
                You may stop using Happy Bounty at any time. Where account
                deletion is available, you may request deletion through
                the applicable account settings or support channels.
              </Paragraph>

              <Paragraph>
                We may suspend, restrict, or terminate access to the
                Platform where we reasonably believe that:
              </Paragraph>

              <BulletList
                items={[
                  "You have violated these Terms or applicable laws.",
                  "Your account is involved in suspected fraud, scams, or malicious activity.",
                  "Your activity creates a security risk for the Platform or other users.",
                  "We are required to do so by law or a competent authority.",
                  "Continued access would expose the Platform or users to material risk.",
                ]}
              />

              <Paragraph>
                Termination does not automatically reverse blockchain
                transactions or eliminate obligations that arose before
                termination. Provisions that by their nature should
                continue after termination will remain effective.
              </Paragraph>
            </Section>

            <Section id="disclaimers" title="17. Disclaimers">
              <Paragraph>
                Happy Bounty is provided on an "AS IS" and "AS AVAILABLE"
                basis to the maximum extent permitted by applicable law.
              </Paragraph>

              <Paragraph>
                We do not guarantee that the Platform will always be
                available, uninterrupted, secure, error-free, or compatible
                with every device, wallet, or blockchain network.
              </Paragraph>

              <Paragraph>We do not guarantee that:</Paragraph>

              <BulletList
                items={[
                  "Every bounty will receive submissions.",
                  "Every submission will be approved.",
                  "Every Bounty Creator will fulfill their advertised rewards.",
                  "Every Contributor will earn money through the Platform.",
                  "Every blockchain transaction will be successful or processed within a particular timeframe.",
                  "The Platform will always operate without technical issues.",
                ]}
              />

              <Paragraph>
                Users are responsible for conducting their own due diligence
                before participating in bounties or interacting with other
                users.
              </Paragraph>
            </Section>

            <Section id="liability" title="18. Limitation of Liability">
              <Paragraph>
                To the maximum extent permitted by applicable law, Happy
                Bounty and its owners, affiliates, employees, contractors,
                and service providers will not be liable for indirect,
                incidental, consequential, special, exemplary, or punitive
                damages, including loss of profits, revenue, data, digital
                assets, business opportunities, or goodwill.
              </Paragraph>

              <Paragraph>
                This limitation applies to losses arising from:
              </Paragraph>

              <BulletList
                items={[
                  "Your use of or inability to use the Platform.",
                  "Disputes between Bounty Creators and Contributors.",
                  "Incorrect wallet addresses or blockchain transactions.",
                  "Unauthorized access to accounts or wallets.",
                  "Third-party services and blockchain network failures.",
                  "Errors, interruptions, or technical issues.",
                  "Actions or omissions of other Platform users.",
                ]}
              />

              <Paragraph>
                Where liability cannot legally be excluded or limited,
                nothing in these Terms excludes or limits that liability.
                Any remaining liability will be limited to the maximum
                extent permitted by applicable law.
              </Paragraph>
            </Section>

            <Section id="indemnification" title="19. Indemnification">
              <Paragraph>
                You agree to indemnify and hold harmless Happy Bounty,
                its affiliates, owners, employees, and service providers
                against reasonable third-party claims, losses, damages,
                liabilities, and expenses arising from:
              </Paragraph>

              <BulletList
                items={[
                  "Your violation of these Terms.",
                  "Your misuse of the Platform.",
                  "Your infringement of another person's intellectual property or other legal rights.",
                  "Your fraudulent, unlawful, or misleading conduct.",
                  "Your violation of applicable laws or regulations.",
                ]}
              />

              <Paragraph>
                This obligation will apply to the extent permitted by
                applicable law.
              </Paragraph>
            </Section>

            <Section id="modifications" title="20. Changes to These Terms">
              <Paragraph>
                We may update or modify these Terms from time to time to
                reflect changes in our services, business operations,
                technology, or legal requirements.
              </Paragraph>

              <Paragraph>
                When changes are made, we will update the revision date
                displayed on this page. Where required by applicable law,
                we will provide additional notice or obtain your consent.
              </Paragraph>

              <Paragraph>
                Your continued use of Happy Bounty after updated Terms
                become effective constitutes acceptance of those changes
                to the extent permitted by applicable law.
              </Paragraph>
            </Section>

            <Section id="governing" title="21. Governing Law and Disputes">
              <Paragraph>
                If you have a concern or dispute relating to Happy Bounty,
                we encourage you to contact us first so that we can attempt
                to resolve the matter informally.
              </Paragraph>

              <Paragraph>
                The parties will make reasonable efforts to resolve disputes
                through good-faith communication before pursuing formal
                legal proceedings, unless urgent legal relief is required.
              </Paragraph>

              <Paragraph>
                These Terms and any disputes arising from them will be
                governed by the laws of the jurisdiction identified in
                Happy Bounty's official company information, subject to
                mandatory consumer protection and other applicable laws.
              </Paragraph>

              <Paragraph>
                Nothing in this section prevents users from exercising
                rights that cannot legally be waived under the laws
                applicable to them.
              </Paragraph>
            </Section>

            <Section id="contact" title="22. Contact Us">
              <Paragraph>
                If you have questions about these Terms, need assistance
                with a bounty, or want to report suspicious activity,
                please contact the Happy Bounty team through the official
                support channels published on our Platform.
              </Paragraph>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#101310] sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00D6A0]/10">
                    <FiMessageCircle className="text-xl text-[#00B889]" />
                  </div>

                  <div>
                    <h3 className="font-bold">Happy Bounty Support</h3>
                    <p className="text-xs text-gray-500">
                      We're here to help.
                    </p>
                  </div>
                </div>

                <p className="mb-5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  For legal inquiries, account concerns, payment issues,
                  or general questions, use the official contact method
                  provided on our website.
                </p>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-5 py-3 text-sm font-bold text-[#06130F] transition-all hover:bg-[#00B889]"
                >
                  Contact Support
                  <FiArrowUpRight />
                </Link>
              </div>
            </Section>

            {/* Bottom */}
            <div className="pb-12 pt-5">
              <div className="mb-3 flex items-center gap-2 text-[#00B889]">
                <FiCheckCircle />
                <span className="text-xs font-semibold">
                  End of Terms of Use
                </span>
              </div>

              <p className="text-xs leading-6 text-gray-500">
                Thank you for being part of Happy Bounty. By using our
                platform, you help build an ecosystem where skills,
                opportunities, and rewards come together.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-gray-200 pt-6 dark:border-white/[0.07]">
                <Link
                  to="/"
                  className="text-xs text-gray-500 transition-colors hover:text-[#00D6A0]"
                >
                  Home
                </Link>

                <Link
                  to="/privacy"
                  className="text-xs text-gray-500 transition-colors hover:text-[#00D6A0]"
                >
                  Privacy Policy
                </Link>

                <span className="text-xs text-gray-400">
                  © {new Date().getFullYear()} Happy Bounty. All rights
                  reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsOfUse;
