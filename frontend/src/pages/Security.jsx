
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiShield,
  FiLock,
  FiGlobe,
  FiDatabase,
  FiAlertTriangle,
  FiCheckCircle,
  FiKey,
  FiCode,
  FiEye,
  FiMail,
  FiExternalLink,
  FiServer,
  FiFileText,
} from "react-icons/fi";

const securitySections = [
  {
    number: "01",
    icon: FiShield,
    title: "Platform Security",
    description:
      "Happy Bounty is designed to provide a reliable environment for creating bounties, completing tasks and receiving rewards.",
    points: [
      "We work to protect platform infrastructure and user information.",
      "We aim to maintain reliable access to bounty-related features.",
      "Users should always access Happy Bounty through its official website.",
    ],
  },
  {
    number: "02",
    icon: FiKey,
    title: "Wallet Security",
    description:
      "Happy Bounty allows users to connect their crypto wallets to interact with blockchain-based features.",
    points: [
      "Your wallet remains under your control.",
      "Always review transaction details before signing.",
      "Never share your private keys or recovery phrase.",
      "Only connect your wallet to the official Happy Bounty website.",
    ],
  },
  {
    number: "03",
    icon: FiCode,
    title: "Smart Contract Security",
    description:
      "Blockchain technology supports bounty-related transactions and reward distribution across supported networks.",
    points: [
      "Always verify the network before making a transaction.",
      "Check transaction details before approving wallet requests.",
      "Blockchain transactions may be irreversible once confirmed.",
      "Do not assume a smart contract has been audited unless an official audit report is published.",
    ],
  },
  {
    number: "04",
    icon: FiDatabase,
    title: "Data Protection",
    description:
      "We recognise the importance of protecting information associated with your use of Happy Bounty.",
    points: [
      "We aim to handle user information responsibly.",
      "Access to personal information should be limited to authorised purposes.",
      "Users should avoid sharing sensitive personal information publicly.",
      "Read our Privacy Policy to understand how information is handled.",
    ],
  },
  {
    number: "05",
    icon: FiAlertTriangle,
    title: "Scam & Phishing Prevention",
    description:
      "Protecting yourself is an important part of staying safe in the Web3 ecosystem.",
    points: [
      "Be careful with suspicious links and messages.",
      "Happy Bounty will never need your wallet recovery phrase or private key.",
      "Verify announcements through official Happy Bounty channels.",
      "Never approve transactions you do not understand.",
      "Be cautious of people promising guaranteed rewards outside the platform.",
    ],
  },
  {
    number: "06",
    icon: FiEye,
    title: "Responsible Usage",
    description:
      "A secure ecosystem requires both responsible platform practices and informed users.",
    points: [
      "Keep your browser and wallet software updated.",
      "Use a secure device and network when connecting your wallet.",
      "Review bounty requirements before submitting work.",
      "Report suspicious activity whenever you encounter it.",
    ],
  },
];

function Security() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f5ef] text-[#111713] transition-colors duration-300 dark:bg-[#080908] dark:text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-[#00D6A0]/10 blur-[130px]" />
        <div className="absolute right-0 top-[45%] h-[300px] w-[300px] rounded-full bg-[#00D6A0]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        {/* Back navigation */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#00D6A0] hover:text-[#008A66] dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:text-[#00D6A0]"
          >
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>

        {/* Hero */}
        <section className="relative mb-20 text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#00D6A0]/30 bg-[#00D6A0]/10 shadow-[0_0_55px_rgba(0,214,160,0.12)]">
            <FiShield className="text-4xl text-[#00A87D]" />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#008A66] dark:text-[#00D6A0]">
            <span className="h-2 w-2 rounded-full bg-[#00D6A0]" />
            Security Center
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
            Your security
            <span className="block text-[#00A87D]">matters to us.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 sm:text-lg">
            Learn how to stay safe while using Happy Bounty. Explore our
            security practices, wallet safety guidance and tips for protecting
            yourself in the Web3 ecosystem.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#security-practices"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00D6A0] px-6 py-3.5 text-sm font-bold text-[#06130f] shadow-lg shadow-[#00D6A0]/10 transition hover:-translate-y-1 hover:bg-[#00bd8e]"
            >
              Explore Security
              <FiArrowUpRight />
            </a>

            <a
              href="#stay-safe"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-6 py-3.5 text-sm font-semibold transition hover:border-[#00D6A0] dark:border-white/10 dark:bg-white/[0.03]"
            >
              Stay Safe
              <FiLock />
            </a>
          </div>
        </section>

        {/* Security overview cards */}
        <section className="mb-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FiLock,
              title: "Wallet Protection",
              text: "Keep control of your wallet and protect your recovery phrase.",
            },
            {
              icon: FiGlobe,
              title: "Web3 Awareness",
              text: "Understand the risks of blockchain transactions and online scams.",
            },
            {
              icon: FiServer,
              title: "Platform Responsibility",
              text: "We aim to handle platform operations and user information responsibly.",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group rounded-2xl border border-black/[0.07] bg-white/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/40 dark:border-white/[0.07] dark:bg-white/[0.025]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-xl text-[#00A87D] transition group-hover:bg-[#00D6A0]/20">
                  <Icon />
                </div>

                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </section>

        {/* Main security practices */}
        <section id="security-practices" className="mb-24 scroll-mt-10">
          <div className="mb-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00A87D]">
              Our Security Approach
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Understanding security at Happy Bounty
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-400">
              Security involves more than technology. It also means helping
              users understand their responsibilities when interacting with
              wallets, applications and blockchain networks.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {securitySections.map((section) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.number}
                  className="group rounded-2xl border border-black/[0.07] bg-white/70 p-6 transition duration-300 hover:border-[#00D6A0]/40 hover:shadow-[0_15px_50px_rgba(0,214,160,0.05)] dark:border-white/[0.07] dark:bg-white/[0.025] sm:p-8"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D6A0]/10 text-xl text-[#00A87D]">
                      <Icon />
                    </div>

                    <span className="text-sm font-bold tracking-widest text-[#00A87D]/60">
                      {section.number}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold">{section.title}</h3>

                  <p className="mb-6 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {section.description}
                  </p>

                  <div className="space-y-3">
                    {section.points.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <FiCheckCircle className="mt-1 shrink-0 text-[#00A87D]" />
                        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Stay safe */}
        <section id="stay-safe" className="mb-24 scroll-mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] p-7 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#00D6A0]/10 blur-[90px]" />

            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D6A0]/15 text-2xl text-[#00A87D]">
                  <FiShield />
                </div>

                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#008A66] dark:text-[#00D6A0]">
                  Protect Yourself
                </p>

                <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                  Your wallet.
                  <br />
                  Your responsibility.
                </h2>

                <p className="mt-5 max-w-lg leading-7 text-gray-600 dark:text-gray-400">
                  Your wallet gives you control over your digital assets.
                  Protect your credentials, verify transactions and stay
                  alert whenever you interact with Web3 applications.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Never share your private keys or recovery phrase.",
                  "Always verify the website before connecting your wallet.",
                  "Review every transaction before signing.",
                  "Ignore suspicious messages promising free rewards.",
                  "Keep your wallet and browser software updated.",
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-black/[0.06] bg-white/70 p-4 dark:border-white/[0.07] dark:bg-black/20"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00D6A0]/15 text-sm font-bold text-[#008A66] dark:text-[#00D6A0]">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Important notice */}
        <section className="mb-20 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600 dark:text-amber-400">
              <FiAlertTriangle />
            </div>

            <div>
              <h3 className="mb-2 font-bold">Important Security Notice</h3>
              <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                Happy Bounty cannot recover lost wallet credentials or reverse
                confirmed blockchain transactions. Blockchain networks,
                external wallets and third-party services may have their own
                security risks. Always exercise caution and verify transactions
                before approving them.
              </p>
            </div>
          </div>
        </section>

        {/* Contact / reporting */}
        <section className="mb-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D6A0]/10 text-2xl text-[#00A87D]">
            <FiMail />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00A87D]">
            Help Us Improve
          </p>

          <h2 className="text-3xl font-black sm:text-4xl">
            Found a security issue?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600 dark:text-gray-400">
            If you discover suspicious activity, a possible vulnerability or
            anything that could put users at risk, please report it through
            Happy Bounty's official support channels. Do not publicly share
            sensitive vulnerability details.
          </p>
        </section>

        {/* Related links */}
        <section className="border-t border-black/10 pt-10 dark:border-white/10">
          <div className="mb-6 flex items-center gap-2">
            <FiFileText className="text-[#00A87D]" />
            <h3 className="font-bold">Related Information</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/privacy"
              className="group flex items-center justify-between rounded-xl border border-black/[0.07] bg-white/60 p-5 transition hover:border-[#00D6A0]/40 dark:border-white/[0.07] dark:bg-white/[0.025]"
            >
              <div>
                <h4 className="font-semibold">Privacy Policy</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Learn how your information is handled.
                </p>
              </div>
              <FiExternalLink className="text-gray-400 transition group-hover:text-[#00A87D]" />
            </Link>

            <Link
              to="/terms"
              className="group flex items-center justify-between rounded-xl border border-black/[0.07] bg-white/60 p-5 transition hover:border-[#00D6A0]/40 dark:border-white/[0.07] dark:bg-white/[0.025]"
            >
              <div>
                <h4 className="font-semibold">Terms of Service</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Understand the rules for using Happy Bounty.
                </p>
              </div>
              <FiExternalLink className="text-gray-400 transition group-hover:text-[#00A87D]" />
            </Link>
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-16 border-t border-black/10 pt-8 text-center dark:border-white/10">
          <div className="mb-3 flex items-center justify-center gap-2">
            <FiShield className="text-[#00A87D]" />
            <span className="font-bold tracking-tight">
              Happy <span className="text-[#00A87D]">Bounty</span>
            </span>
          </div>

          <p className="text-xs leading-6 text-gray-500 dark:text-gray-500">
            Building a safer environment for opportunities, contributions and
            rewards.
          </p>

          <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Happy Bounty. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Security;
