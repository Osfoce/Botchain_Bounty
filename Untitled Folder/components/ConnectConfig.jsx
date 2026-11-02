import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "../context/ThemeContext";

function ConnectConfig() {
  const { dark } = useTheme();

  const green = "#00D6A0";

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";

        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        const surface = dark
          ? "border-white/10 bg-[#121512] text-white"
          : "border-[#e2e8e3] bg-white text-[#17211c]";

        const muted = dark ? "text-white/45" : "text-[#78857d]";

        const interactive = dark
          ? "bg-white/[0.04] hover:bg-white/[0.08]"
          : "bg-[#f5f9f6] hover:bg-[#edf7f1]";

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            className="w-full"
          >
            {!connected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-[#00D6A0]/30 bg-[#00D6A0] px-4 py-3.5 text-sm font-bold text-[#06251c] shadow-[0_8px_24px_rgba(0,214,160,0.12)] transition-all duration-300 hover:border-[#00e6ac] hover:bg-[#00e6ac] hover:shadow-[0_10px_30px_rgba(0,214,160,0.22)] active:scale-[0.98]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06251c]/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect x="3.5" y="5" width="17" height="14" rx="3" />
                      <path d="M3.5 9h17" />
                      <path d="M7.5 14h3" />
                    </svg>
                  </span>

                  <span className="text-left">
                    <span className="block text-sm font-extrabold">
                      Connect Wallet
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[#06251c]/65">
                      Connect to start earning
                    </span>
                  </span>
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06251c]/10 transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </span>
              </button>
            ) : chain.unsupported ? (
              <button
                type="button"
                onClick={openChainModal}
                className="flex w-full items-center justify-between rounded-2xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3.5 text-left transition-colors hover:bg-red-500/[0.13] active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M12 3 22 20H2L12 3Z" />
                      <path d="M12 9v5M12 17h.01" />
                    </svg>
                  </span>

                  <span>
                    <span className="block text-sm font-bold text-red-500">
                      Wrong Network
                    </span>
                    <span className={`mt-1 block text-xs ${muted}`}>
                      Switch to a supported network
                    </span>
                  </span>
                </span>

                <span className="text-sm font-bold text-red-500">Switch ↗</span>
              </button>
            ) : (
              <div
                className={`w-full rounded-2xl border p-2 shadow-[0_12px_35px_rgba(0,0,0,0.05)] transition-colors duration-300 ${surface}`}
              >
                <div className="mb-2 flex items-center justify-between px-2 pt-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.16em] ${muted}`}
                  >
                    Wallet connected
                  </span>

                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#00b889]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00D6A0] shadow-[0_0_8px_rgba(0,214,160,0.6)]" />
                    Connected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className={`group min-w-0 rounded-xl border border-transparent p-3 text-left transition-all duration-200 hover:border-[#00D6A0]/25 ${interactive}`}
                  >
                    <span className="mb-3 flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${muted}`}>
                        Network
                      </span>
                      <span className="text-xs text-[#00b889] transition-transform group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </span>

                    <span className="flex min-w-0 items-center gap-2">
                      {chain.hasIcon && chain.iconUrl ? (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          className="h-7 w-7 shrink-0 rounded-full"
                        />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00D6A0]/10 text-[#00b889]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="8.5" />
                            <path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5Z" />
                          </svg>
                        </span>
                      )}

                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold">
                          {chain.name}
                        </span>
                        <span className={`mt-0.5 block text-[10px] ${muted}`}>
                          Active network
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openAccountModal}
                    className={`group min-w-0 rounded-xl border border-transparent p-3 text-left transition-all duration-200 hover:border-[#00D6A0]/25 ${interactive}`}
                  >
                    <span className="mb-3 flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${muted}`}>
                        Account
                      </span>
                      <span className="text-xs text-[#00b889] transition-transform group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </span>

                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-[#06251c]"
                        style={{
                          background: `linear-gradient(135deg, ${green}, #8af5d5)`,
                        }}
                      >
                        {account.displayName?.charAt(0)?.toUpperCase() || "W"}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold">
                          {account.displayName}
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-[10px] ${muted}`}
                        >
                          {account.displayBalance || "Manage wallet"}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={openAccountModal}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#00D6A0]/15 bg-[#00D6A0]/[0.07] px-3 py-2.5 text-xs font-bold text-[#00b889] transition-colors hover:bg-[#00D6A0]/[0.13]"
                >
                  Manage Wallet
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default ConnectConfig;
