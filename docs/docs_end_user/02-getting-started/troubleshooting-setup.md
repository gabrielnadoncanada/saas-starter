# Troubleshooting Setup

## Purpose

Use this page when the starter fails during first install or first boot.

## Fast Triage Order

1. Check `.env`
2. Check PostgreSQL connectivity
3. Re-run Prisma generate and migrate
4. Confirm auth variables
5. Confirm Stripe secret and webhook secret
6. Re-run the seed only after the above are correct

## Common Symptoms

### App boots but sign-in shows no methods

You probably have no auth provider configured. Read `auth-setup.md`.

### Prisma fails on startup

Your `POSTGRES_URL` is missing, wrong, or points to an unreachable database.

### Pricing page loads but checkout fails

Stripe is not fully configured, or the seed did not create products.

### Magic links are not sent

The auth provider requires `RESEND_API_KEY` and `EMAIL_FROM`.

## Best Follow-Up Docs

- `../06-support/common-errors.md`
- `../06-support/troubleshooting-auth.md`
- `../06-support/troubleshooting-billing.md`
- `../06-support/troubleshooting-database.md`
