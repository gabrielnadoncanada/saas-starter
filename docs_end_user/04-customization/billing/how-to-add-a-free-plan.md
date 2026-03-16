# How to Add a Free Plan

## Purpose

Offer a no-payment entry plan without sending the user through Stripe checkout.

## Current State

The starter does not have a dedicated free-plan flow yet. The current pricing page is built around paid Stripe prices and subscription checkout.

## Files to Edit

- `features/billing/components/PricingSection.tsx`
- `features/billing/actions/checkout.action.ts`
- `features/teams/components/TeamSettingsPage.tsx`
- optionally `prisma/models/teams.prisma`

## Steps

### Step 1 - Decide what “free” means

The simplest version is:

- no Stripe checkout
- `planName` shown as `Free`
- `subscriptionStatus` left empty

### Step 2 - Add a free card or button

Edit `features/billing/components/PricingSection.tsx` and add a free-plan card that links directly into the app instead of submitting to Stripe.

### Step 3 - Decide whether you need persisted plan state

If free users need explicit DB state, add a stored value to the team record and set it during onboarding or plan selection.

### Step 4 - Update team settings copy

Edit `features/teams/components/TeamSettingsPage.tsx` so free teams display the right label.

## Common Mistakes

- Treating a free plan like a Stripe subscription when you do not need that complexity
- Adding free-plan UI without deciding how gating should work

## Complexity Scorecard

- Time to find where to edit: 3/5
- Number of files to modify: 3/5
- Architecture explanation required: 3/5
- Locality of change: 3/5
- Buyer confidence after reading: 3/5
- Total: 15/25
- Verdict: borderline

## Flags

- The starter does not yet expose one obvious free-plan entry point
- Free-plan behavior is partly a product decision, not only a code change

## Simplification Recommendation

Add one small server function for “assign free plan to current team” and call it from a free-plan CTA. That would make this guide much shorter and more local.

## Related Documents

- `how-to-change-plan-gating.md`
