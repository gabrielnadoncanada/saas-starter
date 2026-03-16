# How to Add Team Role Rules

## Purpose

Add authorization rules based on team membership role.

## Current State

The data model supports `OWNER`, `ADMIN`, and `MEMBER`. The starter ships with a centralized RBAC guard at `features/teams/server/require-team-role.ts` that is already used in all team-management actions.

## Files to Edit

- `features/teams/server/require-team-role.ts` — the reusable guard
- The server action or server function you want to protect

## How It Works

`requireTeamRole(userId, allowedRoles)` checks the user's team membership and returns either the team context or an error:

```ts
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";

const result = await requireTeamRole(user.id, ["OWNER", "ADMIN"]);
if (isTeamRoleError(result)) {
  return { error: result.error };
}

// result.teamId, result.teamRole, result.user are available
```

## Steps

### Step 1 — Decide the rule

Examples:

- only `OWNER` can remove members
- `OWNER` and `ADMIN` can invite
- only `OWNER` can manage billing

### Step 2 — Guard the server action

Call `requireTeamRole` with the allowed roles at the top of your server action:

```ts
const result = await requireTeamRole(user.id, ["OWNER"]);
if (isTeamRoleError(result)) {
  return { error: result.error };
}
```

### Step 3 — Update the UI to match

Hide or disable buttons where the user's role doesn't allow the action. The server guard is the source of truth — UI changes are cosmetic.

## Existing Usage

These actions already use `requireTeamRole`:

- `features/teams/actions/invite-team-member.action.ts` — `["OWNER"]`
- `features/teams/actions/remove-team-member.action.ts` — `["OWNER"]`
- `features/teams/server/cancel-invitation.ts` — `["OWNER"]`
- `features/teams/server/resend-invitation.ts` — `["OWNER"]`

To allow `ADMIN` to also invite, change `["OWNER"]` to `["OWNER", "ADMIN"]` in the invite action.

## Common Mistakes

- Adding role-based UI without server enforcement
- Forgetting to import `isTeamRoleError` for the type guard check

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 5/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 25/25
- Verdict: excellent

## Related Documents

- `how-to-rename-team-to-workspace.md`
