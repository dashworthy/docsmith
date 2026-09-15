# Onboarding Guide: The Orders Service

Welcome to the Orders service. This guide is what we wish we'd had on day one: enough context
to make your first change safely, plus the mental model behind why the service is shaped the way
it is. Read it once end to end, then keep it open as a reference for your first few weeks.

## What the Orders service does

Orders is the system of record for everything between "customer clicks Buy" and "warehouse ships
the box." It owns the order lifecycle, coordinates payment and inventory, and publishes the events
that downstream systems (analytics, email, the customer portal) react to. It does not own the
catalog, pricing, or fulfillment — it orchestrates them.

The single most important thing to internalize: Orders is an **orchestrator**, not a monolith. When
you find yourself wanting to add product logic here, that is almost always a signal the logic belongs
in the service that owns that domain, with Orders calling it.

## The order lifecycle

An order moves through a fixed set of states, and every transition is an explicit, logged event.
There are no implicit state changes — if the state changed, an event says why. The states are
`draft`, `placed`, `paid`, `fulfilling`, `shipped`, `delivered`, and the terminal `cancelled` and
`refunded`. A state never moves backward; a "cancel after ship" becomes a `refunded` flow, not a
transition back to `placed`.

This strictness is deliberate. Early on, the service allowed ad-hoc transitions and we spent months
chasing bugs where an order was somehow `paid` but had never been `placed`. The state machine now
rejects any transition not in its table, and that single constraint eliminated an entire class of
support tickets.

## Architecture at a glance

The service is three deployables that share a database schema but never a process. The **API** takes
customer and internal requests and writes intent. The **workflow engine** advances orders through
their lifecycle by reacting to events. The **projector** builds read-optimized views for the portal
and analytics. Keeping these separate means a slow analytics query can never degrade checkout.

Each deployable is independently scalable. In practice the API scales with traffic, the workflow
engine scales with order volume (which lags traffic), and the projector is steady. If you see
checkout latency, look at the API and its downstream calls first — the other two are almost never
the cause.

## Making your first change

Your first change should be small and observable. A good starter task is adding a field to an
existing event payload. Here is the shape of that work.

First, add the field to the event schema and regenerate types. Schemas live in `schemas/` and are
the contract between producers and consumers, so a change here is a change everyone sees. Never edit
a generated type by hand — regenerate it.

Second, populate the field where the event is produced. The producer is always the service that owns
the fact; if you're adding a field that Orders doesn't own, you're probably reaching for data that
should come from another service's API instead.

Third, add a consumer test that asserts the new field flows through. We treat the event contract as
tested behavior, not documentation, so an untested field is considered not to exist.

## Testing philosophy

We test behavior, not implementation. A test should read like a description of what the service
promises: "when an order is paid, an `order.paid` event is published with the payment id." Tests
that assert on internal method calls break every refactor and protect nothing, so we avoid them.

The test suite has three layers. Unit tests cover the state machine and pure logic and run in
milliseconds. Integration tests exercise a real database and the event bus in a container. A small
set of end-to-end tests drives a full order through every state; these are slow, so we keep them few
and precious. When a bug escapes, the fix includes the test at the lowest layer that would have
caught it.

## Deployment and rollback

We deploy on merge to `main`, many times a day, behind feature flags. A deploy is not a release: code
ships dark and is turned on by flag, so shipping and enabling are separate decisions with separate
blast radii. This is why "it's deployed" and "it's live" mean different things here — be precise.

Rollback is a flag flip, not a redeploy, so it takes seconds. Because of that, the safest way to ship
a risky change is behind a flag you can kill instantly, not a careful deploy you'd have to revert.
If a change can't sit behind a flag, that's worth a conversation before you start.

## Observability

Every order carries a correlation id from its first request, threaded through every event, log line,
and downstream call. When you're debugging, start from the correlation id — it turns "something went
wrong somewhere" into a single filter that shows the whole order's history across all three
deployables.

Dashboards live in the `orders` folder in Grafana. The one you'll use most is "Order funnel," which
shows conversion between each lifecycle state; a sudden drop between two states is usually the first
sign of an incident, often before error rates move.

## On-call basics

On-call for Orders is one week at a time. Most pages are one of three things: a downstream dependency
is slow (check its status first), a deploy introduced a regression (check what shipped in the last
hour), or a data issue is failing a state transition (find the order by correlation id and read its
event history). The runbook has a decision tree for each; start there rather than diving into code.

The golden rule: mitigate first, understand second. If flipping a flag or rolling back stops customer
pain, do it now and investigate after. A calm five-minute mitigation beats a clever thirty-minute
fix while checkout is down.

## Where to go next

Read the state-machine table in `docs/lifecycle.md` until you can draw it from memory — it is the
spine of everything here. Then pick up a starter task from the "good first issue" board and pair with
whoever's on call. By the end of week one you should have shipped one small, flagged change end to
end. Welcome aboard.
