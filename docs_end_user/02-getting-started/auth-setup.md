# Auth Setup

## Purpose

Configure sign-in so you can create an account, reach the dashboard, and test the post-sign-in provisioning flow.

## What The Starter Uses

- NextAuth in `auth.ts`
- route handlers in `app/api/auth/[...nextauth]/route.ts`
- provider setup in `shared/lib/auth/providers.ts`
- route protection in `middleware.ts`
- auth pages in `app/(auth)/sign-in/page.tsx` and `app/(auth)/sign-up/page.tsx`
- post-sign-in team provisioning in `app/post-sign-in/page.tsx`

## Choose At Least One Auth Method

You can enable:

- magic link with Resend
- Google OAuth
- GitHub OAuth

If no method is configured, the sign-in and sign-up pages load but show that no method is available.

## Magic Link Setup

Add these variables:

```env
AUTH_RESEND_KEY=re_...
AUTH_RESEND_FROM=Acme <login@example.com>
```

Once both are present, the auth form enables the email link flow.

## Google Setup

Add:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Use this callback URL in your Google app:

```text
http://localhost:3000/api/auth/callback/google
```

Replace the domain for production.

## GitHub Setup

Add:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

Use this callback URL in your GitHub OAuth app:

```text
http://localhost:3000/api/auth/callback/github
```

Replace the domain for production.

## How Protection Works

The middleware protects all routes that start with `/dashboard`. If a user is not authenticated, they are redirected to `/sign-in`.

## What Happens After Sign-In

After a successful auth flow, the app redirects to `/post-sign-in`. That page:

- fetches the current user
- creates a default team if needed
- accepts a pending invitation if `inviteId` is present
- redirects to checkout if the user came from pricing
- otherwise sends the user to `/dashboard`

## Test Checklist

1. Open `/sign-in`
2. Confirm your enabled provider buttons or magic-link form are visible
3. Sign in
4. Confirm you land on `/dashboard`
5. Open `/dashboard/settings/authentication`
6. Verify linked-account data renders without errors

## Common Mistakes

- Setting provider keys but forgetting the callback URL in Google or GitHub
- Expecting magic link to work with only `RESEND_API_KEY`
- Forgetting to set `AUTH_SECRET`

## Related Docs

- `environment-variables.md`
- `../04-customization/auth/how-to-add-auth-provider.md`
- `../06-support/troubleshooting-auth.md`
