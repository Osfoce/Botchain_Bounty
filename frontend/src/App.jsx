
import { useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";

import { useAccount } from "wagmi";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Create from "./pages/Create";
import BountyDetail from "./pages/BountyDetail";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import FAQPage from "./pages/Faqs";
import WhitepaperPage from "./pages/WhitePaper";
import ContactUs from "./pages/ContactUs";
import Docs from "./pages/Docs";
import CookieConsent from "./pages/CookieConsent";
import Privacy from "./pages/Privacy";
import TermsOfUse from "./pages/TermsOfUse";

import LoadingScreen from "./components/LoadingScreen";
import { useTheme } from "./context/ThemeContext";

function RequireWallet({ children }) {
  const { address, isConnected, status } = useAccount();

  if (status === "connecting" || status === "reconnecting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080908] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#00D6A0]/20 border-t-[#00D6A0]" />

          <p className="mt-4 text-sm text-gray-400">
            Checking wallet connection...
          </p>
        </div>
      </div>
    );
  }

  if (!address || !isConnected) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080908] px-6 text-center text-white">
      <div>
        <h1 className="text-5xl font-bold text-[#00D6A0]">
          404
        </h1>

        <p className="mt-3 text-lg">
          Page not found
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[#00D6A0] px-5 py-3 font-semibold text-black transition hover:bg-[#00B88A]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function AppRoutes({ dark, setDark }) {
  return (
    <>
      <Routes>
        {/* PUBLIC PAGES */}

        <Route
          path="/"
          element={<LandingPage dark={dark} setDark={setDark} />}
        />

        <Route
          path="/faqs"
          element={<FAQPage dark={dark} setDark={setDark} />}
        />

        <Route
          path="/whitepaper"
          element={<WhitepaperPage dark={dark} setDark={setDark} />}
        />

        <Route
          path="/contact"
          element={<ContactUs dark={dark} setDark={setDark} />}
        />

        <Route
          path="/docs"
          element={<Docs dark={dark} setDark={setDark} />}
        />

        {/* PRIVACY POLICY */}

        <Route
          path="/privacy"
          element={<Privacy dark={dark} setDark={setDark} />}
        />

        {/* TERMS OF USE */}

        <Route
          path="/terms"
          element={<TermsOfUse dark={dark} setDark={setDark} />}
        />

        {/* WALLET-PROTECTED PAGES */}

        <Route
          path="/dashboard"
          element={
            <RequireWallet>
              <Dashboard dark={dark} setDark={setDark} />
            </RequireWallet>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireWallet>
              <Profile dark={dark} setDark={setDark} />
            </RequireWallet>
          }
        />

        <Route
          path="/create"
          element={
            <RequireWallet>
              <Create dark={dark} setDark={setDark} />
            </RequireWallet>
          }
        />

        <Route
          path="/bounty/:id"
          element={
            <RequireWallet>
              <BountyDetail dark={dark} setDark={setDark} />
            </RequireWallet>
          }
        />

        <Route
          path="/analytics"
          element={
            <RequireWallet>
              <Analytics dark={dark} setDark={setDark} />
            </RequireWallet>
          }
        />

        <Route
          path="/admin-224466"
          element={
            <RequireWallet>
              <Admin dark={dark} setDark={setDark} />
            </RequireWallet>
          }
        />

        {/* 404 PAGE */}

        <Route path="*" element={<NotFound />} />
      </Routes>

      <CookieConsent />
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const { dark, setDark } = useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-300">
        {loading && (
          <LoadingScreen onComplete={() => setLoading(false)} />
        )}

        <AppRoutes dark={dark} setDark={setDark} />
      </div>
    </BrowserRouter>
  );
}

export default App;
