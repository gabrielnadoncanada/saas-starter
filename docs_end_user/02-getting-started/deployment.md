# Deployment

## Purpose

Ship the starter to a real domain with the right production environment variables and external service callbacks.

## Recommended Deployment Shape

This repo is a standard Next.js app. The easiest production path is:

- deploy the app to Vercel or another Node-compatible host
- use a managed PostgreSQL database
- use Stripe in test mode first, then switch to live mode
- set all auth callback URLs to the production domain

## Production Checklist

1. Set `BASE_URL` to your public domain
2. Set `POSTGRES_URL` to the production database
3. Set `AUTH_SECRET`
4. Set your chosen auth provider keys
5. Set Stripe keys and webhook secret
6. Set Resend email variables if you use magic links or app email
7. Run migrations against production
8. Seed only if you want demo Stripe products in that environment

## Required Callback And Webhook URLs

- Google callback: `https://your-domain.com/api/auth/callback/google`
- GitHub callback: `https://your-domain.com/api/auth/callback/github`
- Stripe webhook: `https://your-domain.com/api/stripe/webhook`

## Database Migrations

Do not rely on local schema state. Make sure your deployment process runs Prisma migrations for the production database.

## Image Hosts

`next.config.ts` currently allows remote images from:

- `lh3.googleusercontent.com`
- `avatars.githubusercontent.com`

If you later use a different avatar or file host, update that allowlist before shipping.

## Before Switching To Live

Verify all of these in production:

- sign-up works
- sign-in works
- dashboard redirects work
- checkout starts from `/pricing`
- Stripe webhooks update the team record

## Related Docs

- `environment-variables.md`
- `auth-setup.md`
- `billing-setup.md`
- `../06-support/troubleshooting-deployment.md`
