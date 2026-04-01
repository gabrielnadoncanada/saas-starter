# SaaS Starter — Audit Refresh

**Last updated:** 2026-04-01
**Status:** Audit completion pass implemented

## Current Verdict

This starter is now in a materially cleaner state than the original audit snapshot.

- The visible ship blockers called out in the audit have been fixed.
- The structural cleanup items that were low-risk and clearly beneficial have been implemented.
- Automated validation is now stable: `pnpm test` and `pnpm build` both pass.

The starter remains strong for solo founders and small technical teams: feature-first, understandable, and commercially credible.

## Completed From The Audit

### Product polish and buyer trust

- Removed the leftover `competitor/` repo artifact from the shipped project.
- Replaced the hardcoded dashboard price with a plan-derived value from billing config.
- Removed the `(user as any).role` casts from the authenticated layouts.
- Added a typed `CurrentUser` source of truth and a shared `toSidebarUser()` mapper.
- Switched default auth and invitation emails to English.
- Added a short README note explaining where email copy is customized.

### Auth simplification

- Deleted the pass-through wrapper `features/auth/server/complete-post-sign-in.ts`.
- Consolidated auth schemas into:
  - `features/auth/schemas/auth-password.schema.ts`
  - `features/auth/schemas/auth-forms.schema.ts`
  - `features/auth/schemas/password-change.schema.ts`
- Removed the old split schema files:
  - `email-step.schema.ts`
  - `password-step.schema.ts`
  - `password-form.schema.ts`
  - `save-password.schema.ts`
  - `sign-in.schema.ts`
  - `sign-up.schema.ts`

### Organizations simplification

- Replaced the split organization ID helpers with:
  - `features/organizations/server/get-active-organization-id.ts`
- Removed:
  - `active-organization.ts`
  - `require-current-organization-id.ts`
- Merged invitation resend logic into:
  - `features/organizations/server/organization-invitations.ts`
- Removed:
  - `resend-organization-invitation.ts`

### Tasks cleanup

- Inlined task action state types into `features/tasks/server/task-actions.ts`.
- Removed `features/tasks/server/task-action-state.ts`.

### Test and validation fixes

- Added `test/setup.ts` so Vitest has a stable environment.
- Fixed the previous test-suite instability caused by missing env and `server-only` imports.
- Added `test/billing/stripe-webhooks.test.ts` covering:
  - checkout completion customer sync
  - subscription sync from price mapping
  - subscription sync fallback through `metadata.planId`
  - customer deletion cleanup
  - safe no-op informational events

## Verified State

- `pnpm test`: passes
- `pnpm build`: passes

## Remaining Non-Blocking Gaps

These are still valid future improvements, but they are no longer blockers for selling or shipping this starter:

- No error tracking integration such as Sentry
- No analytics product integration
- No file upload infrastructure
- No API key management flow behind the existing billing capability
- No background job system
- No 2FA setup
- No onboarding wizard
- No soft quota warning UX

## Final Assessment

The original audit correctly identified polish and clarity issues more than deep architectural faults. After this completion pass, the starter is cleaner, more credible on first open, and easier to modify in the auth and organization areas without adding compatibility layers or extra abstraction.

The repo now better matches the intended buyer:

- fast to understand
- fast to modify
- strong visible value
- low internal ceremony
