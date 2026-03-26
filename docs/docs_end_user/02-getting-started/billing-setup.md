# Billing Setup

## Purpose

Connect Stripe so the pricing page can start checkout and the webhook can update subscription state on teams.

## Where Billing Lives

- pricing page: `app/(marketing)/pricing/page.tsx`
- pricing UI: `features/billing/components/PricingSection.tsx`
- checkout action: `features/billing/actions/checkout.action.ts`
- Stripe client: `shared/lib/stripe/client.ts`
- webhook route: `app/api/stripe/webhook/route.ts`
- subscription updates: `features/billing/server/handle-subscription-change.ts`

## Required Variables

Add these to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```

## Create Products And Prices

The seed script creates two plans in Stripe:

- `Base`
- `Plus`

Run:

```bash
pnpm db:seed
```

The pricing section looks up Stripe products by those names, so do not rename them in Stripe unless you also update `features/billing/components/PricingSection.tsx`.

## Local Webhook Setup

The repo includes an interactive setup flow in `shared/lib/db/setup.ts`, but you can also configure Stripe manually.

For local development, forward Stripe webhooks to:

```text
http://localhost:3000/api/stripe/webhook
```

Use the secret printed by Stripe CLI as `STRIPE_WEBHOOK_SECRET`.

## How Checkout Works

When a logged-in user clicks a pricing button:

1. `checkoutAction` reads the selected `priceId`
2. the action loads the current user and current team
3. it creates a Stripe checkout session
4. the browser is redirected to Stripe

If the user is not signed in, the auth flow stores checkout intent and resumes after sign-in.

## How Team Billing State Is Stored

Billing data is stored on `Team`:

- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripeProductId`
- `planId`
- `subscriptionStatus`

## Common Mistakes

- Forgetting to seed Stripe products before opening `/pricing`
- Using the wrong webhook secret
- Renaming Stripe products without updating the pricing component

## Related Docs

- `run-locally.md`
- `deployment.md`
- `../06-support/troubleshooting-billing.md`
