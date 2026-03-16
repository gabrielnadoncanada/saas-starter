# How to Add Team Role Rules

## Purpose

Add authorization rules based on team membership role.

## Current State

The data model supports `OWNER`, `ADMIN`, and `MEMBER`, but most current enforcement is hard-coded around `OWNER`.

## Files to Edit

- `prisma/models/teams.prisma`
- `features/teams/server/team-membership.ts`
- `features/teams/actions/invite-team-member.action.ts`
- `features/teams/actions/remove-team-member.action.ts`
- any page or action you want to protect

## Steps

### Step 1 - Decide the rule

Examples:

- only `OWNER` can remove members
- `OWNER` and `ADMIN` can invite
- only `OWNER` can manage billing

### Step 2 - Update the server action or server function

Put the real enforcement close to the protected action, not only in the UI.

### Step 3 - Update the UI to match

Hide or disable buttons where needed after the server rule is in place.

## Common Mistakes

- Adding role-based UI without server enforcement
- Treating `ADMIN` as supported everywhere when the current code mostly checks `OWNER`

## Flags

- Role support exists in the schema, but the starter does not yet centralize authorization rules

## Simplification Recommendation

Add one tiny shared helper like `canManageTeam(teamRole)` once you have more than two repeated role checks.

## Related Documents

- `how-to-rename-team-to-workspace.md`
