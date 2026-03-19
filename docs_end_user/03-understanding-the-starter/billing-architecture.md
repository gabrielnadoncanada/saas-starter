# Billing Architecture

## Overview

Billing is split into two concerns:

1. **Stripe** handles payments, subscriptions, and plan selection
2. **Application code** handles what each plan gives access to (capabilities, limits, usage)

Stripe decides *which* plan is active. The app decides *what that plan unlocks*.

## How Plan State Flows

```txt
Stripe checkout / webhook
  -> Stripe price id synced to app state
    -> resolvePlanFromStripePriceId() maps to PlanId
      -> billing.config.ts defines capabilities + limits
        -> guards enforce access
```

## Key Files

| File | Role |
|------|------|
| `features/billing/config/billing.config.ts` | Single source of truth for plans, capabilities, limits, configured Stripe price IDs, and pricing models |
| `features/billing/guards/` | Backend + frontend guard functions |
| `features/billing/usage/usage-service.ts` | Tracks and queries usage (e.g. tasks created this month) |
| `features/billing/errors/` | Typed errors: `UpgradeRequiredError`, `LimitReachedError` |
| `features/billing/components/` | UI: `UpgradeCard`, `PlanBadge`, `UsageMeter` |

## Plan Definitions

Plans are defined in `features/billing/config/billing.config.ts`. Each plan has:

- `id` - internal key (`free`, `pro`, `team`)
- `name` - display name
- `capabilities` - list of features the plan unlocks
- `limits` - usage quotas (tasks per month, team members, etc.)
- `stripePrices` - configured Stripe price IDs for monthly, yearly, or one-time checkout

The same file also defines:

- the allowed capability keys
- the allowed limit keys
- the supported pricing models

## Stripe Integration

The Stripe integration lives in `features/billing/server/`:

- **Checkout**: creates a Stripe checkout session with trial
- **Webhooks**: sync `team.planId` and `team.subscriptionStatus`
- **Customer portal**: lets users manage their subscription via Stripe

Configured Stripe price IDs and pricing model defaults live in `features/billing/config/billing.config.ts`. That keeps the billing shape editable in one place.

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

Usage is tracked via the `UsageCounter` table. The service provides:

- `consumeMonthlyUsage(teamId, limitKey, planId)` - atomically reserves one unit of monthly usage
- `getMonthlyUsage(teamId, limitKey)` - reads usage for the current calendar month

## UI Components

- `<UpgradeCard>` - shows "upgrade required" with a link to pricing
- `<PlanBadge>` - displays the current plan as a badge
- `<UsageMeter>` - progress bar showing usage vs. limit

## Related Documents

- `../04-customization/billing/how-to-change-plan-gating.md`
- `../04-customization/billing/how-to-add-a-free-plan.md`
- `../04-customization/billing/how-to-change-stripe-products-and-prices.md`
