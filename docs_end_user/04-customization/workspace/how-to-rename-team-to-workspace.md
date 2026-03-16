# How to Rename Team to Workspace

## Purpose

Change the visible product language from `team` to `workspace`, `organization`, or another name that fits your SaaS.

## Files to Edit

- `features/teams/components/TeamSwitcher.tsx`
- `features/teams/components/TeamSettingsPage.tsx`
- `app/(app)/dashboard/settings/team/page.tsx`
- `shared/components/navigation/config/sidebar-data.ts`
- `shared/components/navigation/config/settings-group.ts`
- user-facing copy in auth, account, and email templates if needed

## Steps

### Step 1 - Rename visible labels first

Change the UI text in the team switcher, team settings page, and navigation.

### Step 2 - Rename settings-page copy

Update `app/(app)/dashboard/settings/team/page.tsx` and `features/teams/components/TeamSettingsPage.tsx`.

### Step 3 - Rename related user-facing strings

Check:

- onboarding text
- delete-account warnings
- invitation emails
- pricing copy if billing is team-owned

### Step 4 - Leave internal code names alone unless you want a deeper refactor

For many buyers, changing visible language is enough. Renaming internal folders and model names is optional and much more invasive.

## Common Mistakes

- Renaming only the sidebar and leaving `team` all over the settings UI
- Starting with internal renames instead of visible labels

## Complexity Scorecard

- Time to find where to edit: 3/5
- Number of files to modify: 3/5
- Architecture explanation required: 4/5
- Locality of change: 3/5
- Buyer confidence after reading: 4/5
- Total: 17/25
- Verdict: borderline

## Flags

- The concept is visible across UI, onboarding, billing, and email

## Simplification Recommendation

If workspace naming is a core product promise, add one shared terminology source for visible labels instead of repeating strings manually.

## Related Documents

- `how-to-disable-team-layer.md`
