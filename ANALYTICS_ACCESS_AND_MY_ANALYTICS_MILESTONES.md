# Analytics Access and My Analytics Milestones

**Milestone group:** `analytics-access-and-my-analytics`
**Status:** Milestone 4 implemented and verified; awaiting final owner acceptance.
**Approval rule:** Complete one milestone, present its result for owner verification, and wait for explicit approval before starting the next milestone.

## Goal

Reserve Platform Analytics for configured administrators. Give every signed-in user one simple **My Analytics** page combining their creator and contributor activity, with clear labels and no unnecessary analytics terminology.

## Current behavior

- The `/analytics` page requires a connected, signed-in wallet.
- The page offers one combined **My Analytics** view; configured admins can also open Platform Analytics.
- Creator and contributor API routes require authentication and restrict access to the signed-in wallet's own data.
- The Platform Analytics API now requires an authenticated admin, and the UI only shows it to wallets configured as admins.
- The server-side `ADMIN_WALLETS` allowlist is authoritative. `VITE_ADMIN_WALLETS` controls frontend visibility only.
- Empty or all-zero analytics results show “Analytics unavailable” with a no-activity message. Network and server failures use a separate error state.

---

## Milestone 1 — Restrict Platform Analytics to admins

**ID:** `analytics-access-01`
**Status:** Implemented and approved; owner authorized Milestone 2

### Scope

- Require an authenticated admin for the platform analytics API.
- Use the server-side admin allowlist as the source of authorization.
- Show the Platform Analytics option only to configured admins in the UI.
- Keep contributor and creator personal data restricted to its owner.

### Configuration

- Add authorized wallets to backend `ADMIN_WALLETS`.
- Add the same wallets to frontend `VITE_ADMIN_WALLETS` so admins see the Platform option. Rebuild/redeploy the frontend after changing this variable.
- Backend authorization remains authoritative even if the frontend allowlist is misconfigured.

### Acceptance criteria

- An unauthenticated request to the platform endpoint is rejected.
- An authenticated non-admin request is rejected, including a direct API request that bypasses the UI.
- A configured admin can open Platform Analytics.
- A regular signed-in user sees no Platform Analytics option and can still access My Analytics.
- Existing personal analytics access continues to enforce wallet ownership.

### Owner verification gate

Present the access-control changes and test results to the project owner. **Do not begin Milestone 2 until the owner verifies and approves this milestone.**

---

## Milestone 2 — Combine creator and contributor analytics

**ID:** `analytics-access-02`
**Depends on:** `analytics-access-01` approved
**Status:** Implemented and approved; owner authorized Milestone 3

### Scope

- Replace the Contributor and Creator tabs with one **My Analytics** view.
- Combine data for the signed-in wallet without mixing unlike measures.
- Organize the view into plain sections, for example:
  - **Bounties you created:** created and active bounties, submissions received, and reward budget.
  - **Your submissions:** submitted, accepted, pending, and rejected work.
  - **Your rewards:** assigned, claimed, and claimable rewards where available.
- Show a section only when it has relevant data; explain clearly when the account has no activity.
- Ensure shared totals do not double-count activity across creator and contributor views.
- Keep the personal analytics API restricted to the authenticated wallet owner.

### Implementation notes

- Added `/analytics/me/:wallet`, returning separate creator and contributor summaries for the authenticated wallet. Existing role endpoints remain available for compatibility.
- Replaced the Contributor and Creator selectors with one **My Analytics** view. Admins can still switch to **Platform**.
- Kept creator bounty budgets and submissions received separate from the user's own submissions and rewards, so unlike measures are not combined.
- Creator and contributor sections appear only when that side has relevant activity. Empty accounts receive one no-activity message.
- Added route coverage for the combined response and wallet ownership restriction.

### Acceptance criteria

- Users can see creator and contributor activity together without switching roles.
- A user who has activity in both roles sees both sets of information.
- A user with activity in only one role sees that information without empty or misleading sections.
- All displayed personal information belongs to the signed-in wallet.
- Metric definitions distinguish creator-side figures, such as reward budget, from contributor-side earnings.

### Owner verification gate

Present the combined layout, data definitions, and examples for accounts with creator-only, contributor-only, and mixed activity. **Do not begin Milestone 3 until the owner verifies and approves this milestone.**

---

## Milestone 3 — Simplify analytics wording and empty states

**ID:** `analytics-access-03`
**Depends on:** `analytics-access-02` approved
**Status:** Implemented and approved; owner authorized Milestone 4

### Scope

- Replace unclear or technical labels with everyday language.
- Remove metrics that are not reliable, useful, or easy to explain.
- Prefer direct counts, such as **“3 of 5 submissions accepted,”** over unexplained percentages.
- Use clear labels for activity and rewards; explain any retained rate or trend in context.
- Show a simple no-data state when the selected view has no analytics content. Do not present an empty result as a request failure.
- Keep genuine network or server errors distinct from the no-data state.

### Implementation notes

- Replaced analytics-heavy personal labels with direct section names and descriptions, including **Bounties you created**, **Your submissions**, **Your rewards**, and **Bounty budget**.
- Show accepted submissions as a count out of the user's total submissions; removed the personal success rate from the combined view.
- Empty results retain the requested **Analytics unavailable** state with a plain no-activity message and no metric cards or charts.
- Network and server failures have a separate **Couldn't load analytics** state with a retry action and plain-language error text.

### Acceptance criteria

- A user can understand each metric without needing to know internal analytics terms.
- Empty analytics results show a clear no-data message and no empty charts or metric cards.
- Actual API errors remain distinguishable from an account with no analytics activity.
- Terms and labels are consistent across the full My Analytics view.

### Owner verification gate

Present the revised labels and empty states for owner review. **Do not begin Milestone 4 until the owner verifies and approves this milestone.**

---

## Milestone 4 — Verify access, data, and user experience

**ID:** `analytics-access-04`
**Depends on:** `analytics-access-03` approved
**Status:** Implemented; awaiting final owner acceptance

### Scope

- Verify backend access control, frontend visibility, combined metrics, and empty/error states.
- Add or update automated tests for the access boundaries and analytics responses.
- Review the behavior with representative admin, regular user, and no-activity accounts.

### Acceptance criteria

- Automated checks confirm admins can access platform analytics and non-admins cannot.
- Automated checks confirm personal analytics only return data for the authenticated wallet.
- Combined figures are correct for creator-only, contributor-only, and mixed-role accounts.
- Empty data is shown as no analytics content; API failures remain errors.
- The production frontend build succeeds.

### Implementation notes

- Added backend coverage for creator-only, contributor-only, and mixed-role data, confirming creator-side received submissions do not inflate a user's own submission count.
- Expanded route checks for anonymous access, non-admin platform access, admin platform access, personal wallet ownership, and empty personal data.
- Kept compatibility for older personal analytics clients that send `me` or `my` in the role segment; both aliases return the combined wallet-owned response.
- Added frontend checks for empty combined data, positive data on either personal side, and distinct network/server error copy.
- The targeted analytics backend and frontend tests pass, and the production build succeeds.
- The full frontend test suite has one unrelated existing failure in `src/services/authErrors.test.js`: it expects a generic signature error message but receives the wallet extension detail text.
- Automated checks cover the access and state logic; an interactive walkthrough with real admin and user sessions remains part of owner acceptance.

### Owner acceptance gate

Present test results and a final walkthrough. **Wait for the owner's explicit acceptance before treating the analytics work as complete or releasing it.**

---

## Milestone sequence

```text
Milestone 1: Admin-only platform access
       ↓ owner verifies and approves
Milestone 2: Combined My Analytics
       ↓ owner verifies and approves
Milestone 3: Plain language and empty states
       ↓ owner verifies and approves
Milestone 4: Access, data, and experience verification
       ↓ owner accepts final result
Complete
```

Approval of this plan authorizes planning only. Each implementation milestone remains gated by the owner's verification of the preceding milestone.
