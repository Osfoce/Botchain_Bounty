
import { useEffect, useState } from "react";
import {
  FiShield,
  FiCheck,
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
    description: "Required for security and core website features.",
    required: true,
  },
  {
    key: "preferences",
    title: "Preference cookies",
    description: "Remember your settings and choices.",
  },
  {
    key: "analytics",
    title: "Analytics cookies",
    description: "Help us understand how visitors use Happy Bounty.",
  },
  {
    key: "marketing",
    title: "Marketing cookies",
    description: "Help measure campaigns and promotions.",
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
  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const colors = dark
    ? {
        panel: "#111713",
        text: "#F5FAF6",
        muted: "#AAB9AF",
        border: "#293B30",
        accent: "#00D6A0",
        accentText: "#06251B",
        secondary: "#1D2921",
        footer: "#829087",
      }
    : {
        panel: "#FFFFFF",
        text: "#18251D",
        muted: "#647269",
        border: "#E1EAE3",
        accent: "#008A66",
        accentText: "#FFFFFF",
        secondary: "#F2F7F3",
        footer: "#849087",
      };

  useEffect(() => {
    const consent = readConsent();

    if (consent) {
      setPreferences(consent.preferences);
    } else {
      setVisible(true);
    }
  }, []);

  const saveConsent = (choice, selected) => {
    const consent = {
      choice,
      preferences: {
        ...selected,
        necessary: true,
      },
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify(consent)
      );

      setPreferences(consent.preferences);
      setVisible(false);
      setShowSettings(false);

      window.dispatchEvent(
        new CustomEvent("happy-bounty-consent-updated", {
          detail: consent,
        })
      );
    } catch (error) {
      console.error(
        "Could not save cookie preferences:",
        error
      );
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

  const buttonStyle = {
    minHeight: "44px",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <>
      <style>
        {`
          @keyframes cookieSlide {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .hb-cookie-panel {
            animation: cookieSlide .25s ease-out;
          }

          .hb-cookie-action {
            transition: all .2s ease;
          }

          .hb-cookie-action:hover {
            filter: brightness(.95);
            transform: translateY(-1px);
          }

          .hb-cookie-action:focus-visible {
            outline: 3px solid ${colors.accent};
            outline-offset: 3px;
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-cookie-panel,
            .hb-cookie-action {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

      {/* Cookie popup */}
      {visible && (
        <div
          className="hb-cookie-panel fixed bottom-4 left-4 right-4 z-[9999] mx-auto w-auto max-w-[420px] overflow-y-auto rounded-2xl border p-5 sm:bottom-6 sm:left-6 sm:right-auto sm:p-6"
          style={{
            backgroundColor: colors.panel,
            color: colors.text,
            borderColor: colors.border,
            boxShadow: "0 12px 45px rgba(0,0,0,.18)",
            maxHeight: "calc(100dvh - 32px)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hb-cookie-title"
          aria-describedby="hb-cookie-description"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.accent,
                }}
              >
                <FiShield size={21} />
              </div>

              <span className="text-sm font-bold">
                Happy Bounty
              </span>
            </div>

            {showSettings && (
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Back to cookie options"
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ color: colors.muted }}
              >
                <FiX size={19} />
              </button>
            )}
          </div>

          {/* Title */}
          <h2
            id="hb-cookie-title"
            className="text-xl font-bold tracking-tight"
          >
            {showSettings
              ? "Cookie preferences"
              : "We value your privacy"}
          </h2>

          {/* Description */}
          <p
            id="hb-cookie-description"
            className="mt-2 text-sm leading-6"
            style={{ color: colors.muted }}
          >
            {showSettings
              ? "Choose which cookies you want to allow on Happy Bounty. Essential cookies are always enabled."
              : "We use cookies to keep Happy Bounty secure, improve your experience and understand how our platform is used. You are in control of your privacy."}
          </p>

          {/* Cookie preferences */}
          {showSettings && (
            <div
              className="mt-4 divide-y rounded-xl border px-3"
              style={{
                borderColor: colors.border,
              }}
            >
              {COOKIE_TYPES.map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center justify-between gap-3 py-3"
                  style={{ borderColor: colors.border }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {item.title}

                      {item.required && (
                        <span
                          className="ml-2 text-[10px]"
                          style={{ color: colors.accent }}
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
                    onChange={() =>
                      togglePreference(item.key)
                    }
                    className="h-4 w-4 shrink-0 cursor-pointer"
                    style={{ accentColor: colors.accent }}
                  />
                </label>
              ))}
            </div>
          )}

          {/* Policy links */}
          <div className="mt-3 flex gap-4 text-xs">
            <a
              href="/cookie-policy"
              className="font-semibold hover:underline"
              style={{ color: colors.accent }}
            >
              Cookie Policy
            </a>

            <a
              href="/privacy-policy"
              className="font-semibold hover:underline"
              style={{ color: colors.accent }}
            >
              Privacy Policy
            </a>
          </div>

          {/* Action buttons */}
          {!showSettings ? (
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="hb-cookie-action border"
                style={{
                  ...buttonStyle,
                  backgroundColor: "transparent",
                  color: colors.accent,
                  borderColor: colors.accent,
                }}
              >
                Customise
              </button>

              <button
                type="button"
                onClick={rejectAll}
                className="hb-cookie-action"
                style={{
                  ...buttonStyle,
                  backgroundColor: colors.secondary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Reject All
              </button>

              <button
                type="button"
                onClick={acceptAll}
                className="hb-cookie-action"
                style={{
                  ...buttonStyle,
                  backgroundColor: colors.accent,
                  color: colors.accentText,
                  border: `1px solid ${colors.accent}`,
                }}
              >
                Accept All
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={rejectAll}
                className="hb-cookie-action"
                style={{
                  ...buttonStyle,
                  backgroundColor: colors.secondary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Reject All
              </button>

              <button
                type="button"
                onClick={() =>
                  saveConsent("custom", preferences)
                }
                className="hb-cookie-action flex items-center justify-center gap-2"
                style={{
                  ...buttonStyle,
                  backgroundColor: colors.accent,
                  color: colors.accentText,
                  border: `1px solid ${colors.accent}`,
                }}
              >
                <FiCheck size={16} />
                Save Choices
              </button>
            </div>
          )}

          {/* Footer */}
          <p
            className="mt-4 text-center text-[11px]"
            style={{ color: colors.footer }}
          >
            Your privacy matters to Happy Bounty.
          </p>
        </div>
      )}
    </>
  );
}
