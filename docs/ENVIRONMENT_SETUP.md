# Environment Setup

Copy `.env.example` to `.env` and fill in the variables you actually use.

## Required for Local App Boot

- `POSTGRES_URL`
- `AUTH_SECRET`
- `BASE_URL`

## Required for Billing

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_TEAM_MONTHLY`
- `STRIPE_PRICE_TEAM_YEARLY`

## Required for Email

- `RESEND_API_KEY`
- `EMAIL_FROM`

## Optional Providers

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## Optional Billing Flags

- `STRIPE_ENABLE_TRIAL_WITHOUT_CC`
- `ENABLE_AUTOMATIC_TAX_CALCULATION`
- `ENABLE_TAX_ID_COLLECTION`
- `STRIPE_REQUIRE_BILLING_ADDRESS`

## Local Setup Order

1. `pnpm install`
2. copy `.env.example` to `.env`
3. `docker compose up -d`
4. `pnpm db:migrate`
5. `pnpm db:seed`
6. `pnpm dev`

If your local database or generated Prisma state drifts, reset it instead of patching around it:

```bash
pnpm db:reset
pnpm db:seed
```
