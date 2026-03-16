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
RESEND_API_KEY=
EMAIL_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- `RESEND_API_KEY` and `EMAIL_FROM`: enable magic-link auth and shared app email
- `EMAIL_REPLY_TO`: optional reply-to address for app email
- Google and GitHub pairs: enable those OAuth buttons

## Related Docs

- `../02-getting-started/environment-variables.md`
