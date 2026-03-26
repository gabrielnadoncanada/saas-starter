# Environment Variable Reference

## Core Runtime

```env
POSTGRES_URL=
BASE_URL=
AUTH_SECRET=
```

- `POSTGRES_URL`: PostgreSQL connection string used by Prisma
- `BASE_URL`: public app URL used by Better Auth, auth email, and Stripe redirects
- `AUTH_SECRET`: Better Auth secret for signing sessions and auth tokens

## Stripe

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

- `STRIPE_SECRET_KEY`: used by the Stripe client
- `STRIPE_WEBHOOK_SECRET`: used by `/api/stripe/webhook`

## AI Assistant

```env
AI_PROVIDER=
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=
```

- `AI_PROVIDER`: selects `google` or `groq` for the assistant module
- `GOOGLE_GENERATIVE_AI_API_KEY`: required when `AI_PROVIDER=google`
- `GROQ_API_KEY`: required when `AI_PROVIDER=groq`

## Auth Providers

```env
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ALLOW_EMAIL_ACCOUNT_LINKING=true
```

- `RESEND_API_KEY` and `EMAIL_FROM`: enable auth email and shared app email
- `EMAIL_REPLY_TO`: optional reply-to address for app email
- Google and GitHub pairs: enable those OAuth buttons
- `ALLOW_EMAIL_ACCOUNT_LINKING`: enables trusted provider account linking by email

## Related Docs

- `../02-getting-started/environment-variables.md`
