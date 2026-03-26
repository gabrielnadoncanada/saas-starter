# How to Understand Webhooks

## Purpose

Understand how Stripe subscription events update billing state in the app.

## Files to Read

- `app/api/stripe/webhook/route.ts` — receives Stripe events
- `features/billing/server/handle-subscription-change.ts` — updates team billing fields
- `features/billing/server/finalize-checkout.ts` — links a checkout session to a team
- `app/api/stripe/checkout/route.ts` — handles the post-checkout redirect

## Flow

### Step 1 — User completes checkout

Stripe redirects the user to `/api/stripe/checkout?session_id=...`.

### Step 2 — Checkout finalization stores plan state

`finalizeCheckoutSession()` writes the Stripe customer ID, subscription ID, product name, plan name, and subscription status to the current team.

### Step 3 — Stripe sends webhook events

Later subscription changes arrive at `/api/stripe/webhook`. The route verifies the Stripe signature and dispatches by event type.

### Step 4 — The handler updates the team record

`handleSubscriptionChange()` updates or clears billing fields on the team based on the subscription status.

## Events Handled

| Event | What it does |
|-------|-------------|
| `checkout.session.completed` | Finalizes the checkout and links the subscription to the team |
| `customer.subscription.updated` | Updates plan name and subscription status on the team |
| `customer.subscription.deleted` | Clears billing fields when a subscription is cancelled |
| `invoice.payment_failed` | Marks the subscription status as past-due on the team |

## Common Mistakes

- Assuming checkout success alone is enough — webhook events are needed for renewals, cancellations, and payment failures
- Forgetting to set the `STRIPE_WEBHOOK_SECRET` environment variable
- Not forwarding webhooks locally during development (use `stripe listen --forward-to`)

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 5/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 25/25
- Verdict: excellent

## Related Documents

- `how-to-change-stripe-products-and-prices.md`
- `../../02-getting-started/billing-setup.md`
