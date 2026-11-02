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
- **Contract configuration:** Chain definitions are in `frontend/src/rainbowChains.jsx`; contract addresses, native tokens, and explorers are in `frontend/src/utils/chains.address.js`. Backend RPC and reconciliation settings are in `backend/config/chains.js`.
- **API routes:** The frontend uses bounty, user, submission, enrollment, and reward endpoints under the backend `/api` prefix.

## Local development

Requirements: a supported Node.js version for the frontend's Vite toolchain, npm, MongoDB access, and a wallet. A WalletConnect project ID is needed when using WalletConnect.

Create `backend/.env`:

```dotenv
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
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

## Checks

```bash
cd frontend
npm run lint
npm run build
```

The backend package does not currently define an automated test suite. For network and wallet workflow verification, follow the [manual checklist](./BOTCHAIN_INTEGRATION.md#14-manual-testing-checklist).
