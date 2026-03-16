# How to Add Auth Provider

## Purpose

Add a new sign-in provider to the starter.

## Audience

This guide is for buyers adding another NextAuth provider beyond the current set: Resend magic link, Google, and GitHub.

## Files to Edit

- `shared/lib/auth/providers.ts`
- `shared/lib/auth/providers.ts` environment checks and labels
- `.env`
- provider dashboard callback URL settings

## Steps

### Step 1 - Add the provider import

Import the provider in `shared/lib/auth/providers.ts`.

### Step 2 - Add the env-based enable check

Follow the current pattern: only push the provider into `getAuthProviders()` when the required env vars exist.

### Step 3 - Add a display label if it is OAuth

Add the provider id to `OAUTH_PROVIDER_LABELS` if you want it to appear in linked-account settings.

### Step 4 - Add the provider configuration

Push the provider into the `providers` array returned by `getAuthProviders()`.

### Step 5 - Add the new env vars

Put the provider keys into `.env`.

### Step 6 - Configure the callback URL

Set the provider dashboard callback to:

```text
http://localhost:3000/api/auth/callback/<provider-id>
```

## Common Mistakes

- Adding the provider but not gating it behind env presence
- Forgetting to add a label for linked accounts
- Forgetting the callback URL

## Complexity Note

This task is currently good, not perfect. Adding a provider is mostly local to `shared/lib/auth/providers.ts`, but linked-account support assumes OAuth providers are explicitly labeled there too.

## Related Documents

- `how-to-remove-auth-provider.md`
- `../../02-getting-started/auth-setup.md`
