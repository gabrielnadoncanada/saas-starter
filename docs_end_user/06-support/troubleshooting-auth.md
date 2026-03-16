# Troubleshooting Auth

## Sign-in page loads but has no buttons or email form

Check `shared/lib/auth/providers.ts`. The page only shows methods that are fully configured in the environment.

## Google or GitHub sign-in fails immediately

Usually the callback URL in the provider dashboard does not match the app URL exactly.

## User signs in but does not reach the dashboard

Check `app/post-sign-in/page.tsx`. That page provisions the user team and handles checkout resume logic before redirecting to `/dashboard`.

## Magic link email never arrives

Check:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- Resend domain setup

## Protected routes are still accessible or redirect incorrectly

Check `middleware.ts`. The current protected prefix is `/dashboard`.
