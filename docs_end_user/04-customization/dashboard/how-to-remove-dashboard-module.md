# How to Remove Dashboard Module

## Purpose

Remove an unwanted dashboard page or feature cleanly.

## Files to Edit

- route file in `app/(app)/dashboard/`
- nav entry in `shared/components/navigation/config/sidebar-data.ts`
- feature folder in `features/` if the page had one

## Steps

### Step 1 - Remove the page route

Delete the route folder under `app/(app)/dashboard/`.

### Step 2 - Remove the sidebar link

Delete the matching navigation item from `shared/components/navigation/config/sidebar-data.ts`.

### Step 3 - Remove the feature code

Delete the feature folder if nothing else uses it.

### Step 4 - Remove route constants if present

Clean up `shared/constants/routes.ts` if the route was shared.

## Common Mistakes

- Deleting the page but leaving the nav link
- Keeping dead feature code around after removing the module

## Related Documents

- `how-to-change-navigation.md`
