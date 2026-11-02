
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronDown,
  FiSearch,
  FiMessageCircle,
} from "react-icons/fi";

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I earn on Happy Bounty?",
      answer:
        "Users earn rewards by completing campaigns, referrals, social tasks, and community activities.",
    },
    {
      question: "How long do withdrawals take?",
      answer:
        "Withdrawals are usually processed within 24–72 hours after verification.",
    },
    {
      question: "Can I create multiple accounts?",
      answer:
        "No. Multiple accounts may lead to account suspension.",
    },
    {
      question: "Why was my submission rejected?",
      answer:
        "Your submission may be rejected if task instructions were not followed correctly.",
    },
  ];

  return (
    <div className="theme-page min-h-screen overflow-x-hidden bg-[#F3F5F3] text-[#171714]">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,23,20,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,20,0.035) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00D6A0]/[0.07] blur-[120px]" />

        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#00D6A0]/[0.05] blur-[120px]" />
      </div>

      {/* CONTENT */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 lg:px-10">
        {/* HEADER */}
        <section className="relative mb-10 flex flex-col items-center text-center sm:mb-14">
          {/* BACK BUTTON */}
          <div className="mb-10 flex w-full justify-start sm:mb-12">
            <Link
              to="/"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-xl
                border border-black/10
                bg-white/70
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
              <FiArrowLeft className="text-base text-[#00A87D] transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Back</span>
            </Link>
          </div>

          {/* SMALL LABEL */}
          <div
            className="
              mb-4
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
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#007E62] sm:text-xs">
              Help Center
            </span>
          </div>

          {/* TITLE */}
          <h1
            className="
              max-w-4xl
              text-3xl
              font-black
              leading-[1.08]
              tracking-tight
              text-[#171714]
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            Frequently Asked{" "}
            <span className="text-[#00A87D]">Questions</span>
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-4
              max-w-2xl
              px-2
              text-sm
              leading-6
              text-black/50
              sm:mt-5
              sm:text-base
              sm:leading-7
              md:text-lg
            "
          >
            Find answers about rewards, withdrawals, campaigns,
            referrals, and everything related to Happy Bounty.
          </p>
        </section>

        {/* SEARCH */}
        <div className="mx-auto mb-8 w-full max-w-2xl sm:mb-10">
          <div
            className="
              group
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-black/10
              bg-white
              px-4
              py-3.5
              shadow-[0_10px_35px_rgba(0,0,0,0.05)]
              transition-all
              duration-200
              focus-within:border-[#00D6A0]/60
              focus-within:shadow-[0_12px_40px_rgba(180,140,25,0.08)]
            "
          >
            <FiSearch className="shrink-0 text-lg text-black/30 transition-colors group-focus-within:text-[#00A87D]" />

            <input
              type="text"
              placeholder="Search questions..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                text-black
                outline-none
                placeholder:text-black/30
                sm:text-base
              "
            />
          </div>
        </div>

        {/* FAQ CARDS */}
        <section className="mx-auto w-full max-w-3xl space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-black/[0.09]
                bg-white
                shadow-[0_6px_25px_rgba(0,0,0,0.035)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#00D6A0]/35
                hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                open:border-[#00D6A0]/50
                open:shadow-[0_12px_35px_rgba(180,140,25,0.07)]
              "
            >
              <summary
                className="
                  flex
                  cursor-pointer
                  list-none
                  items-center
                  justify-between
                  gap-4
                  px-4
                  py-4
                  sm:px-5
                  sm:py-5
                "
              >
                {/* QUESTION */}
                <span
                  className="
                    min-w-0
                    text-left
                    text-sm
                    font-semibold
                    leading-5
                    text-black/80
                    transition-colors
                    group-hover:text-black
                    sm:text-base
                    sm:leading-6
                  "
                >
                  {faq.question}
                </span>

                {/* ARROW */}
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-black/10
                    bg-[#F3F5F3]
                    text-black/40
                    transition-all
                    duration-300
                    group-hover:border-[#00D6A0]/40
                    group-hover:text-[#007E62]
                    group-open:rotate-180
                    group-open:border-[#00D6A0]/50
                    group-open:bg-[#00D6A0]/10
                    group-open:text-[#007E62]
                  "
                >
                  <FiChevronDown className="text-sm" />
                </span>
              </summary>

              {/* ANSWER */}
              <div className="border-t border-black/[0.07] px-4 pb-5 pt-4 sm:px-5">
                <p
                  className="
                    text-left
                    text-sm
                    leading-6
                    text-black/50
                    sm:text-[15px]
                    sm:leading-7
                  "
                >
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </section>

        {/* SUPPORT */}
        <section
          className="
            mx-auto
            mt-10
            w-full
            max-w-3xl
            overflow-hidden
            rounded-2xl
            border
            border-[#00D6A0]/25
            bg-white
            p-6
            text-center
            shadow-[0_12px_40px_rgba(0,0,0,0.05)]
            sm:mt-14
            sm:rounded-3xl
            sm:p-8
          "
        >
          {/* TOP ACCENT */}
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-[#00D6A0]" />

          {/* ICON */}
          <div
            className="
              mx-auto
              mb-4
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-[#00D6A0]/25
              bg-[#00D6A0]/[0.08]
              text-[#007E62]
            "
          >
            <FiMessageCircle className="text-lg" />
          </div>

          {/* TITLE */}
          <h2 className="text-2xl font-bold tracking-tight text-[#171714] sm:text-3xl">
            Still have questions?
          </h2>

          {/* DESCRIPTION */}
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45 sm:text-base">
            Our support team is ready to help you whenever you need us.
          </p>

          {/* CONTACT BUTTON */}
          <Link
            to="/contact"
            className="
              mt-5
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-[#171714]
              px-6
              py-3
              text-sm
              font-bold
              text-white
              shadow-[0_8px_25px_rgba(0,0,0,0.12)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#292924]
              hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)]
              active:scale-[0.98]
              sm:px-7
            "
          >
            Contact Support
          </Link>
        </section>

        {/* BOTTOM SPACE */}
        <div className="h-8 sm:h-12" />
      </main>
    </div>
  );
}

