# Bounty Distribution and Claim Lifecycle

## Winner distribution

1. The creator confirms the winner assignment in their wallet.
2. The frontend waits for a successful on-chain receipt. A submitted
   transaction hash alone does not count as a completed distribution.
3. After confirmation, the distribution modal closes and the frontend saves a
   recovery record for the original transaction.
4. The backend verifies the receipt and `RewardsAssigned` event before it
   records winner rewards, updates winner submissions to `accepted`, marks
   other submissions `rejected`, and updates the bounty's distribution fields.
5. The frontend refreshes the bounty and winner data. If backend sync is
   delayed, the saved transaction can be retried without sending another
   wallet transaction. The backend reconciliation job can also recover the
   projection from chain events. Open bounty pages watch `RewardsAssigned`
   and refresh the winner and submission views when the event is confirmed.

## Reward claim

1. A winner submits one claim transaction. The claim control is hidden while
   that claim is pending or waiting for account synchronization.
2. The frontend waits for the receipt and synchronizes the same transaction
   hash with the backend. A retry only synchronizes that transaction; it does
   not submit a second claim.
3. The backend verifies the claim event and marks the matching reward as
   `claimed`, then updates the winner's claimed-reward record.
4. Once no assigned rewards remain for the bounty, the backend sets
   `lifecycleStatus` to `completed`. For a single winner this happens after
   that winner claims. For multiple winners it happens after every assigned
   reward has been claimed.
5. The frontend refreshes the bounty, winner list, claimable amount, and
   on-chain claimed state so the claim control and lifecycle status reflect
   the synchronized result. Open bounty pages watch `RewardClaimed` and
   refresh their displayed bounty and reward state when that event is seen.

## Status meanings

- A distributed bounty has assigned its rewards; distribution by itself does
  not mean all rewards have been claimed.
- A winner's submission is `accepted`; other submissions are `rejected` when
  the distribution is synchronized.
- A bounty becomes `completed` when all reward records are claimed, not when
  the creator merely assigns winners.
- The contract is authoritative for transaction results. MongoDB stores a
  recoverable projection used by the application UI.
