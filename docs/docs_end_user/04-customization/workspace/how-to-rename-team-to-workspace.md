# How to Rename Team to Workspace

## Purpose

Change the visible product language from "Team" to "Workspace", "Organization", or another name that fits your SaaS.

## Files to Edit

- `shared/constants/terminology.ts` — single source of truth for all UI labels

## Steps

### Step 1 — Edit terminology.ts

Open `shared/constants/terminology.ts` and change the four values:

```ts
export const terminology = {
  singular: "workspace",
  plural: "workspaces",
  Singular: "Workspace",
  Plural: "Workspaces",
} as const;
```

### Step 2 — Done

All UI labels that reference the team concept import from `terminology.ts`. A single edit propagates to:

- TeamSwitcher dropdown label and header
- Team Members panel title and empty state
- Invite Team Member panel title and permission message
- Team settings page title and description
- Sidebar navigation link
- Activity log labels ("created a new workspace", "removed a workspace member")
- Dashboard overview card and upgrade prompt

### Step 3 — Optional: rename internal folders

For most buyers, changing visible labels is enough. If you also want to rename internal folders (e.g. `features/teams/` to `features/workspaces/`), that is a deeper refactor that requires updating all import paths. This is cosmetic and does not affect the product.

## Common Mistakes

- Forgetting to update all four values (singular, plural, Singular, Plural)
- Trying to rename internal code before changing visible labels — always start with `terminology.ts`

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 5/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 25/25
- Verdict: excellent

## Related Documents

- `how-to-disable-team-layer.md`
- `how-to-add-team-role-rules.md`
