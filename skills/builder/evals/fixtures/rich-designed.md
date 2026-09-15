# Decision Brief: Payments Provider Migration

Recommendation: **Adopt Stripe Connect** to replace our in-house payouts ledger by Q3.
This brief lays out the problem, the options we weighed, and the rollout plan. It is meant
to be read in ten minutes and decided in one meeting.

## The problem

Our home-grown payouts ledger has become the single largest source of on-call pain: it holds
custody of funds, reconciles by a nightly batch that regularly drifts, and requires a money
transmitter posture we are not staffed to maintain. Every new country means new compliance work
we do sequentially. We are spending senior engineering time on undifferentiated plumbing.

## Options considered

We looked at three realistic paths. The status quo is included as a baseline because "do nothing"
has real, ongoing costs.

### Build: keep and extend the in-house ledger

Full control and no per-transaction platform fee, but we own custody, compliance, and reconciliation
forever. Adding a country is 6–8 weeks of specialized work. This is where the on-call pain lives today.

### Buy: Stripe Connect

Stripe holds custody and owns the money-transmitter posture. Payouts, KYC, and 1099 generation are
handled by the platform. We pay a per-transaction fee and give up some control over payout timing.
Onboarding a new country becomes a config change rather than a project.

### Buy: PayPal Payouts

Similar offload of custody, but weaker programmatic onboarding and a support experience our finance
team rated poorly in the trial. Country coverage is comparable to Stripe for our markets.

## Side-by-side

| Dimension            | In-house (build) | Stripe Connect | PayPal Payouts |
| -------------------- | ---------------- | -------------- | -------------- |
| Custody & compliance | We own it        | Stripe owns it | PayPal owns it |
| New-country effort   | 6–8 weeks        | Config change  | 2–3 weeks      |
| Per-txn cost         | None             | 0.25% + $0.25  | 0.30% + $0.20  |
| Programmatic API     | Full             | Excellent      | Fair           |
| On-call burden       | High             | Low            | Medium         |

## Why Stripe

The per-transaction fee is real, but at our volume it is less than the fully-loaded cost of the two
engineers currently maintaining the ledger, and it converts a fixed headcount cost into a variable
one that scales with revenue. The compliance offload is the decisive factor: it removes a class of
risk we are not equipped to carry.

> The migration is reversible at the account level for 90 days, so the downside is bounded: if
> reconciliation or payout timing does not meet our SLA, we can fall back to the in-house ledger
> while we reassess.

## Risks

- **Payout-timing control** is reduced; we mitigate by using Stripe's scheduled payouts and keeping
  our own notification layer so customers see no change.
- **Vendor lock-in** is real; we mitigate by keeping the ledger's event log as the system of record
  so a future migration replays from our data, not Stripe's.

## Rollout plan

1. **Shadow (weeks 1–3)** — mirror every payout to Stripe in test mode, reconcile against the live
   ledger nightly, and drive drift to zero before moving any real money.
2. **Canary (weeks 4–6)** — route 5% of payouts in one low-risk country through Stripe for real,
   watch reconciliation and support tickets, and hold a go/no-go at the end of week 6.
3. **Ramp (weeks 7–10)** — expand country by country to 100%, keeping the in-house ledger warm as
   the documented fallback.
4. **Decommission (week 11+)** — freeze the in-house ledger to read-only, archive its data, and
   retire the money-transmitter compliance work.

## Ask

Approve the migration and the Q3 timeline, and free the two ledger engineers to own the Stripe
integration and reconciliation tooling for the duration of the rollout.
