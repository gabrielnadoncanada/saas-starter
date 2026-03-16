# Common Errors

## No sign-in method is configured

Cause:

- none of the auth provider env vars are present

Fix:

- configure Resend magic link, Google, or GitHub

## Prisma cannot connect to the database

Cause:

- `POSTGRES_URL` is wrong or the database is offline

Fix:

- verify the connection string
- make sure your Postgres instance is running

## Checkout starts but Stripe webhook updates never appear

Cause:

- `STRIPE_WEBHOOK_SECRET` is wrong
- webhook forwarding is not running locally

Fix:

- re-create the webhook secret and point it to `/api/stripe/webhook`

## Magic links are not sent

Cause:

- auth uses `AUTH_RESEND_KEY` and `AUTH_RESEND_FROM`, not only `RESEND_API_KEY`

Fix:

- add the auth-specific Resend variables

## Pricing page shows fallback values only

Cause:

- Stripe products were not created or names do not match `Base` and `Plus`

Fix:

- run `pnpm db:seed` with a valid Stripe secret key
