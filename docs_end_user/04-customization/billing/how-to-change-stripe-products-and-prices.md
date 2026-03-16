# How to Change Stripe Products and Prices

## Purpose

Replace the starter’s default Stripe catalog with your own plans.

## Files to Edit

- Stripe dashboard
- `shared/lib/db/seed.ts`
- `features/billing/components/PricingSection.tsx`

## Steps

### Step 1 - Decide your product names

The current code looks for products named `Base` and `Plus`.

### Step 2 - Change the seed if you still use seeded products

Edit `shared/lib/db/seed.ts` if you want the starter to create different default products and prices.

### Step 3 - Change the pricing lookup logic

Update `features/billing/components/PricingSection.tsx` so it finds your products by the new names.

### Step 4 - Update visible marketing copy

Change plan names, features, and pricing text in the same component.

## Common Mistakes

- Renaming Stripe products in the dashboard without updating the code lookup
- Changing price amounts in Stripe but not the visible copy

## Related Documents

- `how-to-add-yearly-pricing.md`
- `../../02-getting-started/billing-setup.md`
