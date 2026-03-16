# How to Change Stripe Products and Prices

## Purpose

Replace the starter's default Stripe catalog with your own plans.

## How It Works

The pricing page dynamically reads all active products and prices from Stripe via `features/billing/server/stripe-catalog.ts`. You do not hardcode plan names or prices in the UI.

The mapping from Stripe product names to internal plan IDs lives in `features/billing/plans/stripe-map.ts`. This is how the app knows which capabilities and limits to grant.

## Files to Edit

- Stripe Dashboard — create or rename products and prices
- `features/billing/plans/stripe-map.ts` — map your Stripe product names to internal plan IDs
- `features/billing/plans/plans.ts` — define capabilities and limits for each plan (if adding a new plan)

## Steps

### Step 1 — Create products in Stripe

In your Stripe Dashboard, create products with recurring prices. Set the product name to something meaningful (e.g. "Starter", "Growth", "Enterprise").

To show features on the pricing page, add a `features` key to the product's metadata with a comma-separated list:

```
features: Unlimited tasks, 10 team members, Priority support
```

### Step 2 — Map Stripe product names to plan IDs

Edit `features/billing/plans/stripe-map.ts`:

```ts
const stripeProductToPlan: Record<string, PlanId> = {
  Starter: "free",
  Growth: "pro",
  Enterprise: "team",
};
```

The key must match the Stripe product name exactly.

### Step 3 — Add monthly and yearly prices (optional)

If a product has both a monthly and a yearly price in Stripe, the pricing page will automatically show a monthly/yearly toggle. No code change needed.

### Step 4 — Update plan capabilities and limits

If you added a new plan ID, define it in `features/billing/plans/plans.ts`. See `how-to-add-a-new-plan.md`.

### Step 5 — Done

The pricing page renders dynamically from Stripe. Product names, prices, and features update automatically.

## Common Mistakes

- Mismatching the Stripe product name in `stripe-map.ts` (case-sensitive)
- Forgetting to add the plan ID to `PlanId` type union when creating a new plan
- Setting a product as inactive in Stripe without realizing it will disappear from the pricing page

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 5/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 25/25
- Verdict: excellent

## Related Documents

- `how-to-add-a-new-plan.md`
- `how-to-understand-webhooks.md`
- `../../02-getting-started/billing-setup.md`
