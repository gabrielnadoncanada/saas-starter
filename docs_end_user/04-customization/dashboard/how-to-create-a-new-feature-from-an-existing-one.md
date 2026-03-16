# How to Create a New Feature From an Existing One

## Purpose

Use the tasks feature as a practical starting point for a new CRUD-style feature.

## Best Base Feature

The current best duplication base is `features/tasks/` because it already includes:

- server reads and writes
- actions
- schema validation
- table UI
- create and update dialogs

## Files to Copy and Adapt

- `features/tasks/`
- `app/(app)/dashboard/tasks/page.tsx`
- related route entry in `shared/components/navigation/config/sidebar-data.ts`

## Steps

### Step 1 - Duplicate the feature folder

Copy `features/tasks/` to a new feature folder.

### Step 2 - Rename types, constants, and server functions

Replace task-specific names with your new entity names.

### Step 3 - Create the new page route

Duplicate `app/(app)/dashboard/tasks/page.tsx` and point it to the new feature.

### Step 4 - Update the Prisma schema if the entity needs storage

Add the new model under `prisma/models/`, then migrate.

### Step 5 - Add navigation

Add the page to the sidebar config.

## Common Mistakes

- Copying UI files without renaming server functions and schema names
- Forgetting team scoping if the new entity should stay workspace-specific

## Related Documents

- `../data/how-to-add-a-new-entity.md`
- `how-to-add-dashboard-page.md`
