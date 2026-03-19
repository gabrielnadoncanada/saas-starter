# How to Add a New Plan

## Purpose

Add a new billing plan (e.g. "Enterprise") to the starter.

## Files to Edit

- `features/billing/config/billing.config.ts` - define the plan, its Stripe aliases, and its capabilities and limits
- Stripe Dashboard - create the product and price

## Steps

### Step 1 - Define the plan

Add a new entry to the `plans` object in `features/billing/config/billing.config.ts`:

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
      aiRequestsPerMonth: 5000,
      emailSyncsPerMonth: 1000,
    },
    pricingModel: "flat",
    stripePrices: {
      monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!,
    },
  },
};
```

### Step 2 - Create the Stripe product

In your Stripe Dashboard, create a new product (for example named "Enterprise") with a recurring price.

### Step 3 - Add the Stripe price env vars

Add the matching price IDs to your env file:

```ts
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

The config now resolves plans from price IDs, not product names.

### Step 4 - Done

That's it. The guards, usage tracking, and UI components will automatically use the new plan's capabilities and limits.

## Common Mistakes

- Forgetting to add the plan ID to the `PlanId` type union
- Forgetting to add the Stripe price env vars used by the plan config

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
