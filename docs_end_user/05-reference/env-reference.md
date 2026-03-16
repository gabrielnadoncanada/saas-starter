# Environment Variable Reference

## Core Runtime

```env
POSTGRES_URL=
BASE_URL=
AUTH_SECRET=
```

- `POSTGRES_URL`: PostgreSQL connection string used by Prisma
- `BASE_URL`: public app URL used by email and auth-related links
- `AUTH_SECRET`: session and auth secret

## Stripe

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

- `STRIPE_SECRET_KEY`: used by the Stripe client
- `STRIPE_WEBHOOK_SECRET`: used by `/api/stripe/webhook`

## Auth Providers

```env
AUTH_RESEND_KEY=
AUTH_RESEND_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- `AUTH_RESEND_KEY` and `AUTH_RESEND_FROM`: enable magic-link auth
- Google and GitHub pairs: enable those OAuth buttons

## Shared App Email

```env
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=
```

- `RESEND_API_KEY`: shared email sending key
- `EMAIL_FROM`: default sender
- `EMAIL_REPLY_TO`: optional reply-to address

## Important Note

This repo currently keeps auth email env vars and shared app email env vars separate.

## Related Docs

- `../02-getting-started/environment-variables.md`
