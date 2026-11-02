# Happy Bounty — BOT Chain Integration Notes

> **Historical note:** This document contains the original BOT Chain Testnet (Bohr) integration requirements and setup instructions. The application no longer supports BOT Chain Testnet (chain ID `968`). Current production support is Arc Mainnet (`5042`) and BOT Chain (`677`); use the root README and source configuration for current settings.

## 1. Project Context

Happy Bounty is an existing blockchain bounty and reward distribution application. It was originally deployed on Arc and its UI, wallet interactions, contract configuration, and potentially its backend were designed around Arc.

We are extending the existing application to support BOT Chain as an additional EVM-compatible network while retaining full Arc support.

This is an integration into an existing codebase, not a new application or a frontend redesign.

## 2. Primary Objective

Inspect the entire repository, identify every component that assumes the application runs exclusively on Arc, and implement proper multi-network support for:

- Arc — existing deployment and functionality.
- BOT Chain — new deployment and functionality.

The selected network must determine which blockchain the application connects to, which contract deployment it interacts with, where it reads blockchain data, where it submits transactions, and which explorer it uses.

Do not assume that adding BOT Chain to a dropdown alone constitutes a complete integration.

## 3. Phase One: Repository Audit — Read Before Editing

Before modifying any files, inspect the repository and understand its architecture.

Examine, where present:

- package.json and installed dependencies.
- Wallet connection and network configuration.
- Wagmi, Viem, Ethers, or other blockchain client configuration.
- Network selectors, chain IDs, and chain definitions.
- Contract ABIs, deployment addresses, and contract instances.
- All contract read and write hooks.
- Transaction submission, receipt handling, and error handling.
- Event listeners, log queries, and blockchain indexing.
- Backend API routes, services, models, and database schemas.
- Environment variables and deployment configuration.
- Transaction explorer links and block explorer utilities.
- Tests, build scripts, and existing project documentation.

Search for explicit Arc references, hardcoded chain IDs, RPC URLs, contract addresses, currency symbols, explorer URLs, and assumptions that the application can only operate on one network.

Do not assume every Arc reference must be replaced. Some references are legitimate and must remain for Arc support.

### Audit deliverable

Before making changes, provide a concise audit report containing:

1. The current application architecture and blockchain integration flow.
2. The files and components that currently assume Arc.
3. The files that need modification to support BOT Chain.
4. The existing Arc deployment configuration and how it is consumed.
5. The missing information required to configure the BOT Chain deployment.
6. A proposed implementation plan, including any backend or database changes.

After presenting the audit, proceed with implementation using the findings. Do not stop at producing the report unless a genuinely blocking decision or missing deployment detail prevents safe implementation.

## 4. Phase Two: Centralized Network Configuration

Implement a single, maintainable source of truth for supported networks and their Happy Bounty deployments.

Reuse the project's existing configuration architecture if it is suitable. Do not introduce a second competing network configuration system.

Each supported network configuration should contain the appropriate values for:

- Internal network identifier.
- Display name.
- EVM chain ID.
- RPC endpoint.
- Native currency name, symbol, and decimals.
- Block explorer base URL.
- Happy Bounty contract address.
- Contract ABI or shared ABI reference, where required.
- Network-specific deployment status.

Keep the existing Arc configuration intact and add BOT Chain as a separate entry.

Use the existing Arc deployment address discovered in the repository. Do not overwrite it with the BOT Chain address.

For BOT Chain, verify the correct network parameters against official documentation. Do not guess RPC URLs, chain IDs, explorers, native currency details, or deployment addresses.

Keep environment-specific configuration separate where appropriate. Never expose private keys, API secrets, or other server-side credentials to the frontend.

## 5. Phase Three: Wallet and Network Selection

Update the existing network selector to include Arc and BOT Chain.

When a user selects a network:

1. Update the application's selected network state.
2. Request the wallet to switch to the corresponding EVM chain.
3. If the network is not configured in the wallet, offer to add it using verified network parameters.
4. Detect rejected switch requests and unsupported-network errors.
5. Confirm the wallet's actual chain ID before allowing contract writes.
6. Display a clear indication of the currently selected network.
7. Prevent transactions if the wallet chain and selected application chain do not match.

Use the project's existing wallet integration and established patterns. Do not replace Wagmi, Viem, Ethers, or another installed library without a compelling technical reason.

If the wallet cannot connect to the selected network, explain the problem to the user and provide an appropriate recovery action.

## 6. Phase Four: Correct Contract Routing

The selected network must determine the contract deployment used by every blockchain operation.

Audit and update all applicable:

- Contract instances and client factories.
- Contract read hooks.
- Contract write hooks.
- Bounty creation and funding.
- Winner assignment.
- Single-winner and multiple-winner distributions.
- Reward claiming.
- Transaction receipt handling.
- Event subscriptions and historical log queries.
- Transaction and address explorer links.
- Balance, transaction, and contract status queries.

Never use the Arc contract address when BOT Chain is selected.

Never use the BOT Chain contract address when Arc is selected.

Resolve the contract address from the centralized deployment configuration using the selected chain ID or the project's established network identifier.

Ensure the ABI matches the deployed contract interface. If the deployments use different contract versions, handle that explicitly rather than assuming they are identical.

If the BOT Chain contract address has not yet been supplied or verified, leave the deployment clearly marked as unconfigured and prevent contract interactions on that network. Do not use a placeholder address as if it were a real deployment.

## 7. Phase Five: Backend and Data Isolation

Inspect the backend and database before deciding whether changes are required.

If the backend reads contract events, validates claims, records distributions, or indexes bounty activity, ensure that it can distinguish events originating from different networks.

Where applicable:

- Include chain ID and contract address in indexed blockchain records.
- Identify blockchain transactions by both chain ID and transaction hash.
- Prevent events from one network from being interpreted as events from another.
- Select the correct RPC, contract deployment, and event source for each network.
- Preserve existing API compatibility where practical.
- Add or adjust database indexes and uniqueness constraints where needed.
- Validate the selected network server-side instead of trusting client-provided values blindly.

Do not assume blockchain state is shared between Arc and BOT Chain. Each deployment has independent state.

If backend functionality is entirely off-chain and does not depend on network-specific blockchain data, avoid unnecessary backend changes.

## 8. Phase Six: UI and User Experience

Preserve the existing visual design, page structure, and established component patterns.

Update the UI only where necessary to support the new network.

Ensure that:

- Arc and BOT Chain are both visible as supported networks.
- The active network is clearly identifiable.
- Network switching produces an appropriate loading or confirmation state.
- Unsupported networks and wallet mismatches are handled clearly.
- Contract addresses and transaction links use the active network.
- Loading, error, and transaction confirmation states remain functional.
- Network-specific token or gas assumptions are not incorrectly inherited from Arc.

Do not redesign unrelated screens or introduce unrelated features.

## 9. Phase Seven: Configuration and Security

Review the project's environment variable handling and deployment configuration.

Requirements:

- Never hardcode private keys or wallet secrets.
- Never expose backend-only credentials through frontend environment variables.
- Keep public RPC endpoints and public contract addresses separate from secrets.
- Validate chain IDs before submitting transactions.
- Avoid silently falling back to the Arc contract when a network configuration is missing.
- Do not silently route a failed BOT Chain operation to Arc.
- Do not modify production deployments or execute live transactions without explicit authorization.

## 10. Phase Eight: Testing and Verification

After implementation, run the available project checks and report their actual results.

At minimum, verify the following scenarios:

1. The application still initializes and works on Arc.
2. BOT Chain appears in the network selector.
3. Selecting BOT Chain requests the correct wallet network.
4. The application resolves the correct contract address for each chain.
5. Read operations use the selected network's RPC and deployment.
6. Write operations are blocked when the wallet is on the wrong chain.
7. Transaction explorer links use the selected network's explorer.
8. Backend event processing, where applicable, keeps networks separate.
9. Missing deployment configuration produces a clear, safe error.
10. Switching repeatedly between networks does not leave stale contract instances or data.
11. Existing Arc functionality and tests continue to pass.
12. The production build and relevant automated tests succeed.

Use mocks or local tests where actual network transactions are unnecessary. Do not submit real transactions simply to demonstrate that the UI works.

## 11. Final Deliverable

After completing the integration, provide:

- A summary of the architecture discovered during the audit.
- The files changed and the reason for each change.
- The final network configuration and where deployment addresses are defined.
- Any required environment variables or deployment details still missing.
- The tests and build commands executed, including failures.
- Manual steps needed to configure the wallet, deploy the contract, or complete verification.
- Any known limitations or unsupported features.

## Implementation Rules

- Inspect first; modify second.
- Preserve existing Arc functionality.
- Prefer minimal, consistent changes over unnecessary refactoring.
- Reuse existing dependencies and project conventions.
- Do not fabricate deployment information.
- Do not claim a feature works unless it has been tested or its unverified status is clearly stated.
- Do not delete or overwrite existing user work.
- If an essential detail is missing, explain the blocker and ask for the specific information needed.

The final result must be a genuinely multi-network Happy Bounty application, not an Arc application with BOT Chain branding added.


## 12. Project-Specific Requirements: Happy Bounty on BOT Chain

### 12.1 Confirmed Project Decisions

Use these decisions as the source of truth for this integration:

- The existing Happy Bounty frontend was originally built around Arc.
- Arc must remain supported and fully functional.
- BOT Chain Testnet is the new target network.
- The BOT Chain BountyContract has already been deployed.
- The BOT Chain deployment is expected to use the same Solidity contract interface and ABI as the Arc deployment.
- The frontend interacts directly with the smart contract.
- The backend is not intended to become a blockchain indexing service as part of this task.
- The existing UI and component design must be preserved wherever possible.

Do not redesign the application or rewrite working features just to introduce network support.

### 12.2 BOT Chain Testnet Configuration

Configure BOT Chain Testnet with the following verified network details:

- Network name: BOT Chain Testnet (Bohr)
- Chain ID: 968
- RPC URL: https://rpc.bohr.life
- Native currency symbol: BOT
- Native currency name: BOT
- Native currency decimals: 18
- Block explorer: https://scan.bohr.life

Use the existing Arc network configuration as the reference for the project's configuration conventions.

Represent Arc and BOT Chain as separate network configurations. Each must have its own chain ID, RPC configuration, explorer URL, and contract deployment address.

Do not replace the Arc configuration with BOT Chain values.

### 12.3 Locate and Validate the BOT Chain Deployment

Search the repository and its existing deployment records for the BOT Chain BountyContract address.

Inspect relevant deployment artifacts, Foundry broadcast records, environment files, documentation, and existing contract configuration.

If multiple addresses are found, do not select one based on appearance or filename alone. Establish which address belongs to the successful BOT Chain Testnet deployment.

The intended deployment must be explicitly associated with chain ID 968.

If the address cannot be determined unambiguously, ask me to provide it. Do not invent an address or reuse the Arc address.

Before enabling contract interactions:

1. Validate the address format.
2. Query the BOT Chain Testnet RPC for the address's bytecode.
3. Confirm that the address contains deployed contract code.
4. Confirm the deployed interface is compatible with the existing BountyContract ABI.
5. Record the verified deployment address in the centralized network configuration.

A successful bytecode check establishes that contract code exists at the address; it does not, by itself, prove that the contract is the expected BountyContract. Use available deployment artifacts and appropriate interface checks to establish that.

If validation fails, mark the BOT Chain deployment as unconfigured or invalid and prevent contract interactions until corrected.

### 12.4 Centralized Deployment Mapping

Create or update the project's existing network configuration so that contract routing follows one authoritative mapping.

Conceptually, the configuration must support:

- Arc chain ID → existing Arc BountyContract address.
- BOT Chain Testnet chain ID 968 → verified BOT Chain BountyContract address.

Adapt this structure to the project's actual framework, naming conventions, and types. It is a requirement for behavior, not an instruction to introduce a duplicate configuration module.

All contract instances must resolve their deployment from the selected network. Remove duplicated hardcoded addresses where practical, without removing legitimate Arc-specific configuration.

If the existing application uses a deployment registry, Wagmi chain configuration, Viem clients, or generated contract types, integrate with those existing mechanisms rather than creating parallel systems.

### 12.5 Network Selection Must Control All Contract Operations

Trace the selected network through the complete frontend interaction lifecycle.

When Arc is selected:

- Use the Arc chain configuration and Arc contract address.
- Read bounty state from the Arc deployment.
- Submit write transactions to the Arc deployment.
- Read transaction receipts and logs from the correct chain.
- Generate Arc explorer links.

When BOT Chain Testnet is selected:

- Use chain ID 968.
- Use the BOT Chain Testnet RPC and verified BOT Chain contract address.
- Read bounty state from the BOT Chain deployment.
- Submit write transactions to the BOT Chain deployment.
- Read transaction receipts and logs from the correct chain.
- Generate BOT Chain Testnet explorer links.

Apply the same routing rules to every implemented contract operation, including bounty creation, bounty detail retrieval, winner assignment, multiple-winner distribution, reward claiming, and any additional functions found during the repository audit.

Do not assume all operations exist merely because they are listed here; inspect the actual contract ABI and frontend before implementing or modifying functionality.

### 12.6 Wallet Switching and Transaction Safety

When a user selects a network, update the application state and request the wallet to switch to the corresponding chain.

The wallet's actual chain ID must be checked before any contract write.

If the wallet is connected to Arc while BOT Chain Testnet is selected, block the write and request the appropriate network switch.

If a network-switch request is rejected, retain a clear error state and do not submit the transaction.

If the wallet switches networks externally, update the application's network-dependent state to reflect the actual wallet connection and avoid displaying stale contract data.

Do not rely exclusively on the dropdown selection as proof of the active blockchain.

### 12.7 Prevent Stale State and Cross-Network Data Leakage

When the selected chain changes:

- Recreate or resolve the appropriate network-specific contract client.
- Invalidate or refresh cached contract reads.
- Re-query balances and bounty data from the selected deployment.
- Ensure pending transaction state is associated with its originating chain.
- Avoid displaying Arc data as if it belongs to BOT Chain, or vice versa.
- Ensure asynchronous requests from the previous network cannot overwrite newer data from the selected network.

If the application uses TanStack Query, Wagmi caching, or another state-management library, use its existing invalidation and query-key conventions. Network-dependent query keys must distinguish chain ID and, where relevant, contract address.

### 12.8 Frontend-Only Blockchain Architecture

The current architecture has the frontend interacting directly with the smart contract. Do not add blockchain event indexing, a new RPC service, a new database, or new backend dependencies solely for BOT Chain support.

Inspect the backend only to determine whether any existing endpoint contains hidden Arc-specific assumptions or supplies data required by the frontend.

Modify the backend only if the audit identifies an actual requirement. If backend changes are necessary, explain the dependency and implement the smallest compatible change.

### 12.9 Same ABI, Independently Verified Deployment

The Arc and BOT Chain deployments are expected to use the same BountyContract interface.

Reuse the existing ABI when it is compatible with the BOT Chain deployment. Do not create a duplicate ABI just because another network is added.

Verify the contract's expected functions and relevant events against the existing source code and deployment artifacts. If there is evidence that the deployed BOT Chain contract differs from the expected version, stop and report the discrepancy rather than silently assuming compatibility.

Remember that sharing an ABI does not mean sharing contract state. Bounty records, balances, ownership, escrowed funds, and transaction histories are independent on each network.

### 12.10 Network-Specific Currency and Gas Assumptions

Inspect the application for assumptions that the Arc gas token or currency presentation applies to every supported chain.

Use BOT as the native gas currency for BOT Chain Testnet.

Do not change the bounty's reward denomination or economic rules merely because a new network is added. Inspect the existing contract and UI before changing any reward-related labels, token handling, or transaction-value calculations.

Preserve the existing Arc behavior and accurately represent each network's actual contract functionality.

### 12.11 Required Acceptance Tests

The implementation is not complete until the following scenarios have been tested or explicitly identified as requiring manual verification.

**Network configuration**
- Arc remains present with its original chain ID, RPC, explorer, and deployment address.
- BOT Chain Testnet is present with chain ID 968 and its verified deployment address.
- Missing or invalid deployment configuration does not silently fall back to Arc.
- Each configured deployment is associated with the correct chain.

**Wallet and network selection**
- Selecting Arc requests or retains the correct chain.
- Selecting BOT Chain requests chain ID 968.
- Rejected network switching blocks writes and presents a useful message.
- External wallet network changes are handled correctly.
- Contract writes are blocked when the actual wallet chain does not match the selected network.

**Contract routing**
- Contract reads resolve to the appropriate deployment on each chain.
- All implemented write operations use the correct chain and address.
- Transaction receipts and explorer links use the originating chain.
- A missing deployment or missing bytecode prevents contract interactions.
- Changing networks does not reuse stale contract instances or stale read results.

**Regression and build**
- Existing Arc functionality remains operational.
- BOT Chain functionality is tested against the actual deployment where practical.
- Existing automated tests pass.
- The production build succeeds.
- Any tests that cannot be executed are clearly identified rather than reported as passing.

### 12.12 Completion Report

At the end of the implementation, report:

1. The files inspected and changed.
2. The final Arc and BOT Chain configuration.
3. The source used to establish the BOT Chain contract address.
4. The validation performed on the deployed contract.
5. The contract operations verified for each network.
6. The build and test results.
7. Any remaining deployment, wallet, or manual verification steps.

Do not claim that both networks work merely because the application compiles or the network dropdown renders. Successful integration requires correct network selection, contract routing, transaction safety, and preservation of the existing Arc functionality.

## 13. Deployment Guide: BOT Chain Testnet

### Network and deployment configuration

The frontend chain definitions and wallet configuration are in `frontend/src/rainbowChains.jsx`. Contract addresses, native token metadata, explorer URLs, and explorer-link helpers are in `frontend/src/utils/chains.address.js`.

| Setting | Arc | BOT Chain Testnet |
|---|---|---|
| Chain ID | `5042` | `968` |
| RPC URL | `https://rpc.mainnet.arc.io` | `https://rpc.bohr.life` |
| Native token | `USDC` (18 decimals) | `BOT` (18 decimals) |
| Explorer | [Arc Explorer](https://explorer.arc.io) | [BohrScan](https://scan.bohr.life) |
| Contract address currently configured | `0x498482e334269a10d0621D3AC5e726734B01DDCe` | `0x498482e334269a10d0621D3AC5e726734B01DDCe` |

The same address is configured for both chains, as confirmed by the project owner. BOT Chain Testnet returned non-empty bytecode for that address, and `owner`, `FEE_PERCENT`, and `bountyCounter` calls succeeded using the bundled ABI. These checks confirm code and representative ABI calls; they do not prove every contract behavior. Do not copy the Arc address into another deployment if a future network uses a different address.

### Environment variables

Set the frontend API base URL and WalletConnect project ID in `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

Set the backend variables in `backend/.env`:

```dotenv
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

The frontend reads the public RPC endpoints and contract addresses from source configuration; no chain-specific RPC or contract-address environment variable is currently used. Cloudinary credentials are only needed for backend features that upload media. Never put private keys, seed phrases, database credentials, or Cloudinary secrets in frontend variables.

### Get BOT test tokens

1. Use a wallet account dedicated to testnet activity. Never enter a seed phrase or private key into a faucet.
2. Find the current BOT Chain Testnet faucet link through an official BOT Chain / Bohr project channel or a link published by the network operator. A faucet URL is not included here because it was not independently verified while preparing this guide.
3. Connect the wallet or enter only its public address, then request BOT test tokens.
4. Wait for the faucet transaction to confirm. Check the wallet balance or search the transaction on [BohrScan](https://scan.bohr.life).
5. If the faucet is unavailable or imposes a cooldown, use the network operator's official support/community channel. Do not use unofficial services that request wallet secrets.

BOT is needed for transaction gas and native-token bounty rewards on chain `968`.

### Run locally

From the repository root, install each package's dependencies if they are not already installed, then start the backend and frontend in separate terminals:

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

The backend connects to MongoDB before it starts listening on `PORT`. The frontend API base URL must end in `/api`, for example `http://localhost:5000/api`.

### Add and select BOT Chain Testnet

If the chain is not already in the wallet, add a custom network with:

- Network name: `BOT Chain Testnet (Bohr)`
- RPC URL: `https://rpc.bohr.life`
- Chain ID: `968`
- Currency symbol: `BOT`
- Block explorer URL: `https://scan.bohr.life`

Connect the wallet, open **Create Bounty**, choose **BOT Chain Testnet (Bohr)** in the network selector, and approve the wallet's chain-switch request. Confirm the selected chain in the wallet before continuing. Reward amounts and the creation fee are paid in BOT on this network.

### Screenshots

Capture and add screenshots after opening the app with a connected wallet and representative BOT Chain bounty data. The local browser session used for this update did not have an injected wallet or bounty records, so it could not render genuine screenshots of the Create network selector, a bounty network badge, or a populated explorer link. Do not substitute mock screenshots for those flows.

The following screenshots remain to be captured from that live session and embedded here:

- `docs/screenshots/create-network-selector.png` — BOT Chain Testnet selected in the bounty creation network selector.
- `docs/screenshots/bounty-network-badge.png` — BOT Chain Testnet badge and BOT reward on a bounty card.
- `docs/screenshots/bounty-explorer-links.png` — bounty contract and transaction links opening in BohrScan.

## 14. Manual Testing Checklist

Use a wallet with BOT test tokens and a bounty whose contract deployment/address has been confirmed. Use small test amounts; do not test with production funds.

- [ ] Connect a wallet on Arc and on BOT Chain Testnet.
- [ ] Open **Create Bounty**, choose each network, and verify that the wallet prompts for the matching chain.
- [ ] Reject a network-switch request and confirm no transaction is submitted.
- [ ] Create a small bounty on BOT Chain Testnet; verify the reward/fee are denominated in BOT and confirm the transaction on BohrScan.
- [ ] Create a separate Arc bounty and verify the Arc explorer and native token display remain correct.
- [ ] Confirm each bounty card and detail page show the recorded network badge and token symbol.
- [ ] Open the contract and transaction links from the BOT bounty and verify they resolve under `https://scan.bohr.life`.
- [ ] Submit work to the test bounty and have its creator assign one or more winners.
- [ ] Distribute the rewards, confirm the transaction on the originating network, and verify the assigned reward appears for each winner.
- [ ] Connect as a winner and claim the reward; confirm the receipt and resulting wallet balance on the same network.
- [ ] Switch networks between viewing and interacting with bounties; verify old-network data and explorer links are not shown as belonging to the newly selected network.
- [ ] Repeat the creation, assignment, distribution, and claim checks on Arc if an Arc test deployment and funded test account are available.

## 15. Current Verification Status

- Frontend production build and lint results should be recorded in the accompanying `completion_report.md`.
- The BOT RPC returned deployed bytecode at the configured address, and representative read calls using the project ABI succeeded.
- The backend public bounty-list, tag, and category GET endpoints responded successfully during local verification. The local database contained no bounty records, so network/token values could not be verified against stored sample bounties.
- The platform-stats endpoint route was corrected to precede the dynamic bounty-ID route; it must be rechecked after restarting the backend.
- Wallet transactions, faucet funding, full create/assign/distribute/claim workflow, and screenshots still require manual verification with a connected wallet and funded test account.