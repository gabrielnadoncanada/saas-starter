# Billing Architecture

## Overview

Billing is split into two concerns:

1. **Stripe** handles payments, subscriptions, and plan selection
2. **Application code** handles what each plan gives access to (capabilities, limits, usage)

Stripe decides *which* plan is active. The app decides *what that plan unlocks*.

## How Plan State Flows

```
Stripe checkout / webhook
  → team.planName synced to DB
    → resolvePlanFromStripeName() maps to PlanId
      → plans.ts defines capabilities + limits
        → guards enforce access
```

## Key Files

| File | Role |
|------|------|
| `features/billing/plans/plans.ts` | Single source of truth for plan definitions |
| `features/billing/plans/capabilities.ts` | Typed list of all gatable features |
| `features/billing/plans/limits.ts` | Typed list of all usage limits |
| `features/billing/plans/stripe-map.ts` | Maps Stripe product names to internal plan IDs |
| `features/billing/guards/` | Backend + frontend guard functions |
| `features/billing/usage/usage-service.ts` | Tracks and queries usage (e.g. tasks created this month) |
| `features/billing/errors/` | Typed errors: `UpgradeRequiredError`, `LimitReachedError` |
| `features/billing/components/` | UI: `UpgradeCard`, `PlanBadge`, `UsageMeter` |

## Plan Definitions

Plans are defined in `features/billing/plans/plans.ts`. Each plan has:

- `id` — internal key (`free`, `pro`, `team`)
- `name` — display name
- `capabilities` — list of features the plan unlocks
- `limits` — usage quotas (tasks per month, team members, etc.)

## Stripe Integration

The Stripe integration lives in `features/billing/server/`:

- **Checkout**: creates a Stripe checkout session with trial
- **Webhooks**: sync subscription status to `team.planName` and `team.subscriptionStatus`
- **Customer portal**: lets users manage their subscription via Stripe

The `stripe-map.ts` file bridges Stripe product names to internal plan IDs. This is the only file where Stripe naming touches plan logic.

## Gating

Two kinds of gating are available:

### Capability gating

"Does this plan include this feature?"

```ts
hasCapability(planId, "task.export")     // boolean check
assertCapability(planId, "task.export")  // throws UpgradeRequiredError
```

### Limit gating

"Has the team used up their quota?"

```ts
checkLimit(planId, "tasksPerMonth", usage)  // returns { allowed, remaining }
assertLimit(planId, "tasksPerMonth", usage) // throws LimitReachedError
```

## Usage Tracking

Usage is tracked via the `UsageRecord` table. The service provides:

- `recordUsage(teamId, limitKey)` — log an event after a successful action
- `getMonthlyUsage(teamId, limitKey)` — count events this calendar month
- `getTotalUsage(teamId, limitKey)` — count all-time events

## UI Components

- `<UpgradeCard>` — shows "upgrade required" with a link to pricing
- `<PlanBadge>` — displays the current plan as a badge
- `<UsageMeter>` — progress bar showing usage vs. limit

## Related Documents

- `../04-customization/billing/how-to-change-plan-gating.md`
- `../04-customization/billing/how-to-add-a-free-plan.md`
- `../04-customization/billing/how-to-change-stripe-products-and-prices.md`
