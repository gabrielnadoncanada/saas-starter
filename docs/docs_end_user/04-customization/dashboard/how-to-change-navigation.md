# How to Change Navigation

## Purpose

Edit the dashboard sidebar structure and settings navigation.

## Files to Edit

- `shared/components/navigation/config/sidebar-data.ts`
- `shared/components/navigation/config/settings-group.ts`

## Steps

### Step 1 - Change main sidebar groups

Edit `shared/components/navigation/config/sidebar-data.ts` for top-level groups, labels, icons, and URLs.

### Step 2 - Change settings links

Edit `shared/components/navigation/config/settings-group.ts` for account, authentication, activity, and team settings links.

### Step 3 - Remove dead template links

The current sidebar still contains several template-style links that do not correspond to real routes. Remove or replace them early so buyers do not click into dead ends.

## Common Mistakes

- Editing only one nav config file
- Leaving links to non-existent pages like template demo routes

## Related Documents

- `how-to-add-dashboard-page.md`
- `how-to-remove-dashboard-module.md`
