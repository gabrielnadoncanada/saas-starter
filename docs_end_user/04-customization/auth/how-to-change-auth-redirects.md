# How to Change Auth Redirects

## Purpose

Change where users go before sign-in, after sign-in, or after a deferred checkout flow.

## Files to Edit

- `features/auth/utils/auth-flow.ts`
- `app/post-sign-in/page.tsx`
- `features/billing/actions/checkout.action.ts`
- `proxy.ts`

## Steps

### Step 1 - Change allowed redirect intents

`features/auth/utils/auth-flow.ts` currently only supports one redirect intent: `checkout`.

If you want more auth redirect cases, extend the `AuthRedirect` type and `AUTH_REDIRECTS`.

### Step 2 - Change what happens after sign-in

Edit `app/post-sign-in/page.tsx`. That page currently:

- provisions a team
- resumes checkout if needed
- otherwise redirects to `/dashboard`

### Step 3 - Change where protected users are sent

If you want unauthenticated users to land on a different auth page, edit `proxy.ts`.

### Step 4 - Change checkout-specific auth behavior

If you want a different post-auth checkout flow, edit `features/billing/actions/checkout.action.ts`.

## Common Mistakes

- Changing only the redirect target but not the redirect intent parser
- Breaking checkout resume by editing `post-sign-in` incompletely

## Related Documents

- `how-to-protect-a-route.md`
- `../../02-getting-started/auth-setup.md`
