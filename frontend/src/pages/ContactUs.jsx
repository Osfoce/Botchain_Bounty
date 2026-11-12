
import { Link } from "react-router-dom";
import { useState } from "react";
import emailjs from "@emailjs/browser";

import {
  FiArrowLeft,
  FiMail,
  FiMessageCircle,
  FiUsers,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const CONTACT_EMAIL = "happybounty9@gmail.com";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
const NOTIFICATION_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID?.trim();
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

const INITIAL_FORM = {
  name: "",
  email: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [messageSent, setMessageSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessageSent(false);
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sending) return;

    setMessageSent(false);
    setSubmitError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setSubmitError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    if (
      !SERVICE_ID ||
      !TEMPLATE_ID ||
      !NOTIFICATION_TEMPLATE_ID ||
      !PUBLIC_KEY
    ) {
      console.error("EmailJS configuration is incomplete.");

      setSubmitError(
        `Our email service is temporarily unavailable. Please contact us directly at ${CONTACT_EMAIL}.`
      );
      return;
    }

    setSending(true);

    const templateParams = {
      name,
      email,
      message,
      reply_to: email,
    };

    let customerEmailSent = false;

    try {
      // 1. Send automatic confirmation to the customer.
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        {
          publicKey: PUBLIC_KEY,
        }
      );

      customerEmailSent = true;

      // 2. Send the customer's message to Happy Bounty.
      await emailjs.send(
        SERVICE_ID,
        NOTIFICATION_TEMPLATE_ID,
        templateParams,
        {
          publicKey: PUBLIC_KEY,
        }
      );

      setMessageSent(true);
      setForm(INITIAL_FORM);

    } catch (error) {
      console.error("EmailJS submission failed:", error);
      console.error("EmailJS status:", error?.status);
      console.error("EmailJS response:", error?.text);

      if (customerEmailSent) {
        setSubmitError(
          `Your confirmation email was sent, but we couldn't deliver your message to the Happy Bounty team. Please contact us directly at ${CONTACT_EMAIL}.`
        );
      } else {
        setSubmitError(
          `We couldn't send your message. ${
            error?.text || "Please check your EmailJS settings and try again."
          }`
        );
      }
    } finally {
      setSending(false);
    }
  };

  const inputClasses = `
    w-full rounded-xl border border-black/10 bg-[#F3F5F3]
    py-3.5 pl-11 pr-4 text-sm text-black outline-none
    placeholder:text-gray-300 transition-all duration-200
    focus:border-[#00D6A0]/60 focus:bg-white
    focus:ring-2 focus:ring-[#00D6A0]/10
    disabled:cursor-not-allowed disabled:opacity-60
  `;

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

        <div className="absolute right-[-100px] top-1/2 h-72 w-72 rounded-full bg-[#00D6A0]/[0.045] blur-[130px]" />

        <div className="absolute bottom-[-100px] left-[-80px] h-64 w-64 rounded-full bg-[#00D6A0]/[0.04] blur-[120px]" />
      </div>

      {/* CONTENT */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 lg:px-10">

        {/* BACK BUTTON */}
        <div className="mb-10 sm:mb-14">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/75 px-3.5 py-2 text-sm font-medium text-black/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00D6A0]/50 hover:bg-white hover:text-black active:scale-[0.98]"
          >
            <FiArrowLeft className="text-base text-[#007E62] transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back</span>
          </Link>
        </div>

        {/* HEADER */}
        <section className="mb-10 max-w-3xl sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00D6A0]/30 bg-[#00D6A0]/[0.07] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#007E62] sm:text-xs">
              Get In Touch
            </span>
          </div>

          <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-[#171714] sm:text-4xl md:text-5xl">
            Contact <span className="text-[#007E62]">Us</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/50 sm:text-base sm:leading-7 md:text-lg">
            Have a question, partnership request, or feedback? Send us a
            message and our team will get back to you.
          </p>
        </section>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">

          {/* CONTACT FORM */}
          <section className="relative overflow-hidden rounded-3xl border border-black/[0.09] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-7 md:p-8">

            <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#00D6A0]/[0.07] blur-3xl" />

            <div className="relative z-10">

              {/* FORM HEADER */}
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.08] text-[#007E62]">
                  <FiMessageCircle className="text-lg" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#171714] sm:text-2xl">
                    Send us a message
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-black/40">
                    Fill out the form and we'll get back to you.
                  </p>
                </div>
              </div>

              {/* SUCCESS MESSAGE */}
              {messageSent && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-[#00D6A0]/30 bg-[#00D6A0]/[0.08] p-4"
                >
                  <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-[#008A66]" />

                  <div>
                    <p className="text-sm font-bold text-[#006B50]">
                      Message sent successfully!
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#006B50]/70">
                      Thank you for reaching out. We appreciate your message.
                    </p>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {submitError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <FiAlertCircle className="mt-0.5 shrink-0 text-lg text-red-500" />

                  <p className="break-words text-sm leading-5 text-red-700">
                    {submitError}
                  </p>
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50"
                  >
                    Name
                  </label>

                  <div className="relative">
                    <FiUsers className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/25" />

                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={inputClasses}
                      autoComplete="name"
                      maxLength={100}
                      required
                      disabled={sending}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/25" />

                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                      className={inputClasses}
                      autoComplete="email"
                      maxLength={254}
                      required
                      disabled={sending}
                    />
                  </div>
                </div>

                {/* MESSAGE */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/50"
                  >
                    Message
                  </label>

                  <div className="relative">
                    <FiMessageCircle className="pointer-events-none absolute left-4 top-4 text-black/25" />

                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your message..."
                      rows={5}
                      maxLength={5000}
                      className="min-h-[130px] w-full resize-y rounded-xl border border-black/10 bg-[#F3F5F3] py-3.5 pl-11 pr-4 text-sm leading-6 text-black outline-none placeholder:text-gray-300 transition-all duration-200 focus:border-[#00D6A0]/60 focus:bg-white focus:ring-2 focus:ring-[#00D6A0]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                      disabled={sending}
                    />
                  </div>

                  <p className="mt-1.5 text-right text-[11px] text-black/30">
                    {form.message.length}/5000
                  </p>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={sending}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#171714] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#292924] hover:shadow-[0_12px_35px_rgba(0,0,0,0.16)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {sending ? (
                    <>
                      <FiLoader className="animate-spin text-base text-[#00D6A0]" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <FiSend className="text-base text-[#00D6A0] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-black/35">
                  Your message will be sent securely to the Happy Bounty team.
                </p>

              </form>
            </div>
          </section>

          {/* RIGHT INFO SECTION */}
          <div className="flex flex-col gap-4">

            {/* OFFICIAL CONTACT EMAIL */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group relative overflow-hidden rounded-2xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.045] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00D6A0]/50 hover:bg-[#00D6A0]/[0.08] sm:p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/25 bg-[#00D6A0]/[0.10] text-[#007E62] transition-transform duration-300 group-hover:scale-110">
                  <FiMail className="text-lg" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#007E62]">
                    Official Email
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-[#171714]">
                    {CONTACT_EMAIL}
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Click to contact the Happy Bounty team
                  </p>
                </div>

                <FiSend className="shrink-0 text-[#007E62] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </a>

            {/* SUPPORT */}
            <div className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00D6A0]/35 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#007E62]">
                  <FiMessageCircle />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#171714]">
                    Support
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-black/45">
                    We respond within 24–48 hours for user inquiries,
                    technical questions, and general support.
                  </p>
                </div>
              </div>
            </div>

            {/* PARTNERSHIPS */}
            <div className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00D6A0]/35 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.07] text-[#007E62]">
                  <FiUsers />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#171714]">
                    Partnerships
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-black/45">
                    Looking to collaborate? We're open to Web3 projects,
                    creators, influencers, and startups.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT NOTE */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#00D6A0]/20 bg-[#00D6A0]/[0.05] px-5 py-4">
              <FiMail className="shrink-0 text-[#007E62]" />

              <p className="text-xs leading-5 text-black/45">
                For urgent account or platform issues, please include as
                much relevant information as possible.
              </p>
            </div>

          </div>
        </div>

        <div className="h-8 sm:h-12" />
      </main>
    </div>
  );
}
