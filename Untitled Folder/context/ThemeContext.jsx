import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

const ThemeContext = createContext(null);

const NETWORK_THEMES = {
  arc: {
    accent: "#D4A017",
    secondary: "#B28B20",
    foreground: "#171714",
    accentBg: "rgba(212, 160, 23, 0.12)",
    accentBorder: "rgba(212, 160, 23, 0.38)",
  },
  botchain: {
    accent: "#00D6A0",
    secondary: "#00A87D",
    foreground: "#06251c",
    accentBg: "rgba(0, 214, 160, 0.1)",
    accentBorder: "rgba(0, 214, 160, 0.35)",
  },
};

export function ThemeProvider({ children }) {
  const { chainId } = useAccount();
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  // Arc mainnet uses gold. Botchain keeps the existing Happy Bounty green.
  const network = chainId === 5042 ? "arc" : "botchain";
  const palette = NETWORK_THEMES[network];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.network = network;

    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-secondary", palette.secondary);
    root.style.setProperty("--accent-bg", palette.accentBg);
    root.style.setProperty("--accent-border", palette.accentBorder);
    root.style.setProperty("--accent-foreground", palette.foreground);

    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // The theme still works for the current session if storage is unavailable.
    }
  }, [dark, network, palette]);

  return (
    <ThemeContext.Provider
      value={{
        dark,
        setDark,
        network,
        chainId,
        accent: palette.accent,
        accentSecondary: palette.secondary,
        accentForeground: palette.foreground,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}