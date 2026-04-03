# Stripe Test Mode Setup

Use this guide to wire local billing with real Stripe test data.

## 1. Create or open your Stripe test workspace

- Open the Stripe test dashboard.
- Copy your test secret key into `STRIPE_SECRET_KEY`.
- Use a local `BASE_URL` such as `http://localhost:3000`.

## 2. Create the recurring prices

Create these four test prices in Stripe:

- `Pro` monthly
- `Pro` yearly
- `Team` monthly
- `Team` yearly

Copy their IDs into:

- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_TEAM_MONTHLY`
- `STRIPE_PRICE_TEAM_YEARLY`

The app decides what each plan unlocks in [`shared/config/billing.config.ts`](C:/laragon/www/saas-starter/shared/config/billing.config.ts). Stripe only provides the checkout price targets.

## 3. Forward webhooks locally

Install and log into Stripe CLI, then run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## 4. Seed and run the app

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm db:seed` creates demo users, demo workspace data, admin data, and Stripe products/prices for the seeded plans.

## 5. Verify the billing flow

- Sign in with `demo@starter.local` / `demo123`
- Open `/settings/billing`
- Start a checkout from the pricing selector
- Use Stripe test cards to complete the flow
- Confirm webhook events reach `/api/stripe/webhook`

If billing UI looks populated but checkout is unavailable, check that all four `STRIPE_PRICE_*` variables are set and that the webhook secret matches the active `stripe listen` session.
