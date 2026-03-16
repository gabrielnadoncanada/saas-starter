# How to Remove Auth Provider

## Purpose

Remove a sign-in method you do not want to support.

## Files to Edit

- `shared/lib/auth/providers.ts`
- `.env`

## Steps

### Step 1 - Remove the provider from the enabled list

Delete the provider import and the provider registration from `shared/lib/auth/providers.ts`.

### Step 2 - Remove its linked-account label if needed

If it is an OAuth provider, also remove it from `OAUTH_PROVIDER_LABELS`.

### Step 3 - Remove its env vars

Delete the unused provider keys from `.env` and from your deployment platform.

### Step 4 - Test the auth settings page

Open `/dashboard/settings/authentication` and confirm the removed provider no longer appears.

## Common Mistakes

- Removing the provider from sign-in but leaving it in linked-account UI assumptions
- Leaving stale secrets in production env

## Related Documents

- `how-to-add-auth-provider.md`
