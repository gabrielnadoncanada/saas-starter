# Troubleshooting Billing

## Pricing page opens but products are wrong or missing

The pricing component looks up Stripe product names `Base` and `Plus`. Verify those products exist in Stripe.

## Clicking a pricing button does nothing useful

Check:

- the user is signed in
- the current team exists
- the submitted `priceId` is valid

The checkout entry point is `features/billing/actions/checkout.action.ts`.

## Checkout succeeds but the app never updates plan state

Check the webhook route:

- `/api/stripe/webhook`

Then verify:

- `STRIPE_WEBHOOK_SECRET`
- Stripe CLI forwarding in local development
- the app can reach the database

## Team plan labels are empty

Plan state is stored on the `Team` model. If the webhook is not processed, `planId` and `subscriptionStatus` stay empty.
