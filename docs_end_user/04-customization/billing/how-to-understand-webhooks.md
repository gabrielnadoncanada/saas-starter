# How to Understand Webhooks

## Purpose

Understand how Stripe subscription events update billing state in the app.

## Files to Read

- `app/api/stripe/webhook/route.ts`
- `features/billing/server/handle-subscription-change.ts`
- `features/billing/server/finalize-checkout.ts`
- `app/api/stripe/checkout/route.ts`

## Flow

### Step 1 - Checkout returns to the app

After Stripe checkout, the user is sent to `/api/stripe/checkout?session_id=...`.

### Step 2 - Checkout finalization stores plan state

`finalizeCheckoutSession()` writes customer, subscription, product, plan name, and subscription status to the current team.

### Step 3 - Later subscription changes arrive by webhook

Stripe sends events to `/api/stripe/webhook`.

### Step 4 - The webhook updates the team record

`handleSubscriptionChange()` updates or clears billing fields on the team.

## Current Events Handled

- `customer.subscription.updated`
- `customer.subscription.deleted`

## Common Mistakes

- Assuming checkout success alone is enough for long-term billing state
- Forgetting the webhook secret

## Related Documents

- `../../02-getting-started/billing-setup.md`
