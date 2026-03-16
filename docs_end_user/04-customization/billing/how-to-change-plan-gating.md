# How to Change Plan Gating

## Purpose

Control which features should be visible or usable based on team billing state.

## Current State

The starter stores billing state on `Team`, but there is no dedicated shared gating helper yet. Most gating work will be your own product logic.

## Files to Edit

- `features/teams/server/current-team.ts`
- `features/teams/components/TeamSettingsPage.tsx`
- the page, action, or component you want to gate

## Steps

### Step 1 - Read the current team

Use `getCurrentTeam()` or team membership helpers to access:

- `planName`
- `subscriptionStatus`
- `stripeProductId`

### Step 2 - Decide where the gate belongs

Gate as close as possible to the feature:

- page-level for full-page access
- component-level for UI visibility
- server action level for enforced business rules

### Step 3 - Write the rule directly

For example:

- only allow if `subscriptionStatus === 'active'`
- only allow if `planName === 'Plus'`

### Step 4 - Add fallback UI

Show an upgrade CTA or redirect to pricing.

## Common Mistakes

- Gating in the UI only
- Spreading the same plan rule across many files instead of extracting one small helper when repetition appears

## Related Documents

- `how-to-add-a-free-plan.md`
- `../../02-getting-started/billing-setup.md`
