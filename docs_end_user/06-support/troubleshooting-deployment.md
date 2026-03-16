# Troubleshooting Deployment

## Auth works locally but fails in production

Usually the provider callback URLs still point to localhost, or `BASE_URL` is still local.

## App builds but crashes on first request

Check production environment variables first, especially:

- `POSTGRES_URL`
- `AUTH_SECRET`
- `STRIPE_SECRET_KEY`

## Avatars or remote images fail in production

Check `next.config.ts`. Only Google and GitHub avatar hosts are currently allowed.

## Stripe events are not updating subscriptions in production

Check that Stripe is sending events to:

```text
https://your-domain.com/api/stripe/webhook
```

Then verify the live webhook secret in production.
