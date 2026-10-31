
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import ConnectConfig from "./ConnectConfig";
import HappyBounty from "../assets/images/happy-bounty-logo.png";

function AuthModal({ isOpen, onClose }) {
  // Prevent background page from scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="
        auth-modal-overlay app-modal-overlay
        fixed inset-0 z-[100]
        flex min-h-screen
        items-center justify-center
        overflow-y-auto
        p-4
        backdrop-blur-md
        sm:p-6
      "
      onClick={onClose}
    >
      <div
        className="
          auth-modal-card app-modal-panel
          relative w-full max-w-sm
          rounded-2xl
          px-5 py-5
          sm:px-6 sm:py-6
          animate-[modalIn_0.25s_ease-out]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="
            auth-modal-close
            absolute right-3.5 top-3.5
            flex h-8 w-8 items-center justify-center
            rounded-full
            text-sm
            transition-all duration-200
          "
        >
          <FiX className="text-base" />
        </button>

        {/* HEADER */}
        <div className="mb-5 text-center">

          {/* HAPPY BOUNTY LOGO */}
          <div
            className="
              auth-modal-logo
              relative mx-auto mb-3
              flex h-16 w-16
              items-center justify-center
              rounded-full
              p-1
              bg-[#00D6A0]/10
              ring-2 ring-[#00D6A0]/40
              shadow-[0_0_30px_rgba(0,214,160,0.20)]
            "
          >
            <div
              className="
                flex h-full w-full
                items-center justify-center
                overflow-hidden
                rounded-full
                bg-white
              "
            >
              <img
                src={HappyBounty}
                alt="Happy Bounty Logo"
                className="
                  h-full w-full
                  object-contain
                  p-1
                  transition-transform duration-300
                  hover:scale-105
                "
              />
            </div>
          </div>

          <h2 className="auth-modal-title text-xl font-black tracking-tight sm:text-2xl">
            Welcome to Happy Bounty
          </h2>

          <p className="auth-modal-subtitle mt-1.5 text-xs font-medium sm:text-sm">
            Connect your wallet to continue
          </p>
        </div>

        {/* WALLET CONNECT */}
        <div className="space-y-2.5">
          <ConnectConfig />
        </div>

        {/* DIVIDER */}
        <div className="my-4 flex items-center gap-3">
          <div className="auth-modal-divider h-px flex-1" />

          <span className="auth-modal-muted text-[10px] font-bold uppercase tracking-[0.15em]">
            Or
          </span>

          <div className="auth-modal-divider h-px flex-1" />
        </div>

        {/* EMAIL LOGIN */}
        <form className="space-y-2.5">
          <div>
            <label className="auth-modal-label mb-1.5 block text-[11px] font-bold">
              Email
            </label>

            <input
              type="email"
              placeholder="Email login coming soon"
              disabled
              className="
                auth-modal-input
                w-full
                rounded-xl
                px-3.5 py-2.5
                text-sm font-medium
                outline-none
                cursor-not-allowed
              "
            />
          </div>

          <button
            type="button"
            disabled
            className="
              auth-modal-coming-soon
              w-full
              rounded-xl
              py-2.5
              text-sm font-bold
              cursor-not-allowed
            "
          >
            Coming Soon
          </button>
        </form>

        {/* FOOTER */}
        <p className="auth-modal-footer mt-4 text-center text-[10px] font-medium leading-relaxed sm:text-xs">
          By connecting, you agree to Happy Bounty's terms and conditions.
        </p>

        {/* GREEN ACCENT */}
        <div
          className="
            pointer-events-none
            absolute bottom-0 left-1/2
            h-[2px] w-24
            -translate-x-1/2
            rounded-full
            bg-[#00D6A0]
          "
        />
      </div>

      {/* =====================================================
          THEME + ANIMATION STYLES
      ===================================================== */}

      <style>{`
        /* =====================================================
           LIGHT MODE
        ===================================================== */

        .auth-modal-overlay {
          background: rgba(0, 0, 0, 0.10);
        }

        .auth-modal-card {
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
          color: #111111;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.22);
        }

        .auth-modal-close {
          color: rgba(0, 0, 0, 0.40);
        }

        .auth-modal-close:hover {
          background: rgba(0, 214, 160, 0.10);
          color: #00D6A0;
        }

        .auth-modal-title {
          color: #111111;
        }

        .auth-modal-subtitle {
          color: rgba(0, 0, 0, 0.50);
        }

        .auth-modal-divider {
          background: rgba(0, 0, 0, 0.09);
        }

        .auth-modal-muted {
          color: rgba(0, 0, 0, 0.35);
        }

        .auth-modal-label {
          color: rgba(0, 0, 0, 0.60);
        }

        .auth-modal-input {
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(0, 0, 0, 0.025);
          color: rgba(0, 0, 0, 0.40);
        }

        .auth-modal-input::placeholder {
          color: rgba(0, 0, 0, 0.25);
        }

        .auth-modal-coming-soon {
          border: 1px solid rgba(0, 0, 0, 0.07);
          background: rgba(0, 0, 0, 0.045);
          color: rgba(0, 0, 0, 0.35);
        }

        .auth-modal-footer {
          color: rgba(0, 0, 0, 0.40);
        }

        /* LOGO LIGHT MODE */
        .auth-modal-logo {
          background: rgba(0, 214, 160, 0.09);
        }

        /* =====================================================
           DARK MODE
        ===================================================== */

        .dark .auth-modal-overlay {
          background: rgba(0, 0, 0, 0.58);
        }

        .dark .auth-modal-card {
          border-color: rgba(0, 214, 160, 0.16);
          background: #111311;
          color: #ffffff;
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.55),
            0 0 40px rgba(0, 214, 160, 0.04);
        }

        .dark .auth-modal-close {
          color: rgba(255, 255, 255, 0.40);
        }

        .dark .auth-modal-close:hover {
          background: rgba(0, 214, 160, 0.10);
          color: #00D6A0;
        }

        .dark .auth-modal-title {
          color: #ffffff;
        }

        .dark .auth-modal-subtitle {
          color: rgba(255, 255, 255, 0.50);
        }

        .dark .auth-modal-divider {
          background: rgba(255, 255, 255, 0.10);
        }

        .dark .auth-modal-muted {
          color: rgba(255, 255, 255, 0.35);
        }

        .dark .auth-modal-label {
          color: rgba(255, 255, 255, 0.62);
        }

        .dark .auth-modal-input {
          border-color: rgba(255, 255, 255, 0.09);
          background: rgba(255, 255, 255, 0.045);
          color: rgba(255, 255, 255, 0.45);
        }

        .dark .auth-modal-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .dark .auth-modal-coming-soon {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.35);
        }

        .dark .auth-modal-footer {
          color: rgba(255, 255, 255, 0.40);
        }

        /* LOGO DARK MODE */
        .dark .auth-modal-logo {
          background: rgba(0, 214, 160, 0.12);
          box-shadow: 0 0 35px rgba(0, 214, 160, 0.13);
        }

        /* =====================================================
           MODAL ANIMATION
        ===================================================== */

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-modal-card {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AuthModal;
