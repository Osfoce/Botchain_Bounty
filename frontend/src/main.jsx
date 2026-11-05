
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import config from "./rainbowKitConfig";
import { WagmiProvider } from "wagmi";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { supportedChains } from "./rainbowChains.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from ".//context/AuthContext.jsx"

const queryClient = new QueryClient();

function ThemedRainbowKitProvider({ children }) {
  const { dark, accent, accentForeground } = useTheme();

  return (
    <RainbowKitProvider
      chains={supportedChains}
      theme={
        dark
          ? darkTheme({
              accentColor: accent,
              accentColorForeground: accentForeground,
              borderRadius: "medium",
            })
          : lightTheme({
              accentColor: accent,
              accentColorForeground: accentForeground,
              borderRadius: "medium",
            })
      }
    >
      {children}
    </RainbowKitProvider>
  );
}

function AppProviders() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedRainbowKitProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px",
              },
            }}
          />
          <App />
        </ThemedRainbowKitProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <AppProviders />
    </QueryClientProvider>
  </WagmiProvider>
);
