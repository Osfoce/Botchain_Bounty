import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiCheck,
  FiSettings,
  FiShield,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const CONSENT_KEY = "happy-bounty-cookie-consent";

const DEFAULT_PREFERENCES = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const COOKIE_TYPES = [
  {
    key: "necessary",
    title: "Essential cookies",
    description: "Keep Happy Bounty secure and make core features work.",
    icon: FiShield,
    required: true,
  },
  {
    key: "preferences",
    title: "Preference cookies",
    description: "Remember your settings and choices.",
    icon: FiSliders,
  },
  {
    key: "analytics",
    title: "Analytics cookies",
    description: "Help us understand how people use Happy Bounty.",
    icon: FiBarChart2,
  },
  {
    key: "marketing",
    title: "Marketing cookies",
    description: "Help measure campaigns and show relevant promotions.",
    icon: FiArrowUpRight,
  },
];

function readConsent() {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      !["all", "rejected", "custom"].includes(parsed.choice) ||
      !parsed.preferences ||
      typeof parsed.preferences !== "object"
    ) {
      return null;
    }

    return {
      ...parsed,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...parsed.preferences,
        necessary: true,
      },
    };
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const { dark } = useTheme();

  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const colors = dark
    ? {
        panel: "#111713",
        card: "#18211b",
        text: "#f5faf6",
        muted: "#b3c0b7",
        subtle: "#87958b",
        border: "#315b45",
        accent: "#65e6a0",
        accentHover: "#82efb2",
        accentText: "#082516",
        secondary: "#202b23",
        secondaryHover: "#2a382e",
        divider: "#2c3a30",
      }
    : {
        panel: "#ffffff",
        card: "#f7faf7",
        text: "#18251d",
        muted: "#5c6b61",
        subtle: "#78857c",
        border: "#dce8df",
        accent: "#167b48",
        accentHover: "#12673c",
        accentText: "#ffffff",
        secondary: "#f1f5f1",
        secondaryHover: "#e6eee7",
        divider: "#e4ebe5",
      };

  useEffect(() => {
    const consent = readConsent();

    if (consent) {
      setPreferences(consent.preferences);
    } else {
      setVisible(true);
    }
  }, []);

  const saveConsent = (choice, selectedPreferences) => {
    const consent = {
      choice,
      preferences: {
        ...selectedPreferences,
        necessary: true,
      },
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

      setPreferences(consent.preferences);
      setVisible(false);
      setShowSettings(false);

      window.dispatchEvent(
        new CustomEvent("happy-bounty-consent-updated", {
          detail: consent,
        })
      );
    } catch {
      setVisible(true);
    }
  };

  const acceptAll = () => {
    saveConsent("all", {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAll = () => {
    saveConsent("rejected", DEFAULT_PREFERENCES);
  };

  const togglePreference = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const openSettings = () => {
    const saved = readConsent();

    if (saved) {
      setPreferences(saved.preferences);
    }

    setShowSettings(true);
    setVisible(true);
  };

  const buttonBase =
    "hb-cookie-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold";

  const secondaryStyle = {
    backgroundColor: colors.secondary,
    color: colors.text,
    borderColor: colors.divider,
  };

  const primaryStyle = {
    backgroundColor: colors.accent,
    color: colors.accentText,
    borderColor: colors.accent,
  };

  return (
    <>
      <style>
        {`
          @keyframes hb-cookie-enter {
            from {
              opacity: 0;
              transform: translateY(12px) scale(.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .hb-cookie-animate {
            animation: hb-cookie-enter 240ms ease-out both;
          }

          .hb-cookie-btn {
            transition:
              background-color 160ms ease,
              border-color 160ms ease,
              color 160ms ease,
              transform 160ms ease,
              box-shadow 160ms ease;
          }

          .hb-cookie-btn:hover {
            transform: translateY(-1px);
          }

          .hb-cookie-btn:focus-visible,
          .hb-cookie-settings:focus-visible,
          .hb-cookie-link:focus-visible {
            outline: 3px solid ${colors.accent};
            outline-offset: 3px;
          }

          .hb-cookie-btn:active {
            transform: translateY(0);
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-cookie-animate,
            .hb-cookie-btn {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

      {!visible && (
        <button
          type="button"
          onClick={openSettings}
          aria-label="Manage cookie preferences"
          title="Cookie settings"
          className="hb-cookie-settings fixed bottom-20 right-5 z-[9998] flex h-12 w-12 items-center justify-center rounded-full border shadow-lg sm:bottom-24 sm:right-6"
          style={{
            backgroundColor: colors.panel,
            color: colors.accent,
            borderColor: colors.border,
            boxShadow: "0 8px 28px rgba(15, 35, 20, .16)",
          }}
        >
          <FiSettings size={20} />
        </button>
      )}

      {visible && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="hb-cookie-title"
          aria-describedby="hb-cookie-description"
          className="hb-cookie-animate fixed bottom-3 left-3 right-3 z-[9999] mx-auto max-h-[calc(100dvh-1.5rem)] w-auto max-w-[430px] overflow-y-auto overscroll-contain rounded-[24px] border p-4 sm:bottom-6 sm:left-auto sm:right-6 sm:p-6"
          style={{
            backgroundColor: colors.panel,
            color: colors.text,
            borderColor: colors.border,
            boxShadow: "0 20px 70px rgba(12, 30, 17, .22)",
          }}
        >
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11"
                style={{
                  color: colors.accent,
                  backgroundColor: colors.secondary,
                }}
                aria-hidden="true"
              >
                <FiShield size={22} />
              </div>

              <div className="min-w-0">
                <p
                  className="text-xs font-bold uppercase tracking-[0.14em]"
                  style={{ color: colors.accent }}
                >
                  Happy Bounty
                </p>

                <p
                  className="mt-0.5 text-xs sm:text-sm"
                  style={{ color: colors.muted }}
                >
                  Your privacy, your choice
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={rejectAll}
              aria-label="Reject optional cookies and close"
              title="Reject optional cookies"
              className="hb-cookie-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-transparent p-0"
              style={{
                color: colors.muted,
                backgroundColor: "transparent",
              }}
            >
              <FiX size={19} />
            </button>
          </div>

          {/* Title and description */}
          <div className="mb-3 sm:mb-4">
            <h2
              id="hb-cookie-title"
              className="text-lg font-bold leading-tight tracking-tight sm:text-[22px]"
            >
              {showSettings
                ? "Manage your cookies"
                : "We value your privacy"}
            </h2>

            <p
              id="hb-cookie-description"
              className="mt-2 text-xs leading-5 sm:text-sm sm:leading-6"
              style={{ color: colors.muted }}
            >
              {showSettings
                ? "Choose which optional cookies you allow. Essential cookies are always on."
                : "We use cookies to keep Happy Bounty secure, remember your preferences, and understand how the platform is used. You’re in control of what you share."}
            </p>
          </div>

          {/* Cookie preferences */}
          {showSettings && (
            <div
              className="mb-3 divide-y overflow-hidden rounded-2xl border px-3 sm:mb-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.divider,
              }}
            >
              {COOKIE_TYPES.map((item, index) => {
                const Icon = item.icon;

                return (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 py-3 sm:py-3.5"
                    style={{ borderColor: colors.divider }}
                  >
                    {/* Mobile: numbered indicator. Desktop: original icon. */}
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold sm:hidden"
                      style={{
                        backgroundColor: colors.secondary,
                        color: colors.accent,
                      }}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>

                    <span
                      className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex"
                      style={{
                        backgroundColor: colors.secondary,
                        color: colors.accent,
                      }}
                      aria-hidden="true"
                    >
                      <Icon size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {item.title}

                        {item.required && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{
                              backgroundColor: colors.secondary,
                              color: colors.accent,
                            }}
                          >
                            Always on
                          </span>
                        )}
                      </span>

                      <span
                        className="mt-1 block text-xs leading-5"
                        style={{ color: colors.muted }}
                      >
                        {item.description}
                      </span>
                    </span>

                    <input
                      type="checkbox"
                      checked={Boolean(preferences[item.key])}
                      disabled={item.required}
                      onChange={() => togglePreference(item.key)}
                      aria-label={item.title}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                      style={{ accentColor: colors.accent }}
                    />
                  </label>
                );
              })}
            </div>
          )}

          {/* Policy links */}
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:mb-4">
            <a
              href="/cookie-policy"
              className="hb-cookie-link inline-flex items-center gap-1 font-semibold hover:underline"
              style={{ color: colors.accent }}
            >
              Cookie Policy
              <FiArrowUpRight size={13} />
            </a>

            <span aria-hidden="true" style={{ color: colors.subtle }}>
              ·
            </span>

            <a
              href="/privacy-policy"
              className="hb-cookie-link inline-flex items-center gap-1 font-semibold hover:underline"
              style={{ color: colors.accent }}
            >
              Privacy Policy
              <FiArrowUpRight size={13} />
            </a>
          </div>

          {/* Action buttons */}
          {showSettings ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={rejectAll}
                className={buttonBase}
                style={secondaryStyle}
              >
                Reject optional
              </button>

              <button
                type="button"
                onClick={() => saveConsent("custom", preferences)}
                className={buttonBase}
                style={primaryStyle}
              >
                <FiCheck size={16} />
                Save choices
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="col-span-2 mt-1 w-full py-2 text-xs font-semibold"
                style={{ color: colors.muted }}
              >
                Back to cookie options
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={acceptAll}
                  className={buttonBase}
                  style={primaryStyle}
                >
                  <FiCheck size={16} />
                  Accept all
                </button>

                <button
                  type="button"
                  onClick={rejectAll}
                  className={buttonBase}
                  style={secondaryStyle}
                >
                  Reject optional
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="hb-cookie-btn mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                style={{
                  backgroundColor: "transparent",
                  color: colors.muted,
                  borderColor: colors.divider,
                }}
              >
                <FiSettings size={15} />
                Manage preferences
              </button>
            </>
          )}

          {/* Footer */}
          <p
            className="mt-3 text-center text-[10px] leading-4 sm:mt-4"
            style={{ color: colors.subtle }}
          >
            You can change your cookie choices at any time in settings.
          </p>
        </section>
      )}
    </>
  );
}