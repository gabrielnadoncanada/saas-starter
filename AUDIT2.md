# Audit Cleanup Pass

**Last updated:** 2026-04-01  
**Status:** Implemented against the real repo state

## What Changed

### Tasks

- Replaced the duplicated create/update sheet bodies with a shared `TaskForm`.
- Renamed the UI-facing server actions module to `features/tasks/server/task-server-actions.ts`.
- Kept database mutations in `task-mutations.ts` as the server-only persistence layer.
- Split the old `task-schemas.ts` into:
  - `features/tasks/task-form.schema.ts`
  - `features/tasks/task-table-search-params.ts`
- Split the old monolithic tasks table into:
  - `tasks-table.tsx`
  - `tasks-table-toolbar.tsx`
  - `tasks-table-bulk-actions.tsx`
  - `tasks-table-columns.tsx`
- Removed the DOM ref mutation pattern for bulk status updates.
- Added an explicit comment in `task-mutations.ts` that org scoping must come from the active organization membership helper.

### Organizations

- Consolidated active organization membership access into `features/organizations/server/organization-membership.ts`.
- The active organization server API is now:
  - `getActiveOrganizationMembership()`
  - `requireActiveOrganizationMembership()`
  - `requireActiveOrganizationRole(allowedRoles)`
  - `OrganizationMembershipError`
- Removed:
  - `get-active-organization-id.ts`
  - `get-required-organization-membership.ts`
- Updated tasks, billing actions, and owner-only actions to use the consolidated membership helpers.
- Kept `ensure-active-organization.ts` separate because it mutates session state.

### Auth

- Removed the shared `use-auth-email-step` hook.
- Moved the email-step state and validation flow directly into:
  - `features/auth/components/sign-in/sign-in-form.tsx`
  - `features/auth/components/sign-up/sign-up-form.tsx`
- Removed `auth-email-summary.tsx` and inlined that UI into the password step components.
- Merged `auth-password.schema.ts` into `auth-forms.schema.ts`.
- Moved client auth requests from:
  - `features/auth/data/auth-requests.ts`
  - to `features/auth/client/auth-requests.ts`
- Removed the dead `features/auth/utils/oauth-error-messages.ts`.
- Kept `AuthEmailStep`, `AuthSecondaryActions`, and `OAuthProviderIcon` because they still have clear ownership and multiple real consumers.

### Billing

- Merged billing custom errors into `features/billing/errors/billing-errors.ts`.
- Updated app, feature, and test imports to use the unified billing error module.
- Kept `features/billing/plans/index.ts` as the public billing entry point.

### Docs

- Updated `README.MD` to reflect the real billing config path and the repo’s organization-first terminology.
- Replaced this file so it now matches the implemented cleanup pass instead of listing pre-cleanup audit findings as if they were still current.

## Validation Added

- Added `test/tasks/task-table-search-params.test.ts` covering:
  - defaults
  - invalid page/pageSize fallback
  - CSV parsing for status and priority
  - default omission in `buildTasksTableHref()`
- Added `test/organizations/organization-membership.test.ts` covering:
  - unauthenticated user
  - missing active organization
  - insufficient role
  - correct organization/roles resolution

## Notes

- This pass intentionally did **not** implement broader product backlog items such as analytics, monitoring, uploads, onboarding wizard, API key management, or quota warning UX.
- The cleanup optimized for one clear internal architecture with no compatibility layer left behind.
