# How to Protect a Route

## Purpose

Require authentication for a route or route prefix.

## Files to Edit

- `middleware.ts`
- `shared/constants/routes.ts`

## Steps

### Step 1 - Decide whether the route should be protected by prefix

The current middleware protects everything starting with `/dashboard`.

### Step 2 - Update the protection rule

Edit `middleware.ts` and extend the `isProtectedRoute` check.

### Step 3 - Redirect unauthenticated users to the right page

The current redirect target is `/sign-in`. Change it there if needed.

## Example

If you add `/app`, a simple prefix-based check is usually enough:

- protect `/dashboard`
- protect `/app`

## Common Mistakes

- Protecting a route in the UI only, without middleware
- Forgetting that middleware runs by path prefix

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 5/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 25/25
- Verdict: excellent

## Related Documents

- `how-to-change-auth-redirects.md`
