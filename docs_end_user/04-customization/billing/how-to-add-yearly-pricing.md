# How to Add Yearly Pricing

## Purpose

Offer annual billing in Stripe and show it on the pricing page.

## Files to Edit

- Stripe dashboard or seed strategy
- `features/billing/components/PricingSection.tsx`
- optionally `shared/lib/db/seed.ts`

## Steps

### Step 1 - Create yearly prices in Stripe

Add yearly recurring prices for the products you want to sell.

### Step 2 - Decide how the pricing page selects prices

The current pricing page picks the first matching price it finds per product. That is not enough for monthly and yearly side by side.

### Step 3 - Update `PricingSection`

Change `features/billing/components/PricingSection.tsx` so it distinguishes prices by interval and renders both choices.

### Step 4 - Update checkout forms

Make sure each CTA submits the correct yearly `priceId`.

## Common Mistakes

- Creating yearly Stripe prices but never exposing them in the UI
- Assuming the current code already supports interval switching

## Flags

- The current pricing component is optimized for one price per product, not interval selection

## Simplification Recommendation

Refactor the pricing loader to group prices by product and interval before expanding pricing options further.

## Related Documents

- `how-to-change-stripe-products-and-prices.md`
