# How to Add a New Plan

## Purpose

Add a new billing plan (e.g. "Enterprise") to the starter.

## Files to Edit

- `features/billing/plans/plans.ts` — define the plan
- `features/billing/plans/stripe-map.ts` — map Stripe product name to plan ID
- Stripe Dashboard — create the product and price

## Steps

### Step 1 — Define the plan

Add a new entry to the `plans` object in `features/billing/plans/plans.ts`:

```ts
export type PlanId = "free" | "pro" | "team" | "enterprise";

export const plans: Record<PlanId, Plan> = {
  // ...existing plans...

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    capabilities: [
      "task.create",
      "task.export",
      "team.invite",
      "team.analytics",
      "billing.portal",
      "api.access",
    ],
    limits: {
      tasksPerMonth: Infinity,
      teamMembers: Infinity,
      storageMb: 500000,
    },
  },
};
```

### Step 2 — Create the Stripe product

In your Stripe Dashboard, create a new product (e.g. named "Enterprise") with a recurring price.

### Step 3 — Map Stripe to internal plan

Add the mapping in `features/billing/plans/stripe-map.ts`:

```ts
const stripeProductToPlan: Record<string, PlanId> = {
  // ...existing mappings...
  Enterprise: "enterprise",
};
```

The key must match the Stripe product name exactly.

### Step 4 — Done

That's it. The guards, usage tracking, and UI components will automatically use the new plan's capabilities and limits.

## Common Mistakes

- Forgetting to add the plan ID to the `PlanId` type union
- Mismatching the Stripe product name in `stripe-map.ts`

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 5/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 25/25
- Verdict: excellent

## Related Documents

- `how-to-change-plan-gating.md`
- `how-to-change-stripe-products-and-prices.md`
- `../../03-understanding-the-starter/billing-architecture.md`
