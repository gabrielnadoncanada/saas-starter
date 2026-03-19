# How to Add Auth Provider

## Purpose

Add a new sign-in provider to the starter.

## Audience

This guide is for buyers adding another Better Auth provider beyond the current set: email/password, Resend magic link, Google, and GitHub.

## Files to Edit

- `shared/lib/auth/index.ts`
- `shared/lib/auth/oauth-config.ts`
- `.env`
- provider dashboard callback URL settings

## Steps

### Step 1 - Add the provider configuration

Add the provider to the `socialProviders` object in `shared/lib/auth/index.ts`.

### Step 2 - Add the env-based enable check and labels

Follow the current pattern in `shared/lib/auth/oauth-config.ts` so the provider only appears when its env vars are present.

### Step 3 - Add the new env vars

Put the provider keys into `.env`.

### Step 4 - Configure the callback URL

Set the provider dashboard callback to:

```text
http://localhost:3000/api/auth/callback/<provider-id>
```

## Common Mistakes

- Adding the provider but not gating it behind env presence
- Forgetting to add a label for linked accounts
- Forgetting the callback URL

## Complexity Note

This task is currently good, not perfect. Adding a provider is mostly local to `shared/lib/auth/index.ts` and `shared/lib/auth/oauth-config.ts`, but linked-account support still assumes OAuth providers are explicitly labeled there too.

## Related Documents

- `how-to-remove-auth-provider.md`
- `../../02-getting-started/auth-setup.md`
