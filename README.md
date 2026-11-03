# Happy Bounty

Happy Bounty is a Web3 platform for publishing bounties, submitting work, assigning winners, and distributing on-chain rewards. The frontend interacts directly with the bounty contract; the Express and MongoDB backend stores bounty and submission metadata.

## Supported networks

| Network | Chain ID | Native token | Explorer |
|---|---:|---|---|
| Arc | `5042` | USDC | [explorer.arc.io](https://explorer.arc.io) |
| BOT Chain | `677` | BOT | [scan.botchain.ai](https://scan.botchain.ai) |
| Arc Testnet | `5042002` | USDC | [testnet.arcscan.app](https://testnet.arcscan.app) |
| BOT Chain Testnet (Bohr) | `968` | BOT | [scan.bohr.life](https://scan.bohr.life) |

The same bounty contract address is configured on all four networks, with independent on-chain state. Testnet support is for testing only; use test tokens and testnet bounties.

## Architecture

- **Frontend:** React, Vite, TailwindCSS, Wagmi, RainbowKit, and Viem.
- **Backend:** Express 5 API with Mongoose models and MongoDB.
- **Authentication:** EIP-4361 Sign-In with Ethereum (SIWE) backed by revocable, short-lived bearer sessions.
- **Contract configuration:** Chain definitions are in `frontend/src/rainbowChains.jsx`; contract addresses, native tokens, and explorers are in `frontend/src/utils/chains.address.js`. Backend RPC and reconciliation settings are in `backend/config/chains.js`.
- **API routes:** The frontend uses bounty, user, submission, enrollment, and reward endpoints under the backend `/api` prefix.

## Local development

Requirements: a supported Node.js version for the frontend's Vite toolchain, npm, MongoDB access, and a wallet. A WalletConnect project ID is needed when using WalletConnect.

Create `backend/.env`:

```dotenv
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_ORIGINS=http://localhost:5173
# Set to the exact trusted reverse-proxy hop count when deployed behind a proxy.
TRUST_PROXY_HOPS=0
# Optional backend admin wallet allowlist; comma-separated addresses.
ADMIN_WALLETS=
```

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_ADMIN_WALLETS=
```

Start the backend and frontend in separate terminals:

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

The backend waits for MongoDB before listening. The frontend's `VITE_API_URL` must include `/api`. Public RPC URLs and contract addresses are currently configured in frontend source; no private keys should be placed in frontend environment variables.

After connecting a wallet, use **Sign in with wallet** to authenticate API requests. This signs a SIWE message and does not submit a blockchain transaction. The bearer session is kept in browser memory only, so a page reload requires signing in again. Sessions expire after 30 minutes idle or 4 hours absolute, and signing out revokes the server-side session.

For the deployed frontend, configure Render's `FRONTEND_ORIGINS` as `https://botchain-bounty.vercel.app` (no path or trailing slash). Configure Vercel's `VITE_API_URL` as `https://botchain-bounty.onrender.com/api`, then redeploy the frontend so the environment variable is included in its build. SIWE accepts the four chain IDs listed above.

For backend admin authorization, configure Render's `ADMIN_WALLETS` with comma-separated wallet addresses. This server-side allowlist is used for privileged bounty archiving; frontend visibility alone does not grant API permissions. If unset, only a bounty's creator can archive it. Never put private keys in `ADMIN_WALLETS`.

Configure Vercel's `VITE_ADMIN_WALLETS` with the same comma-separated public wallet addresses for admin navigation and UI. These frontend checks only control presentation; the backend `ADMIN_WALLETS` setting remains authoritative for API actions.

Security milestone details are documented in [SECURITY_AUTHENTICATION.md](./SECURITY_AUTHENTICATION.md), [SECURITY_AUTHORIZATION.md](./SECURITY_AUTHORIZATION.md), [SECURITY_PRIVACY.md](./SECURITY_PRIVACY.md), [SECURITY_BLOCKCHAIN_VERIFICATION.md](./SECURITY_BLOCKCHAIN_VERIFICATION.md), [SECURITY_FINANCIAL_INTEGRITY.md](./SECURITY_FINANCIAL_INTEGRITY.md), [SECURITY_API_HARDENING.md](./SECURITY_API_HARDENING.md), [SECURITY_FILE_UPLOADS.md](./SECURITY_FILE_UPLOADS.md), [SECURITY_DATA_LIFECYCLE.md](./SECURITY_DATA_LIFECYCLE.md), and [SECURITY_OPERATIONS.md](./SECURITY_OPERATIONS.md).

## Checks

```bash
cd frontend
npm test
npm run lint
npm run build
```

Run backend tests with `cd backend && npm test`. For network and wallet workflow verification, follow the [manual checklist](./BOTCHAIN_INTEGRATION.md#14-manual-testing-checklist).
