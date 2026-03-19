# Auth Architecture

## Purpose

Explain the auth flow in the smallest set of files a buyer needs to understand.

## Main Files

- `shared/lib/auth/index.ts` - Better Auth server config
- `shared/lib/auth/auth-client.ts` - client instance used by auth and account UI
- `shared/lib/auth/get-current-user.ts` - server helper for the current signed-in user
- `shared/lib/auth/oauth-config.ts` - env-based auth method visibility and labels
- `app/api/auth/[...all]/route.ts` - Better Auth route handler
- `proxy.ts` - optimistic dashboard protection

## How It Works

1. Better Auth owns identity, sessions, email verification, password reset, magic link, and OAuth callbacks.
2. The app uses Prisma-backed sessions and reads the current signed-in user through `getCurrentUser()`.
3. `proxy.ts` only checks for a session cookie to redirect unauthenticated users away from `/dashboard`.
4. Real protection still happens in server components, route handlers, and server actions that call `getCurrentUser()`.
5. After sign-in, `/post-sign-in` handles team provisioning, invitation acceptance, and optional checkout resume.

## Buyer Notes

- To add or remove an auth method, edit `shared/lib/auth/index.ts` and `shared/lib/auth/oauth-config.ts`.
- To change post-auth behavior, edit `app/post-sign-in/page.tsx`.
- To change which routes are protected, edit `proxy.ts`.
