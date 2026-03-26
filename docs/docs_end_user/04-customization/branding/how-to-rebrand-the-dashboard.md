# How to Rebrand the Dashboard

## Purpose

Make the authenticated product area feel like your app instead of a starter.

## Files to Edit

- `shared/components/navigation/config/sidebar-data.ts`
- `shared/components/layout/shell/AppSidebar.tsx`
- `app/(app)/dashboard/layout.tsx`
- `app/not-found.tsx`

## Steps

### Step 1 - Remove demo sidebar content

Edit `shared/components/navigation/config/sidebar-data.ts` to replace demo labels, user placeholders, and nav groups.

### Step 2 - Adjust the shell if needed

Edit `app/(app)/dashboard/layout.tsx` if you want a different header composition.

### Step 3 - Change empty or fallback states

Edit `app/not-found.tsx` and any feature-level empty states to match your product tone.

### Step 4 - Keep the sidebar component itself unless structure changes

Only edit `shared/components/layout/shell/AppSidebar.tsx` if you are changing how the sidebar is assembled, not just what it contains.

## Common Mistakes

- Editing the sidebar component before cleaning the sidebar data config
- Leaving template links visible in production

## Related Documents

- `how-to-change-logo-and-name.md`
- `../dashboard/how-to-change-navigation.md`
