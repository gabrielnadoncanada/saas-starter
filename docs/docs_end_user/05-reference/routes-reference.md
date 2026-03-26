# Routes Reference

## Marketing

- `/`
- `/pricing`

## Auth

- `/sign-in`
- `/sign-up`
- `/check-email`
- `/post-sign-in`

## Dashboard

- `/dashboard`
- `/dashboard/tasks`
- `/dashboard/settings`
- `/dashboard/settings/account`
- `/dashboard/settings/authentication`
- `/dashboard/settings/activity`
- `/dashboard/settings/team`

## API

- `/api/auth/[...all]`
- `/api/stripe/checkout`
- `/api/stripe/webhook`

## Protected Area

`proxy.ts` currently protects every route starting with `/dashboard`.

## Source Of Truth

Most app routes are also declared in `shared/constants/routes.ts`.
