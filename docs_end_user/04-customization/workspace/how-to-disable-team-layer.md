# How to Disable Team Layer

## Purpose

Simplify the starter toward a single-account product with no visible team concept.

## Current State

The team layer is not only UI. It is part of:

- onboarding
- active-team cookies
- task scoping
- billing ownership
- invitations
- account deletion rules

## Files Involved

- `features/auth/server/onboarding.ts`
- `features/auth/server/complete-post-sign-in.ts`
- `features/teams/`
- `features/tasks/server/tasks.ts`
- `features/billing/actions/checkout.action.ts`
- `features/billing/server/finalize-checkout.ts`
- `features/teams/server/current-team.ts`

## Honest Recommendation

Do not try to disable the team layer with a few conditional branches. This is a structural refactor.

## Clean Refactor Path

1. Decide the new owner of billing state and product data
2. Remove team-scoped reads from tasks and billing
3. Remove invitations and team switching
4. Remove team settings UI
5. Remove onboarding team creation
6. Rename remaining concepts only after the data flow is simplified

## Flags

- This is not a 1-2 file customization in the current architecture
- A workaround would leave team assumptions alive under the surface

## Simplification Recommendation

If single-tenant mode matters for buyers, create a real single-workspace variant instead of asking them to patch around the team system manually.

## Related Documents

- `how-to-rename-team-to-workspace.md`
