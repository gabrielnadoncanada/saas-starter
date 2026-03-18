# Environment Variables

## Purpose

This guide explains which variables matter first and which parts of the starter use them.

## Where Variables Are Read

- `.env.example`
- `shared/lib/db/prisma.ts`
- `auth.ts`
- `shared/lib/auth/providers.ts`
- `shared/lib/email/config.ts`
- `shared/lib/stripe/client.ts`
- `app/api/stripe/webhook/route.ts`
- `features/assistant/server/get-assistant-model.ts`

## Required For A Basic Local Setup

Add these values to `.env`:

```env
POSTGRES_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
AUTH_SECRET=your-random-secret
```

Without these, the database, auth session signing, and Stripe flow will not work correctly.

## AI Assistant Variables

The assistant module is optional, but if you want the AI-ready billing pattern to work locally you should also set:

```env
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=
```

- `AI_PROVIDER` accepts `google` or `groq`
- Default is `google`
- Only the selected provider key is required at runtime
- There is no silent fallback if the selected key is missing

## Auth Variables

### Magic link with Resend

The auth provider code currently checks:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Acme <login@example.com>
```

### Social login

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

If a provider pair is missing, that provider simply does not appear on the sign-in page.

## App Email Variables

The same `RESEND_API_KEY` and `EMAIL_FROM` variables are shared by both magic-link auth and app email sending. You can also set an optional reply-to address:

```env
EMAIL_REPLY_TO=
```

## Base URL

`BASE_URL` should match the public URL of the app:

- local: `http://localhost:3000`
- production: your real domain

It is used by email-related flows and should be updated before deployment.

## Validation Checklist

After editing `.env`, verify:

1. `pnpm dev` starts without Prisma connection errors
2. `/sign-in` loads
3. at least one auth method is visible
4. `/pricing` loads
5. Stripe checkout can start
6. `/dashboard/assistant` works when your chosen AI provider key is set

## Related Docs

- `auth-setup.md`
- `billing-setup.md`
- `../05-reference/env-reference.md`
