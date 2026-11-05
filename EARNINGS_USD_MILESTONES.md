# USD Earnings Implementation Milestones

## Goal

Show an accurate USD-equivalent value for rewards earned across supported
networks without adding unlike token quantities together. Keep the underlying
claim amounts exact and retain enough asset information to explain each
conversion.

## Milestone 1 — Preserve reward asset identity

**Status: Complete**

- Persist token symbol and token decimals on assigned rewards and claimed
  reward ledger entries, along with the existing chain ID and exact base-unit
  amount.
- Carry the bounty's token identity into the reward record and then into the
  user's claimed reward history.
- Maintain compatibility with existing claims. Until backfilled, missing asset
  metadata is interpreted using that chain's configured native currency;
  unsupported chain metadata must fail rather than be guessed.
- Scope: the currently verified payout flow only accepts each configured
  chain's native currency. Supporting arbitrary ERC-20 tokens additionally
  requires recording and verifying token contract addresses and decimals.

## Milestone 2 — Add trusted USD price lookup

**Status: Complete**

- Add a backend price service with explicit asset-to-provider mappings.
- Treat the supported Arc USDC asset as USD-pegged according to an explicit
  policy; retrieve BOT pricing from CoinPaprika's BOT Chain ticker endpoint.
- Validate provider responses, use request timeouts, cache quotes, and define
  behavior for stale or unavailable prices. Never turn a missing quote into a
  zero or a success-shaped total.
- Return quote timestamps/source metadata so the displayed valuation is
  transparent.

Implementation policy: BOT requests time out after 5 seconds, validated
CoinPaprika quotes are cached for 60 seconds, and provider quotes older than
15 minutes (or more than 60 seconds in the future) are rejected. There is no
stale-cache fallback. Arc USDC returns an explicit $1 peg-assumption quote.
Testnets and unknown assets are not priced.

## Milestone 3 — Aggregate and display USD values

- Calculate each claimed reward's current USD value from its exact amount,
  stored decimals, and mapped asset price; sum only converted USD amounts.
- Return `totalEarningsUsd` and a per-asset breakdown from the authenticated
  dashboard/profile APIs. Keep token-denominated amounts available separately.
- Update Dashboard and Analytics displays to use the USD field and clearly
  label it as an estimated value at current prices.
- Keep all API consumers consistent; do not silently relabel raw token totals
  as dollars.

## Milestone 4 — Reconcile legacy earnings and complete verification

- Audit legacy `totalEarnings` values and claimed reward history. Reconstruct
  asset attribution from trustworthy claim/bounty records where possible;
  quarantine or explicitly report values that cannot be attributed.
- Do not convert an unattributed raw total using an assumed chain or token.
- Add migration/backfill coverage and tests for mixed-asset sums, price-feed
  errors, cache behavior, legacy records, and API/UI response contracts.
- Run backend and frontend targeted tests, then the relevant full suites before
  rollout.

## Implementation notes

- The existing claim ledger preserves chain ID and raw reward amount, but
  `getTotalEarnings` adds token quantities together and the dashboard formats
  that raw result as dollars.
- A chain ID alone is not a permanent token identifier. Milestone 1 records the
  current supported native-asset symbol and precision; extending payouts to
  multiple tokens on one chain must use a verified asset identity (including a
  token contract address or an explicit native-token marker).
- The CoinPaprika ticker is a current quote, not historical claim-time pricing.
  The planned total is therefore a current estimated USD value, not realized
  USD at payout time.
