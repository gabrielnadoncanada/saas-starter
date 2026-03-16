# How to Edit Pricing Page

## Purpose

Change plan copy, feature bullets, and pricing presentation.

## Files to Edit

- `app/(marketing)/pricing/page.tsx`
- `features/billing/components/PricingSection.tsx`

## Steps

### Step 1 - Keep the route simple

`app/(marketing)/pricing/page.tsx` is just the route entry point. Most real edits belong in `PricingSection`.

### Step 2 - Change plan names, bullets, and card structure

Edit `features/billing/components/PricingSection.tsx`.

### Step 3 - Change checkout behavior only if needed

If you need new CTA logic, then edit billing actions and server functions too.

## Common Mistakes

- Editing the route file and expecting the visible pricing cards to change
- Changing Stripe values without changing the displayed plan copy

## Related Documents

- `../billing/how-to-change-stripe-products-and-prices.md`
