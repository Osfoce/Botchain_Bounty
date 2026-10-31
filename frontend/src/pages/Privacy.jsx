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
  FiMessageCircle,
} from "react-icons/fi";

const sections = [
  { id: "introduction", title: "1. Introduction", icon: FiFileText },
  { id: "definitions", title: "2. Definitions", icon: FiDatabase },
  { id: "information", title: "3. Information We Collect", icon: FiDatabase },
  { id: "wallets", title: "4. Wallets & Blockchain Data", icon: FiGlobe },
  { id: "content", title: "5. User Content & Submissions", icon: FiFileText },
  { id: "cookies", title: "6. Cookies & Tracking", icon: FiGlobe },
  { id: "usage", title: "7. How We Use Information", icon: FiCheckCircle },
  { id: "sharing", title: "8. Sharing Information", icon: FiGlobe },
  { id: "transfers", title: "9. International Transfers", icon: FiGlobe },
  { id: "retention", title: "10. Data Retention", icon: FiDatabase },
  { id: "security", title: "11. Data Security", icon: FiLock },
  { id: "rights", title: "12. Your Privacy Rights", icon: FiShield },
  { id: "third-party", title: "13. Third-Party Services", icon: FiExternalLink },
  { id: "children", title: "14. Children's Privacy", icon: FiShield },
  { id: "changes", title: "15. Policy Updates", icon: FiFileText },
  { id: "contact", title: "16. Contact Us", icon: FiArrowUpRight },
];

function PolicySection({ id, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-black/[0.07] py-8 first:pt-0 dark:border-white/[0.10] sm:py-10"
    >
      <h2 className="mb-5 text-xl font-bold tracking-tight text-[#171714] dark:text-white sm:text-2xl">
        {title}
      </h2>

      <div className="space-y-4 text-sm leading-7 text-black/60 dark:text-white/65 sm:text-[15px] sm:leading-8">
        {children}
      </div>
    </section>
  );
}

function PolicySubheading({ children }) {
  return (
    <h3 className="pt-2 text-base font-bold text-[#252520] dark:text-white/90 sm:text-lg">
      {children}
    </h3>
  );
}

function PolicyList({ items }) {
  return (
    <ul className="space-y-3 pl-5">
      {items.map((item, index) => (
        <li key={index} className="list-disc pl-1 marker:text-[#00A87D]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Highlight({ children }) {
  return (
    <div className="my-5 rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4 dark:border-[#00D6A0]/25 dark:bg-[#00D6A0]/[0.08] sm:p-5">
      <div className="flex gap-3">
        <FiShield className="mt-1 shrink-0 text-lg text-[#008A66] dark:text-[#00D6A0]" />
        <div className="text-sm leading-7 text-[#315D4E] dark:text-white/75">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -70% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const goToSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="theme-page min-h-screen overflow-x-clip bg-[#F5F7F5] text-[#171714] transition-colors duration-300 dark:bg-[#080B09] dark:text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.16] dark:opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,23,20,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,20,0.035) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute -top-40 right-[-100px] h-[400px] w-[400px] rounded-full bg-[#00D6A0]/[0.08] blur-[140px]" />
        <div className="absolute bottom-[-150px] left-[-100px] h-[350px] w-[350px] rounded-full bg-[#00A87D]/[0.05] blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        {/* TOP BAR */}
        <div className="mb-10 flex items-center justify-between sm:mb-14">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white/80 px-4 py-2.5 text-sm font-semibold text-black/60 shadow-sm backdrop-blur-xl transition hover:border-[#00D6A0]/50 hover:text-[#008A66] dark:border-white/[0.12] dark:bg-[#111713]/80 dark:text-white/70 dark:hover:text-[#00D6A0]"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#00D6A0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/45">
              Happy Bounty Legal Center
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-black/60 transition dark:border-white/[0.12] dark:bg-[#111713] dark:text-white/75 lg:hidden"
            aria-label="Toggle policy navigation"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* HERO */}
        <section className="mb-12 overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.04)] transition-colors duration-300 dark:border-white/[0.10] dark:bg-[#111713] dark:shadow-[0_15px_50px_rgba(0,0,0,0.25)] sm:mb-14">
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#00D6A0]/[0.08] blur-[100px]" />

            <div className="relative z-10 max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/25 bg-[#00D6A0]/[0.07] px-3.5 py-2 dark:border-[#00D6A0]/30 dark:bg-[#00D6A0]/[0.10]">
                <FiShield className="text-sm text-[#008A66] dark:text-[#00D6A0]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#007E62] dark:text-[#00D6A0]">
                  Privacy & Data Protection
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.045em] text-[#171714] dark:text-white sm:text-5xl md:text-6xl">
                Privacy <span className="text-[#00A87D] dark:text-[#00D6A0]">Policy.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-black/50 dark:text-white/60 sm:text-base sm:leading-8">
                Your trust matters. This policy explains how Happy Bounty
                handles information when you visit our platform, connect a
                wallet, create bounties, participate in campaigns, or interact
                with our multi-chain ecosystem.
              </p>

              {/* UPDATED DARK MODE BADGES */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-black/[0.07] bg-[#F3F6F3] px-3.5 py-2.5 text-xs font-semibold text-black/65 transition-colors dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white/85">
                  <FiFileText className="text-[#008A66] dark:text-[#00D6A0]" />
                  Privacy Policy
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-black/[0.07] bg-[#F3F6F3] px-3.5 py-2.5 text-xs font-semibold text-black/65 transition-colors dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white/85">
                  <FiLock className="text-[#008A66] dark:text-[#00D6A0]" />
                  Data Protection
                </div>

                <div className="rounded-xl border border-black/[0.09] bg-white/50 px-3.5 py-2.5 text-xs font-medium text-black/55 transition-colors dark:border-white/[0.16] dark:bg-white/[0.04] dark:text-white/70">
                  Last updated: October 31, 2026
                </div>
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-[#00A87D] via-[#00D6A0] to-transparent" />
        </section>

        {/* NOTICE */}
        <div className="mb-8 rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.06] p-4 dark:border-[#00D6A0]/25 dark:bg-[#00D6A0]/[0.08] sm:p-5">
          <div className="flex gap-3">
            <FiShield className="mt-1 shrink-0 text-lg text-[#008A66] dark:text-[#00D6A0]" />

            <div>
              <h3 className="text-sm font-bold text-[#174C3C] dark:text-[#8CEBD0]">
                Your information and your choices
              </h3>

              <p className="mt-1 text-xs leading-6 text-[#315D4E] dark:text-white/70 sm:text-sm">
                This policy describes the information Happy Bounty may process
                to operate its services. Some information is provided by you,
                while other information may be generated through your use of
                the platform or recorded on public blockchain networks.
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white p-3 shadow-lg dark:border-white/[0.10] dark:bg-[#111713] lg:hidden">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 dark:text-white/40">
              Policy contents
            </p>

            <div className="max-h-[55vh] space-y-1 overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${
                      activeSection === section.id
                        ? "bg-[#00D6A0]/10 text-[#008A66] dark:bg-[#00D6A0]/[0.12] dark:text-[#00D6A0]"
                        : "text-black/50 hover:bg-black/[0.03] dark:text-white/55 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <Icon className="shrink-0 text-sm" />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DOCUMENT LAYOUT */}
        <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          {/* DESKTOP SIDEBAR */}
          <aside className="sticky top-6 hidden rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] dark:border-white/[0.10] dark:bg-[#111713] dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] lg:block">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 dark:text-white/40">
              On this page
            </p>

            <nav className="max-h-[75vh] space-y-1 overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold transition-all ${
                      activeSection === section.id
                        ? "bg-[#00D6A0]/10 text-[#008A66] dark:bg-[#00D6A0]/[0.12] dark:text-[#00D6A0]"
                        : "text-black/45 hover:bg-black/[0.035] hover:text-black/75 dark:text-white/50 dark:hover:bg-white/[0.05] dark:hover:text-white/85"
                    }`}
                  >
                    {activeSection === section.id && (
                      <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[#00A87D] dark:bg-[#00D6A0]" />
                    )}

                    <Icon className="shrink-0 text-sm" />
                    {section.title}
                  </button>
                );
              })}
            </nav>

            <div className="mt-5 border-t border-black/[0.07] pt-4 dark:border-white/[0.10]">
              <div className="rounded-xl bg-[#F4F7F4] p-3 dark:bg-white/[0.05]">
                <FiLock className="mb-2 text-lg text-[#008A66] dark:text-[#00D6A0]" />

                <p className="text-xs font-bold text-black/70 dark:text-white/85">
                  Privacy matters.
                </p>

                <p className="mt-1 text-[10px] leading-5 text-black/40 dark:text-white/50">
                  Learn how your information is handled when using Happy Bounty.
                </p>
              </div>
            </div>
          </aside>

          {/* POLICY CONTENT */}
          <article className="min-w-0 rounded-[24px] border border-black/[0.07] bg-white px-5 py-7 shadow-[0_10px_40px_rgba(0,0,0,0.035)] dark:border-white/[0.10] dark:bg-[#111713] dark:shadow-[0_10px_40px_rgba(0,0,0,0.20)] sm:px-8 sm:py-10 lg:px-12">
            <PolicySection id="introduction" title="1. Introduction">
              <p>
                Welcome to Happy Bounty. We value the privacy of individuals
                who visit, access, and use our platform.
              </p>

              <p>
                This Privacy Policy explains how information may be collected,
                used, stored, disclosed, and protected when you use the Happy
                Bounty website and related services.
              </p>

              <p>
                Happy Bounty is a platform that connects bounty creators with
                contributors. Users can publish opportunities, participate in
                tasks, submit work for review, and receive rewards when
                submissions are approved under the relevant bounty conditions.
              </p>

              <p>
                Our platform is designed to support a multi-chain ecosystem.
                Arc is our first live deployment, and Botchain is being
                integrated. Other networks may become available as the platform
                expands.
              </p>

              <p>
                By accessing or using Happy Bounty, you acknowledge that you
                have had the opportunity to read this Privacy Policy. If you
                do not agree with the way information is handled as described
                here, you should stop using the platform.
              </p>
            </PolicySection>

            <PolicySection id="definitions" title="2. Definitions">
              <p>For this Privacy Policy, the following terms mean:</p>

              <PolicyList
                items={[
                  <><strong>Happy Bounty:</strong> The platform, website, and related services provided under the Happy Bounty name.</>,
                  <><strong>User:</strong> Any individual who visits, registers for, connects a wallet to, or uses the platform.</>,
                  <><strong>Bounty Creator:</strong> A user who publishes a task, campaign, challenge, or opportunity with stated requirements and rewards.</>,
                  <><strong>Contributor:</strong> A user who participates in a bounty and submits work or evidence for review.</>,
                  <><strong>Account:</strong> A user profile or account used to access platform features, where account functionality is provided.</>,
                  <><strong>Wallet:</strong> A blockchain wallet used to connect to the platform or interact with supported blockchain networks.</>,
                  <><strong>Personal Information:</strong> Information that identifies or could reasonably be associated with an identifiable individual, as defined by applicable privacy laws.</>,
                  <><strong>User Content:</strong> Text, images, links, files, submissions, comments, or other material provided by a user through the platform.</>,
                  <><strong>Blockchain Network:</strong> A distributed ledger network supported by or integrated with Happy Bounty.</>,
                  <><strong>Services:</strong> The Happy Bounty website, bounty features, account functionality, and related platform services.</>,
                ]}
              />
            </PolicySection>

            <PolicySection id="information" title="3. Information We Collect">
              <p>
                The information we process depends on how you interact with
                Happy Bounty and which platform features you use. We may collect
                information directly from you, automatically through your use
                of the platform, or from services involved in providing the
                platform.
              </p>

              <PolicySubheading>3.1 Information you provide</PolicySubheading>
              <p>This may include:</p>

              <PolicyList
                items={[
                  "Information submitted when creating or managing an account, where account registration is available.",
                  "Your blockchain wallet address when you connect a wallet.",
                  "Information included in bounty descriptions, task requirements, comments, and campaign details.",
                  "Submissions, project links, uploaded files, images, and evidence provided when participating in a bounty.",
                  "Messages or information you send when contacting support.",
                  "Other information you voluntarily provide through platform features.",
                ]}
              />

              <PolicySubheading>3.2 Wallet and transaction information</PolicySubheading>
              <p>
                When you connect a wallet or interact with blockchain features,
                we may process your public wallet address, selected network,
                transaction references, and information needed to display or
                support relevant bounty activity.
              </p>

              <PolicySubheading>3.3 Technical and usage information</PolicySubheading>
              <p>
                Depending on the services and technologies enabled, we may
                collect technical information such as:
              </p>

              <PolicyList
                items={[
                  "IP address and general connection information.",
                  "Browser type, operating system, and device information.",
                  "Pages visited, interactions, and approximate access times.",
                  "Error reports, diagnostic information, and performance data.",
                  "Cookie preferences and similar technical identifiers.",
                ]}
              />

              <PolicySubheading>3.4 Information from service providers</PolicySubheading>
              <p>
                We may receive limited information from wallet connection
                providers, blockchain infrastructure providers, hosting
                providers, or other service providers where necessary to
                operate the platform.
              </p>

              <Highlight>
                We aim to collect information that is relevant to operating,
                protecting, and improving Happy Bounty. The information
                collected may vary depending on which features are active.
              </Highlight>
            </PolicySection>

            <PolicySection id="wallets" title="4. Wallets & Blockchain Data">
              <p>
                Happy Bounty uses blockchain technology to support wallet
                connections and bounty-related transactions on supported
                networks.
              </p>

              <PolicySubheading>4.1 Connecting your wallet</PolicySubheading>
              <p>
                When you connect a wallet, the platform may receive your public
                wallet address and information required to identify the
                connected blockchain network. Connecting a wallet does not
                mean that Happy Bounty receives your private keys or recovery
                phrase.
              </p>

              <Highlight>
                Never share your wallet seed phrase, private key, or wallet
                recovery credentials with anyone claiming to represent Happy
                Bounty. We do not need these credentials to identify your
                public wallet address.
              </Highlight>

              <PolicySubheading>4.2 Public blockchain information</PolicySubheading>
              <p>
                Blockchain networks are generally public and transparent.
                Transactions submitted to a public blockchain may be visible to
                anyone who can access that network's public records.
              </p>

              <p>
                Depending on the network and transaction, publicly accessible
                information may include wallet addresses, transaction hashes,
                token transfers, timestamps, and smart contract interactions.
              </p>

              <PolicySubheading>4.3 Multi-chain activity</PolicySubheading>
              <p>
                Happy Bounty is developing a multi-chain experience. Arc is
                our first live deployment, while Botchain is being integrated.
                Additional blockchain networks may be supported in the future.
              </p>

              <p>
                If you use a supported network, information about your
                blockchain interactions may be processed by that network and
                its infrastructure providers according to their own
                technologies and policies.
              </p>

              <PolicySubheading>4.4 Blockchain limitations</PolicySubheading>
              <p>
                Information recorded on a public blockchain may be permanent
                and may not be capable of being edited or deleted by Happy
                Bounty. A request to delete information held by the platform
                cannot necessarily remove information already recorded on a
                blockchain.
              </p>
            </PolicySection>

            <PolicySection id="content" title="5. User Content & Submissions">
              <p>
                Happy Bounty allows users to publish bounty opportunities,
                participate in campaigns, and submit work for review.
              </p>

              <p>
                Content you provide may include bounty descriptions, task
                instructions, project links, uploaded files, images, comments,
                and submission evidence.
              </p>

              <p>We may process this content to:</p>

              <PolicyList
                items={[
                  "Display bounty opportunities and their requirements.",
                  "Allow contributors to participate in available campaigns.",
                  "Enable bounty creators to review and evaluate submissions.",
                  "Support approval, rejection, and reward-related workflows.",
                  "Investigate reports, disputes, misuse, or suspected fraudulent activity.",
                  "Maintain the functionality and integrity of the platform.",
                ]}
              />

              <p>
                Some content may be visible to other users, bounty creators,
                or visitors depending on the feature and its visibility
                settings. Do not include private or sensitive information in
                public bounty descriptions, comments, or submissions unless
                you intend to share it.
              </p>
            </PolicySection>

            <PolicySection id="cookies" title="6. Cookies & Tracking Technologies">
              <p>
                Happy Bounty may use cookies and similar technologies to
                support website functionality and improve the user experience.
              </p>

              <PolicySubheading>6.1 Essential cookies</PolicySubheading>
              <p>
                These may be used for functions necessary to operate the
                website, maintain preferences, support security, or provide
                requested platform features.
              </p>

              <PolicySubheading>6.2 Preference cookies</PolicySubheading>
              <p>
                These may remember choices such as theme preferences or cookie
                consent settings so that you do not need to set them again on
                every visit.
              </p>

              <PolicySubheading>6.3 Analytics cookies</PolicySubheading>
              <p>
                If analytics technologies are enabled, they may help us
                understand how visitors use the platform, identify performance
                issues, and improve the website.
              </p>

              <PolicySubheading>6.4 Your choices</PolicySubheading>
              <p>
                You may be able to manage optional cookie preferences through
                the platform's cookie consent controls or your browser
                settings. Disabling certain cookies may affect some website
                features.
              </p>

              <p>
                The use of optional cookies and similar technologies should
                follow the consent requirements applicable to your location.
              </p>
            </PolicySection>

            <PolicySection id="usage" title="7. How We Use Information">
              <p>
                We may use information collected through Happy Bounty for
                purposes including:
              </p>

              <PolicyList
                items={[
                  "Providing, maintaining, and operating the platform.",
                  "Enabling users to create, discover, and participate in bounties.",
                  "Supporting wallet connections and supported blockchain interactions.",
                  "Processing and displaying bounty submissions and their review status.",
                  "Supporting reward-related workflows and transaction records.",
                  "Responding to questions, support requests, and user feedback.",
                  "Detecting suspicious activity, abuse, fraud, and security issues.",
                  "Monitoring platform performance and resolving technical problems.",
                  "Improving the design, functionality, and reliability of the services.",
                  "Communicating important service announcements, security notices, and policy updates.",
                  "Meeting legal obligations and enforcing platform rules.",
                ]}
              />

              <p>
                Where required by applicable law, we will rely on an appropriate
                legal basis for processing personal information. Depending on
                the situation, this may include providing a requested service,
                complying with legal obligations, legitimate interests, or
                consent.
              </p>
            </PolicySection>

            <PolicySection id="sharing" title="8. Sharing Information">
              <p>
                We do not intend to make your private information publicly
                available without a reason. However, certain information may
                need to be shared to operate the platform or provide requested
                services.
              </p>

              <PolicySubheading>8.1 Service providers</PolicySubheading>
              <p>
                We may use third-party providers for website hosting,
                infrastructure, analytics, wallet connectivity, blockchain
                services, security, and technical support. These providers may
                process information on our behalf where necessary to provide
                their services.
              </p>

              <PolicySubheading>8.2 Other platform users</PolicySubheading>
              <p>
                Information you publish or submit may be visible to other
                users according to the relevant platform feature. For example,
                bounty descriptions may be available to contributors, while
                submissions may be available to the relevant bounty creator
                for review.
              </p>

              <PolicySubheading>8.3 Legal and safety reasons</PolicySubheading>
              <p>
                We may disclose information when reasonably necessary to comply
                with applicable laws, respond to lawful requests, protect
                users, investigate suspected fraud, or protect the rights and
                security of Happy Bounty and others.
              </p>

              <PolicySubheading>8.4 Business changes</PolicySubheading>
              <p>
                If Happy Bounty undergoes a merger, acquisition, restructuring,
                financing, or transfer of business assets, information may be
                transferred as part of that process, subject to applicable
                privacy requirements.
              </p>

              <PolicySubheading>8.5 With your direction or consent</PolicySubheading>
              <p>
                We may share information for other purposes where you request
                or authorize the sharing, or where otherwise permitted by law.
              </p>
            </PolicySection>

            <PolicySection id="transfers" title="9. International Data Transfers">
              <p>
                Happy Bounty may rely on service providers and infrastructure
                located in different countries. As a result, information may
                be processed or stored in jurisdictions other than the country
                in which you live.
              </p>

              <p>
                Where applicable privacy laws require safeguards for
                international transfers, we will take reasonable steps to use
                appropriate protections for the information being transferred.
              </p>

              <p>
                The privacy laws and protections available in another
                jurisdiction may differ from those in your location.
              </p>
            </PolicySection>

            <PolicySection id="retention" title="10. Data Retention">
              <p>
                We retain personal information for as long as reasonably
                necessary to provide the services, fulfil the purposes
                described in this policy, resolve disputes, maintain security,
                and meet applicable legal obligations.
              </p>

              <p>Retention periods may depend on:</p>

              <PolicyList
                items={[
                  "The type and sensitivity of the information.",
                  "Why the information was collected.",
                  "Whether the information is needed to maintain platform functionality.",
                  "Security, fraud prevention, and dispute-resolution requirements.",
                  "Applicable legal and regulatory obligations.",
                ]}
              />

              <p>
                When information is no longer required, we may delete it,
                anonymize it, or securely dispose of it where appropriate and
                technically possible.
              </p>

              <p>
                Information recorded on public blockchain networks may remain
                accessible independently of our data retention practices.
              </p>
            </PolicySection>

            <PolicySection id="security" title="11. Data Security">
              <p>
                We take reasonable technical and organizational measures
                designed to protect information against unauthorized access,
                accidental loss, misuse, alteration, or disclosure.
              </p>

              <p>
                These measures may include access controls, security
                monitoring, infrastructure protections, and other safeguards
                appropriate to the platform and the information involved.
              </p>

              <p>
                However, no website, internet transmission, storage system, or
                blockchain-related service can be guaranteed to be completely
                secure. We cannot promise absolute security.
              </p>

              <Highlight>
                You are responsible for protecting your own wallet credentials,
                securing your devices, and checking transaction details before
                approving blockchain transactions.
              </Highlight>
            </PolicySection>

            <PolicySection id="rights" title="12. Your Privacy Rights">
              <p>
                Depending on where you live and which privacy laws apply, you
                may have rights relating to your personal information.
              </p>

              <p>These rights may include:</p>

              <PolicyList
                items={[
                  "Requesting access to personal information we hold about you.",
                  "Requesting correction of inaccurate or incomplete information.",
                  "Requesting deletion of personal information where applicable.",
                  "Objecting to or requesting restrictions on certain processing.",
                  "Requesting a portable copy of certain information where available.",
                  "Withdrawing consent where processing is based on consent.",
                  "Opting out of certain marketing communications.",
                  "Submitting a complaint to a relevant data protection authority.",
                ]}
              />

              <p>
                To make a privacy request, contact us through the support
                channel linked below. We may need to verify your identity
                before responding.
              </p>

              <p>
                Some information may need to be retained where required by law
                or necessary for legitimate platform operations. Public
                blockchain records may also be outside our ability to modify
                or delete.
              </p>
            </PolicySection>

            <PolicySection id="third-party" title="13. Third-Party Services">
              <p>
                Happy Bounty may link to or interact with third-party websites,
                wallets, blockchain networks, and external services.
              </p>

              <p>
                These services operate independently and may have their own
                privacy policies, security practices, and terms. We do not
                control how independent third parties collect or use
                information.
              </p>

              <p>
                Before using an external service or connecting to a third-party
                website, we encourage you to review its applicable privacy
                policy and terms.
              </p>
            </PolicySection>

            <PolicySection id="children" title="14. Children's Privacy">
              <p>
                Happy Bounty is not designed to knowingly collect personal
                information from children in circumstances where such
                collection is prohibited by applicable law.
              </p>

              <p>
                Where a minimum age applies to use of the platform, users must
                meet that requirement or have any legally required parental or
                guardian authorization.
              </p>

              <p>
                If you believe a child has provided personal information to
                Happy Bounty in violation of applicable requirements, please
                contact us so the matter can be reviewed.
              </p>
            </PolicySection>

            <PolicySection id="changes" title="15. Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy as Happy Bounty develops,
                introduces new features, integrates additional blockchain
                networks, or responds to changes in applicable laws.
              </p>

              <p>
                When we make changes, we will update the revision date shown
                at the top of this page. Where required, we may also provide
                additional notice through the platform or another appropriate
                communication channel.
              </p>

              <p>
                We encourage users to review this page periodically to stay
                informed about how information is handled.
              </p>
            </PolicySection>

            <PolicySection id="contact" title="16. Contact Us">
              <p>
                If you have questions about this Privacy Policy, want to make
                a privacy request, or have concerns about how your information
                is handled, please contact the Happy Bounty team.
              </p>

              <div className="mt-5 rounded-2xl border border-black/[0.07] bg-[#F7F9F7] p-5 dark:border-white/[0.10] dark:bg-white/[0.04] sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-[#008A66] dark:text-[#00D6A0]">
                    <FiMessageCircle className="text-xl" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#171714] dark:text-white">
                      Happy Bounty Support
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-black/45 dark:text-white/55">
                      Reach out through our contact page for privacy-related
                      questions and requests.
                    </p>

                    <Link
                      to="/contact"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00A87D] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#008A66]"
                    >
                      Contact Our Team
                      <FiArrowUpRight />
                    </Link>
                  </div>
                </div>
              </div>
            </PolicySection>

            {/* END OF POLICY */}
            <div className="mt-8 rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.05] p-5 dark:border-[#00D6A0]/20 dark:bg-[#00D6A0]/[0.07] sm:p-6">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-1 shrink-0 text-lg text-[#008A66] dark:text-[#00D6A0]" />

                <div>
                  <h3 className="font-bold text-[#174C3C] dark:text-[#8CEBD0]">
                    Thank you for being part of Happy Bounty.
                  </h3>

                  <p className="mt-1 text-xs leading-6 text-[#315D4E] dark:text-white/70 sm:text-sm">
                    We are committed to building an open, accessible, and
                    responsible bounty ecosystem while treating user
                    information with care.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-3 border-t border-black/[0.07] pt-6 dark:border-white/[0.10] sm:flex-row sm:items-center">
              <p className="text-xs text-black/35 dark:text-white/40">
                Happy Bounty · Privacy Policy
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#008A66] transition hover:text-[#006B50] dark:text-[#00D6A0] dark:hover:text-[#72F0CC]"
              >
                Return to Happy Bounty
                <FiArrowUpRight />
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}