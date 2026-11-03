# Happy Bounty --- Reliable Reward Distribution Synchronization

## Purpose

Fix the failure mode where a reward-assignment transaction succeeds
on-chain but the subsequent MongoDB synchronization fails because of a
network interruption or partial database failure.

The application must never ask the user to submit the winner-assignment
transaction again merely because the backend synchronization failed.

**Source of truth:** the deployed smart contract and its confirmed
`RewardsAssigned` event.

**MongoDB's role:** an application-readable projection of the confirmed
on-chain result. MongoDB must be recoverable from the chain.

## Implementation status

The immediate recovery phase is implemented: confirmed transaction details
can be retried without another wallet write, backend synchronization is
idempotent and recorded by event identity, and per-winner completion counters
are protected against duplicate increments. The supported BOT Chain in this
project is mainnet chain ID `677` (not the retired testnet `968`).

The backend uses resumable, lease-based writes instead of a multi-document
MongoDB transaction because the deployment topology is not defined in this
repository. Phase 3 is implemented as a two-minute reconciliation job: it
scans confirmed `RewardsAssigned` events with an overlap window, persists a
lease-protected per-chain checkpoint, and retries eligible incomplete
projections using the same receipt/event verifier and idempotent sync service.
Automatic record retries use exponential backoff and stop after 12 attempts;
the endpoint remains available for an explicit user retry.

The scanner recognizes Arc mainnet `5042`, BOT Chain mainnet `677`, Arc
Testnet `5042002`, and BOT Chain Testnet (Bohr) `968`. Optional deployment
settings are `ARC_BOUNTY_DEPLOYMENT_BLOCK`,
`BOTCHAIN_BOUNTY_DEPLOYMENT_BLOCK`, `ARC_TESTNET_BOUNTY_DEPLOYMENT_BLOCK`,
and `BOTCHAIN_TESTNET_BOUNTY_DEPLOYMENT_BLOCK` (default `0`). Confirmation
depth settings are `ARC_CONFIRMATION_DEPTH` and
`BOTCHAIN_CONFIRMATION_DEPTH` (default `12`), plus
`ARC_TESTNET_CONFIRMATION_DEPTH` and `BOTCHAIN_TESTNET_CONFIRMATION_DEPTH`
(default `2`).
`DISTRIBUTION_SYNC_BLOCK_RANGE` defaults to `500`,
`DISTRIBUTION_SYNC_OVERLAP_BLOCKS` defaults to `12`, and setting
`DISTRIBUTION_SYNC_ENABLED=false` disables the job. Each run scans at most 20
block ranges per chain. Set deployment blocks to the actual contract
deployment heights in production to avoid an unnecessary historical scan
from genesis. Invalid numeric settings fail explicitly rather than silently
falling back to defaults.

This brief is specific to the supplied Happy Bounty project. The coding
agent must inspect the current code before editing and preserve existing
behavior outside this scope.

------------------------------------------------------------------------

## 1. Current project flow and relevant files

The supplied project currently follows this flow:

1.  `pages/BountyDetail.jsx` --- `handleDistributeReward()` calls either
    `assignSingleWinner()` or `assignMultipleWinners()`.
2.  `hooks/useBounty.js` --- `executeTx()` broadcasts the transaction,
    waits for its receipt with
    `publicClient.waitForTransactionReceipt()`, checks `receipt.status`,
    and returns `{ hash, receipt, eventData }`.
3.  `pages/BountyDetail.jsx` --- after the transaction succeeds, it
    POSTs to `/bounty/:id/distribute`.
4.  `routes/reward.route.js` --- routes that request to
    `distributeRewards`.
5.  `controller/reward.controller.js` --- verifies the receipt, parses
    `RewardsAssigned`, reads `claimableRewards`, and writes Reward,
    Bounty, Submission, and User documents.

Relevant files:

-   `pages/BountyDetail.jsx`
-   `hooks/useBounty.js`
-   `controller/reward.controller.js`
-   `routes/reward.route.js`
-   `modules/bounty.module.js`
-   `modules/reward.module.js`
-   `modules/submission.module.js`
-   `modules/user.module.js`
-   `config/chains.js`
-   `config/abi.js`

The `RewardsAssigned` event in the supplied ABI has: - `bountyId`
(`uint256`, indexed) - `winners` (`address[]`)

The current backend controller has an early guard:

``` js
if (bounty.rewardsAssignedOnChain) {
  return res.status(400).json({ error: "Rewards already distributed" });
}
```

That guard prevents a legitimate retry of database synchronization after
the on-chain transaction has already succeeded.

The controller currently writes reward documents, marks the bounty
distributed, updates submission statuses, and increments each winner's
`stats.tasksCompleted`. These writes are not currently one atomic unit.
In particular, blindly retrying the current `$inc` operation could
increment user statistics more than once.

The `Reward` schema currently has a unique index on
`{ bountyId, winnerAddress }`. Review its implications before changing
it; do not remove existing uniqueness protections without a documented
migration and replacement constraint.

------------------------------------------------------------------------

## 2. Required behavior

Implement the following invariant:

> One successful on-chain reward-assignment event must produce one
> logical distribution in MongoDB, regardless of how many times the
> frontend or background worker retries synchronization.

The system must distinguish these outcomes:

1.  **Wallet submission failed before a transaction hash was returned:**
    report transaction submission failure. Do not create a confirmed
    distribution.
2.  **Transaction hash returned, receipt not yet available:** preserve
    the hash and show a pending-confirmation state. Do not submit
    another assignment transaction automatically.
3.  **Receipt status is `reverted`:** report on-chain failure. Do not
    synchronize rewards.
4.  **Receipt status is `success`, but backend request fails or times
    out:** retain the hash and retry backend synchronization only.
5.  **Backend partially processes or crashes:** a retry must safely
    finish the remaining database work without duplicating rewards or
    user statistics.
6.  **Same transaction is submitted to synchronization more than once:**
    return an idempotent success response if it has already been fully
    synchronized.
7.  **A different transaction is submitted for a bounty that already has
    a confirmed distribution:** reject it unless the contract and
    product rules explicitly support another distribution. Do not
    mistake it for a retry of the original event.

A network timeout is an unknown outcome, not proof that an operation
failed.

------------------------------------------------------------------------

## 3. Frontend requirements

### 3.1 Separate on-chain execution from backend synchronization

Refactor `pages/BountyDetail.jsx` so that the two phases are explicit:

-   `executeRewardAssignment()` --- calls `assignSingleWinner()` or
    `assignMultipleWinners()` and waits for the confirmed receipt. This
    is the only phase allowed to submit the assignment transaction.
-   `synchronizeRewardAssignment()` --- calls the existing backend
    endpoint with the already-confirmed transaction details. This phase
    must never call a wallet write function.

Do not duplicate the existing transaction execution logic unnecessarily.
`hooks/useBounty.js` already waits for the receipt and returns
`{ hash, receipt, eventData }`. Reuse that result.

### 3.2 Persist pending synchronization information

As soon as the transaction is confirmed successfully, persist a
pending-sync record in browser storage before attempting the backend
request.

At minimum store:

``` js
{
  bountyId: String,
  blockchainId: String,
  chainId: Number,
  bountyContract: String,
  txHash: String,
  status: "pending_sync",
  createdAt: String
}
```

Use a stable key scoped by chain and bounty, or a small
pending-operation collection. Do not overwrite a different unresolved
transaction for the same bounty.

Requirements:

-   Store the transaction hash and all information needed to retry the
    backend request.
-   Validate stored data before using it.
-   Remove the record only after the backend confirms that
    synchronization is complete.
-   Do not store private keys, seed phrases, signatures, or other
    secrets.
-   Handle unavailable/corrupt browser storage gracefully.
-   Do not assume local storage is the source of truth; it is a recovery
    aid. The backend indexer/reconciler is the durable recovery
    mechanism.

### 3.3 Retry UI

When the chain transaction succeeds but backend synchronization fails:

-   Tell the user that the blockchain transaction succeeded but
    application records are still synchronizing.
-   Display the transaction hash and an explorer link using the selected
    chain's configured block explorer.
-   Offer a **Retry synchronization** action.
-   The retry action must call only the backend synchronization endpoint
    using the saved transaction hash.
-   Do not show a generic "Distribution failed" message that encourages
    the user to assign winners again.
-   Do not clear the selected winners or pending record until
    synchronization is confirmed.
-   Prevent duplicate clicks while the same sync request is in progress.
-   On page load or return to the bounty page, check for a pending sync
    record and offer/resume synchronization safely.

Do not automatically resubmit the on-chain transaction after a frontend
timeout.

### 3.4 Network and chain handling

Use the chain ID and contract address associated with the original
transaction, not whichever wallet network happens to be selected during
a later retry.

The project supports multiple networks. Ensure the retry uses the
original `chainId`, `blockchainId`, and correct deployed bounty
contract.

------------------------------------------------------------------------

## 4. Backend requirements

### 4.1 Make the distribution endpoint idempotent

Refactor `controller/reward.controller.js`, especially
`distributeRewards`.

The existing `rewardsAssignedOnChain` guard must not reject a retry of
the same transaction before checking and verifying that transaction.

Required decision logic:

1.  Validate the MongoDB bounty ID and request fields.
2.  Load the bounty.
3.  Resolve the expected contract address from trusted bounty/network
    configuration. Do not blindly trust a client-supplied contract
    address.
4.  If a distribution is already recorded:
    -   If its recorded chain, contract, and transaction hash match this
        request, verify/reconcile it and return success if complete.
    -   If this is a different transaction, reject it as a conflicting
        distribution.
5.  Obtain the transaction receipt from the RPC for the supplied chain.
6.  Require `receipt.status === "success"`.
7.  Verify that the event came from the expected bounty contract
    address.
8.  Parse the `RewardsAssigned` event from the receipt.
9.  Verify that the event's indexed `bountyId` equals the bounty's
    on-chain `blockchainId`.
10. Verify that the event has a non-empty winners array and
    validate/normalize winner addresses.
11. Derive reward amounts from authoritative on-chain state or event
    data as appropriate. Do not trust client-supplied winner amounts.
12. Persist all required MongoDB projections idempotently.
13. Mark synchronization complete only after all required writes
    succeed.
14. Return an explicit status and the transaction identity.

Do not treat a database flag by itself as proof that the submitted
transaction is the correct transaction.

### 4.2 Verify the event and contract carefully

Use the existing `getPublicClient(chainId)` and `BOUNTY_ABI` where
appropriate.

The controller currently parses `RewardsAssigned` from `receipt.logs`
and reads `claimableRewards` for each winner. Preserve the authoritative
on-chain amount lookup unless inspection of the actual contract shows
that another method is required.

Important checks:

-   The receipt belongs to the requested transaction hash.
-   The receipt is successful.
-   The event log address matches the expected deployed bounty contract.
-   The event's `bountyId` matches the bounty's on-chain ID.
-   The event is not merely another `RewardsAssigned` event from an
    unrelated contract in the same receipt.
-   The selected chain is supported and its RPC client is configured.
-   The resolved contract address is valid and normalized consistently.

The current code uses `bounty.bountyContract || bountyContract` for
verification but writes the request's `bountyContract` into reward
documents. Use one validated, resolved contract address consistently.

### 4.3 Add a durable distribution-sync record

Introduce a dedicated model/collection for tracking each processed
on-chain distribution event, for example
`modules/distributionSync.module.js`.

Suggested fields:

``` js
{
  bountyId: ObjectId,
  blockchainId: String,
  chainId: Number,
  bountyContract: String,
  transactionHash: String,
  logIndex: Number,
  blockNumber: String,
  status: "pending" | "processing" | "synced" | "failed",
  winnerAddresses: [String],
  attempts: Number,
  lastError: String,
  nextRetryAt: Date,
  syncedAt: Date
}
```

Adapt field types to existing project conventions. Keep large blockchain
integers as strings or `BigInt` during computation; do not use
JavaScript floating-point numbers for token amounts.

Create a unique index on the canonical event identity:

``` js
{
  chainId: 1,
  bountyContract: 1,
  transactionHash: 1,
  logIndex: 1
}
```

Use normalized lowercase contract addresses and transaction hashes.

The event identity must distinguish separate logs in the same
transaction. Do not rely on transaction hash alone if a transaction can
emit more than one relevant event.

If the application enforces one distribution per bounty, also enforce a
unique logical distribution per
`(chainId, bountyContract, blockchainId)` or equivalent. Confirm the
intended product rule and existing data before adding this constraint.

### 4.4 Make every projection safe to retry

The synchronization operation updates several collections. Each update
must be repeatable without changing the final result after the first
successful application.

**Reward documents**

-   Use `updateOne`/`bulkWrite` with `$setOnInsert` or carefully defined
    upserts rather than relying on `insertMany` duplicate-key errors as
    the normal retry strategy.
-   Preserve the existing one-reward-per-bounty-per-winner rule if it is
    correct for the product.
-   Verify that an existing reward belongs to the same chain, contract,
    and distribution transaction before treating it as the same
    operation.
-   Do not overwrite a claimed reward's status or claim metadata during
    distribution retry.
-   Store exact token amounts as integer strings (wei/base units), not
    floating-point values.

**Bounty document**

-   Set `rewardsAssignedOnChain`, `distributionTxHash`, `distributedAt`,
    `assignedCount`, and `winners.assigned` deterministically from the
    verified event.
-   Use the same transaction identity on every retry.
-   Do not mark the bounty synchronized before the other required
    database writes have completed.

**Submission documents**

-   Setting winners to `accepted` and non-winners to `rejected` is
    naturally repeatable when implemented as deterministic `$set`
    updates.
-   Ensure the query uses the correct wallet-address field and
    normalization. Inspect the Submission schema and actual stored
    representation before changing the query.

**User statistics**

The current implementation increments `stats.tasksCompleted` with `$inc`
on every synchronization attempt. This is not safe.

Change this so each winner's completion statistic is applied exactly
once per logical distribution. Use a unique processed-effect record/key
per distribution and user, or another atomic design that guarantees a
retry cannot increment the same statistic again.

Do not use a plain `$inc` on every retry.

### 4.5 Use MongoDB transactions where supported

Prefer a MongoDB session transaction to apply the related projection
writes and mark the sync record `synced` atomically.

Before implementing, inspect the deployment's MongoDB topology.
Multi-document transactions require a replica set or sharded cluster; do
not assume a standalone MongoDB server supports them.

If transactions are unavailable:

-   Use a durable sync record and explicit processing state.
-   Make each individual write idempotent.
-   Record progress/effects using unique keys.
-   Retry incomplete work.
-   Mark the operation `synced` only after every required effect is
    confirmed.

Do not claim atomicity if the configured MongoDB deployment cannot
provide it.

------------------------------------------------------------------------

## 5. Backend reconciliation / event indexing

After the immediate endpoint and retry flow are reliable, add
backend-side reconciliation so recovery does not depend on the user's
browser remaining open.

Preferred approach:

-   Add a background job/worker that scans supported bounty contracts
    for `RewardsAssigned` events.
-   Use the chain configuration in `config/chains.js`; do not hardcode
    one network.
-   Track a last-scanned block per chain and contract.
-   Scan with a configurable confirmation depth appropriate to each
    chain.
-   Persist discovered events using the same unique event identity as
    the API path.
-   Send discovered events through the same shared synchronization
    service used by `distributeRewards`.
-   Reprocess pending/failed sync records with bounded retries and
    backoff.
-   Do not create a second, separate implementation of reward projection
    logic in the worker.
-   Handle RPC outages, rate limits, process restarts, and overlapping
    worker runs.
-   Use a lock or atomic claim/lease on jobs so multiple worker
    instances do not apply the same work concurrently.
-   Re-scan a small overlap of recent blocks to recover from missed
    events or temporary RPC failures; deduplicate by event identity.
-   Consider chain reorganizations: only finalize according to the
    configured confirmation policy, and handle orphaned logs if the
    supported chain/provider requires it.

The existing `jobs/updateStatusJob.js` is for bounty status updates. Do
not overload it with blockchain indexing without first checking its
scheduling and responsibilities. A separate job/module is preferable.

The independent reconciliation worker is implemented in Phase 3 below.

------------------------------------------------------------------------

## 6. API contract

Keep the existing route unless a change is necessary:

`POST /api/bounty/:id/distribute`

Request should continue to carry the transaction identity and network
context, for example:

``` json
{
  "txHash": "0x...",
  "blockchainId": "123",
  "chainId": 677,
  "bountyContract": "0x..."
}
```

Treat client-provided values as claims to verify, not authoritative
data.

Return structured results, for example:

``` json
{
  "status": "synced",
  "alreadySynced": false,
  "txHash": "0x...",
  "chainId": 677,
  "winners": []
}
```

For a retry after successful synchronization:

``` json
{
  "status": "synced",
  "alreadySynced": true,
  "txHash": "0x...",
  "chainId": 677,
  "winners": []
}
```

For a verified transaction that still needs asynchronous work, return a
clear pending status if the implementation supports asynchronous
processing. Do not return success while required database projections
remain incomplete.

Use appropriate HTTP status codes and stable machine-readable error
codes. The frontend should distinguish: - `TRANSACTION_NOT_CONFIRMED` -
`TRANSACTION_REVERTED` - `EVENT_NOT_FOUND` - `EVENT_MISMATCH` -
`CONFLICTING_DISTRIBUTION` - `SYNC_PENDING` - `SYNC_FAILED` - retryable
RPC/network errors

Avoid leaking sensitive internal details in production error responses;
log detailed diagnostics on the server.

------------------------------------------------------------------------

## 7. Security and correctness boundaries

-   Do not trust a transaction hash alone. Verify receipt, chain,
    contract address, event name, event bounty ID, and successful
    status.
-   Do not trust winner addresses or amounts supplied by the browser
    when they can be derived from the confirmed event and contract.
-   Authenticate and authorize the caller according to the project's
    existing authorization model. Inspect current middleware and route
    protection; do not silently introduce a breaking auth requirement
    without integrating it correctly.
-   Validate that the bounty belongs to the expected chain and contract.
-   Never let a caller synchronize an unrelated contract's event into a
    bounty.
-   Normalize wallet addresses and hashes consistently.
-   Do not use floating-point arithmetic for on-chain token amounts.
-   Do not weaken the smart contract's one-time winner-assignment
    protection.
-   Do not ask users to repeat a successful on-chain action to repair an
    off-chain database failure.
-   Do not delete or overwrite existing reward/claim records as a
    shortcut.
-   Preserve current Arc and BOT Chain support and use per-chain
    contract configuration.
-   Do not hardcode a single chain ID, RPC URL, or contract address in
    the new synchronization logic.

------------------------------------------------------------------------

## 8. Implementation order

Work in small, reviewable steps. Inspect relevant files and tests before
changing code.

### Phase 1 --- Immediate recovery fix

1.  Refactor `pages/BountyDetail.jsx` to separate transaction execution
    from backend synchronization.
2.  Persist the confirmed transaction details as a pending-sync record.
3.  Add a retry synchronization UI/action that never submits a new
    blockchain transaction.
4.  Refactor `distributeRewards` so a retry with the same verified
    transaction can continue rather than being rejected by
    `rewardsAssignedOnChain`.
5.  Ensure reward, bounty, submission, and user-stat writes are
    idempotent.
6.  Return structured synchronization statuses.
7.  Add tests for the endpoint and frontend recovery behavior.

### Phase 2 --- Durable backend recovery

1.  Add the distribution-sync model and unique event identity.
2.  Add a shared service that verifies a chain event and applies all
    database projections.
3.  Use MongoDB transactions if the deployed topology supports them.
4.  Otherwise implement explicit idempotent effects and resumable
    processing.
5.  Add retry/backoff and operational logging.

### Phase 3 --- Automatic reconciliation

1.  Add a chain-aware event scanner/worker.
2.  Persist scan checkpoints.
3.  Discover `RewardsAssigned` events independently of frontend
    requests.
4.  Reuse the shared synchronization service.
5.  Add overlap scanning, deduplication, and concurrency protection.
6.  Test restart and RPC outage recovery.

Do not attempt all phases in one large rewrite. Complete and test Phase
1 before proceeding.

------------------------------------------------------------------------

## 9. Required tests and acceptance criteria

Use the project's existing test framework if one exists. If no test
framework is configured, recommend and add the smallest suitable test
setup without changing the runtime stack unnecessarily.

At minimum, test these cases:

  -----------------------------------------------------------------------
  Scenario                            Expected result
  ----------------------------------- -----------------------------------
  Wallet rejects transaction before   No distribution sync record; user
  broadcast                           sees submission failure

  Transaction is pending              UI shows pending; no backend
                                      success is claimed

  Transaction reverts                 No rewards are written

  Transaction succeeds and API        All projections synchronized
  succeeds                            

  Transaction succeeds but API        Pending hash retained; user can
  request times out                   retry sync only

  First API call fails before any DB  Same-hash retry completes
  write                               

  Failure occurs after reward upserts Retry completes remaining work
                                      without duplicate rewards

  Failure occurs after bounty update  Retry completes remaining work
                                      without duplicate statistics

  Same transaction is synchronized    Second request returns idempotent
  twice                               success

  Same event is discovered by API and One logical distribution only
  worker                              

  Different transaction is submitted  Conflict; no overwrite
  for an already distributed bounty   

  Receipt belongs to another contract Rejected

  Event bounty ID does not match      Rejected
  requested bounty                    

  Event is missing                    Rejected; no projection marked
                                      synced

  RPC is temporarily unavailable      Retryable state; no false failure
                                      or duplicate transaction

  Two sync attempts run concurrently  Only one logical set of effects is
                                      applied

  User statistics are retried         `tasksCompleted` increments exactly
                                      once per winner per distribution

  Winner has already claimed reward   Retry does not revert claimed
                                      status or claim metadata

  Supported chain is BOT Chain (677)  Correct chain client and contract
  or Arc                              are used
  -----------------------------------------------------------------------

Acceptance criteria:

-   A confirmed `RewardsAssigned` transaction is never resubmitted
    merely because MongoDB synchronization failed.
-   Retrying the same transaction hash eventually produces the same
    final MongoDB state as a successful first attempt.
-   No duplicate reward records are created.
-   No winner's completion statistic is incremented more than once for
    the same distribution.
-   The bounty is not marked fully synchronized until all required
    projections are complete.
-   The backend can recover even if the user closes the browser, once
    the reconciliation worker discovers the confirmed event.
-   Existing claim flows and existing distributions remain intact.
-   Tests demonstrate the failure cases above.

The scanner waits for each chain's configured confirmation depth and
rescans an overlap window. This protects against ordinary short reorgs;
automatic rollback after a reorg deeper than that configured finality
threshold is not supported. Such a chain-level incident requires manual
reconciliation of the affected distribution.

------------------------------------------------------------------------

## 10. Agent operating rules

The coding agent must follow these rules:

1.  **Inspect before editing.** Read the complete relevant functions,
    schemas, routes, middleware, chain configuration, package scripts,
    and existing tests.
2.  **Map the data model.** Confirm actual field types and
    wallet-address representation in Bounty, Reward, Submission, and
    User documents.
3.  **Inspect the contract.** Confirm the deployed ABI/event and the
    exact `claimableRewards` behavior. Do not assume the event or
    contract interface beyond the checked-in ABI and source.
4.  **Plan before changing.** List files to be modified and explain the
    intended data flow.
5.  **Avoid broad rewrites.** Do not refactor unrelated bounty, claim,
    wallet, UI, or network functionality.
6.  **Preserve compatibility.** Existing Arc and BOT Chain
    configurations and old reward/claim records must continue working.
7.  **Handle existing data.** Before adding unique indexes, inspect
    whether existing documents violate the proposed index. Provide a
    safe migration or report the conflict; do not silently delete
    records.
8.  **Test each phase.** Run relevant tests after each logical change,
    then run the full available test suite and build.
9.  **Do not fabricate verification.** Report exactly which commands
    ran, which passed, which failed, and what could not be tested.
10. **Summarize the final changes.** Include changed files, new
    environment variables (if any), database index/migration steps, test
    results, and any manual deployment steps.

## Final design principle

**The on-chain transaction is the business action. MongoDB
synchronization is a recoverable projection of that action.**

Once the chain confirms winner assignment, every subsequent retry must
resume synchronization using the original transaction/event identity. It
must never ask the smart contract to assign those winners again.
