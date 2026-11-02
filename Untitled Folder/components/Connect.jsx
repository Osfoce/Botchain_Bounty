
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { FiChevronDown, FiLogOut, FiRadio } from "react-icons/fi";
import { useDisconnect } from "wagmi";
import { useTheme } from "../context/ThemeContext";

function Connect() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { disconnect } = useDisconnect();
  const { dark } = useTheme();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        authenticationStatus,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        // Wait until RainbowKit restores the wallet session.
        const ready = mounted && authenticationStatus !== "loading";

        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === "authenticated");

        return (
          <>
            {/* Desktop wallet button */}
            <div className="hidden md:block">
              <ConnectButton accountStatus="full" showBalance />
            </div>

            {/* Mobile wallet button */}
            <div
              className="relative md:hidden"
              {...(!ready && {
                "aria-hidden": true,
                style: { opacity: 0, pointerEvents: "none" },
              })}
            >
              {!connected ? (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="rounded-full bg-[#00D6A0] px-3 py-2 text-xs font-bold text-[#07130F] transition-colors hover:bg-[#00B889] active:bg-[#009F76]"
                >
                  Connect
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileMenuOpen((isOpen) => !isOpen)
                    }
                    aria-label="Open wallet menu"
                    aria-expanded={mobileMenuOpen}
                    className={`flex h-10 max-w-[140px] items-center gap-1.5 rounded-full border px-2 shadow-sm transition-colors ${
                      dark
                        ? "border-white/10 bg-[#1a1a1a]/80 text-white hover:border-[#00D6A0]/50 hover:bg-[#00D6A0]/[0.08]"
                        : "border-black/10 bg-white text-[#171714] hover:border-[#00A87D]/50 hover:bg-[#00A87D]/[0.05]"
                    }`}
                  >
                    {account.ensAvatar ? (
                      <img
                        src={account.ensAvatar}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00D6A0] text-[10px] font-black text-[#07130F]">
                        {account.displayName.slice(2, 3).toUpperCase()}
                      </span>
                    )}

                    <span className="truncate text-xs font-bold">
                      {account.displayName}
                    </span>

                    <FiChevronDown
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                        mobileMenuOpen
                          ? "rotate-180 text-[#00D6A0]"
                          : ""
                      }`}
                    />
                  </button>

                  {/* Mobile wallet dropdown */}
                  {mobileMenuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close wallet menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setMobileMenuOpen(false)}
                      />

                      <div
                        className={`absolute right-0 top-full z-50 mt-2 w-[min(260px,calc(100vw-2rem))] overflow-hidden rounded-2xl border p-1.5 ${
                          dark
                            ? "border-white/10 bg-[#151515] shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                            : "border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                        }`}
                      >
                        {/* Network */}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openChainModal();
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                            dark
                              ? "text-white hover:bg-[#00D6A0]/10"
                              : "text-[#171714] hover:bg-[#00A87D]/[0.07]"
                          }`}
                        >
                          <FiRadio className="h-4 w-4 shrink-0 text-[#00D6A0]" />

                          <span className="flex-1">Network</span>

                          <span
                            className={`max-w-[110px] truncate text-xs font-medium ${
                              dark
                                ? "text-white/55"
                                : "text-black/55"
                            }`}
                          >
                            {chain.name}
                          </span>
                        </button>

                        {/* Disconnect */}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            disconnect();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#d94c4c] transition-colors hover:bg-[#ff6262]/10"
                        >
                          <FiLogOut className="h-4 w-4 shrink-0" />
                          Disconnect
                        </button>

                        {/* View account */}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openAccountModal();
                          }}
                          className={`w-full rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                            dark
                              ? "text-white/55 hover:bg-[#00D6A0]/10 hover:text-[#00D6A0]"
                              : "text-black/55 hover:bg-[#00A87D]/[0.07] hover:text-[#008A66]"
                          }`}
                        >
                          View account
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default Connect;
