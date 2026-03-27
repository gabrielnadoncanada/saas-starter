# How to Disable Team Layer

## Purpose

Simplify the starter toward a single-account product with no visible team concept.

## Current State

The team layer is structural. It is wired into:

| Concern | Where |
|---------|-------|
| Onboarding | `features/auth/server/onboarding.ts` — creates a team for every new user |
| Post-sign-in | `features/auth/server/complete-post-sign-in.ts` — accepts invitations, falls back to team creation |
| Active team cookie | `features/teams/server/active-team.ts` — reads/writes `active_team_id` cookie |
| Team resolution | `features/teams/server/current-team.ts` — resolves the current team from the cookie and membership |
| Task scoping | `features/tasks/server/tasks.ts` — all task CRUD is scoped to `teamId` |
| Checkout | `features/billing/actions/checkout.action.ts` — passes `team.stripeCustomerId` to Stripe |
| Checkout finalization | `features/billing/server/finalize-checkout.ts` — writes billing fields to the `Team` model |
| Subscription sync | `features/billing/server/handle-subscription-change.ts` — webhook updates team billing fields |
| Account deletion | `features/account/server/delete-account.ts` — checks team subscription status before allowing deletion |
| Deletion policy | `features/teams/shared/server/account-deletion-policy.ts` — blocks deletion if last member with active subscription |
| Invitations | `features/teams/server/team-invitations.ts`, `cancel-invitation.ts`, `resend-invitation.ts` |
| RBAC guard | `features/teams/server/require-team-role.ts` — checks membership role |
| Sidebar | `shared/components/navigation/config/settings-group.ts` — team settings link |
| Team UI | `features/teams/components/` — TeamSwitcher, TeamSettingsPage, TeamMembersPanel, InviteTeamMemberPanel, PendingInvitationsPanel |
| Activity log | `features/account/ui/activity-display.ts` — "created a team", "removed a team member" labels |
| Terminology | `shared/constants/terminology.ts` — all UI labels reference this config |

## Honest Recommendation

Do not try to disable the team layer with conditional branches. The `Team` model is the billing owner, the task scope boundary, and the RBAC anchor. A few `if` statements will leave broken assumptions in checkout, task queries, and account deletion.

This is a structural refactor, not a configuration toggle.

## Clean Refactor Path

### Phase 1 — Move billing to the User model

1. Add Stripe fields (`stripeCustomerId`, `stripeSubscriptionId`, `stripeProductId`, `planId`, `subscriptionStatus`) to the `User` model in `prisma/models/users.prisma`
2. Update `features/billing/server/finalize-checkout.ts` to write billing fields to `User` instead of `Team`
3. Update `features/billing/server/handle-subscription-change.ts` to find and update the `User` by `stripeCustomerId`
4. Update `features/billing/actions/checkout.action.ts` to read `user.stripeCustomerId` instead of `team.stripeCustomerId`
5. Update `features/billing/guards/get-team-plan.ts` to resolve the plan from the user record

### Phase 2 — Scope tasks to User instead of Team

1. Add `userId` to the `Task` model in `prisma/models/tasks.prisma`
2. Update `features/tasks/server/tasks.ts` — change `requireCurrentTeamId()` to use `getCurrentUser()` directly, scope all queries by `userId` instead of `teamId`
3. Update the `UsageRecord` model to use `userId` instead of `teamId`

### Phase 3 — Remove team UI and flows

1. Delete `features/teams/components/` (TeamSwitcher, TeamSettingsPage, TeamMembersPanel, InviteTeamMemberPanel, PendingInvitationsPanel)
2. Delete `app/(app)/dashboard/settings/team/page.tsx`
3. Remove the team settings entry from `shared/components/navigation/config/settings-group.ts`
4. Remove the TeamSwitcher from the sidebar layout
5. Delete invitation-related files: `features/teams/server/team-invitations.ts`, `cancel-invitation.ts`, `resend-invitation.ts`
6. Delete `features/teams/actions/` (invite, remove, switch, list actions)

### Phase 4 — Simplify onboarding and account deletion

1. Update `features/auth/server/onboarding.ts` to skip team creation (or keep it as a silent 1:1 personal workspace if you want to minimize changes)
2. Update `features/account/server/delete-account.ts` to check `user.subscriptionStatus` instead of team membership
3. Delete `features/teams/shared/server/account-deletion-policy.ts` or adapt it

### Phase 5 — Clean up

1. Remove the `active_team_id` cookie logic from `features/teams/server/active-team.ts`
2. Run `pnpm prisma migrate dev` to generate the migration
3. Remove unused team-related activity types from `features/account/ui/activity-display.ts`
4. Run `pnpm build` to catch any remaining references

## Files Involved (full list)

| Action | File |
|--------|------|
| EDIT | `prisma/models/users.prisma` — add billing fields |
| EDIT | `prisma/models/tasks.prisma` — add `userId`, make `teamId` optional or remove |
| EDIT | `features/billing/server/finalize-checkout.ts` |
| EDIT | `features/billing/server/handle-subscription-change.ts` |
| EDIT | `features/billing/actions/checkout.action.ts` |
| EDIT | `features/billing/guards/get-team-plan.ts` |
| EDIT | `features/tasks/server/tasks.ts` |
| EDIT | `features/auth/server/onboarding.ts` |
| EDIT | `features/account/server/delete-account.ts` |
| EDIT | `features/account/ui/activity-display.ts` |
| EDIT | `shared/components/navigation/config/settings-group.ts` |
| DELETE | `features/teams/components/` (all files) |
| DELETE | `features/teams/actions/` (all files) |
| DELETE | `features/teams/server/team-invitations.ts` |
| DELETE | `features/teams/server/cancel-invitation.ts` |
| DELETE | `features/teams/server/resend-invitation.ts` |
| DELETE | `features/teams/server/active-team.ts` |
| DELETE | `features/teams/shared/server/account-deletion-policy.ts` |
| DELETE | `app/(app)/dashboard/settings/team/page.tsx` |

## Complexity Scorecard

- Time to find where to edit: 3/5
- Number of files to modify: 2/5
- Architecture explanation required: 2/5
- Locality of change: 2/5
- Buyer confidence after reading: 4/5
- Total: 13/25
- Verdict: hard but well-documented

## Related Documents

- `how-to-rename-team-to-workspace.md`
- `how-to-add-team-role-rules.md`
