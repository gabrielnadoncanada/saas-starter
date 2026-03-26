# How to Add a Free Plan

## Purpose

Offer a no-payment entry plan without sending the user through Stripe checkout.

## Current State

The starter ships with a `free` plan already defined in `features/billing/config/billing.config.ts`. When a team has no active configured Stripe price, the guards resolve access to `"free"` automatically.

The free plan is **the default**. No code change is needed to have it work.

## Files to Edit

- `features/billing/config/billing.config.ts` - adjust free plan capabilities and limits
- `features/billing/components/PricingSection.tsx` - optionally add a free-plan card

## Steps

### Step 1 - Customize the free plan

Edit the `free` entry in `features/billing/config/billing.config.ts`:

```ts
free: {
  id: "free",
  name: "Free",
  capabilities: ["task.create", "billing.portal"],
  limits: {
    tasksPerMonth: 10,
    teamMembers: 1,
    storageMb: 100,
    aiRequestsPerMonth: 0,
    emailSyncsPerMonth: 0,
  },
  pricingModel: "flat",
  stripePrices: {},
},
```

Add or remove capabilities and adjust limits to match your product.

### Step 2 - Optionally show a free-plan card on the pricing page

If you want a visible "Free" tier on your pricing page, add a card in `PricingSection.tsx` that links to `/sign-up` instead of submitting to Stripe checkout.

### Step 3 - Test the gating

Sign in without a Stripe subscription. The guards will resolve your plan to `free` and enforce the capabilities and limits you defined.

## How It Works

When a team has no active paid plan, the guards resolve the team to `free`. The guards then check the `free` plan's capabilities and limits. No special database state is needed.

## Common Mistakes

- Adding a free-plan Stripe product when you don't need one
- Forgetting that the free plan is already the default fallback

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
- `../../03-understanding-the-starter/billing-architecture.md`
