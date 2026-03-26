# How to Change Stripe Products and Prices

## Purpose

Replace the starter's default Stripe catalog with your own plans.

## How It Works

The pricing page now reads plan names, features, and display prices from `features/billing/config/billing.config.ts`. Stripe is used for checkout and webhook confirmation, not for building the pricing page UI.

The mapping from Stripe price IDs to internal plan IDs lives in `features/billing/config/billing.config.ts`. This is how the app knows which capabilities and limits to grant.

## Files to Edit

- Stripe Dashboard - create or rename products and prices
- `features/billing/config/billing.config.ts` - map Stripe price IDs, define plan capabilities, and set limits

## Steps

### Step 1 - Create products in Stripe

In your Stripe Dashboard, create products with recurring prices. Set the product name to something meaningful (for example "Starter", "Growth", "Enterprise").

To show features on the pricing page, add a `features` key to the product's metadata with a comma-separated list:

```txt
features: Unlimited tasks, 10 team members, Priority support
```

### Step 2 - Map Stripe price IDs to plan IDs

Edit the relevant plan in `features/billing/config/billing.config.ts`:

```ts
pro: {
  // ...
  stripePrices: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  },
}
```

These configured price IDs are the source of truth for checkout and plan resolution.

### Step 3 - Add monthly and yearly prices (optional)

If a product has both a monthly and a yearly price in Stripe, the pricing page will automatically show a monthly/yearly toggle. No code change is needed.

### Step 4 - Update plan capabilities and limits

If you added a new plan ID, define it in `features/billing/config/billing.config.ts`. See `how-to-add-a-new-plan.md`.

### Step 5 - Done

The pricing page renders dynamically from Stripe. Product names, prices, and features update automatically.

## Common Mistakes

- Forgetting to add the Stripe price IDs in `billing.config.ts`
- Forgetting to add the plan ID to `PlanId` when creating a new plan
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
