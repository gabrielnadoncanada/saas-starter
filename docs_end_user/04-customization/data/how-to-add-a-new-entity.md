# How to Add a New Entity

## Purpose

Add a new database-backed feature, similar to tasks.

## Files to Edit

- `prisma/models/<entity>.prisma`
- `features/<entity>/`
- `app/(app)/dashboard/<entity>/page.tsx`
- `shared/components/navigation/config/sidebar-data.ts`

## Steps

### Step 1 - Add the Prisma model

Create a new model file under `prisma/models/` and connect it to the right parent, usually `Team` if the data is workspace-scoped.

### Step 2 - Migrate the database

Run:

```bash
pnpm db:migrate
pnpm db:generate
```

### Step 3 - Create the feature folder

Follow the tasks feature pattern:

- `actions/`
- `components/`
- `schemas/`
- `server/`
- `types/`

### Step 4 - Create the dashboard route

Add a route under `app/(app)/dashboard/`.

### Step 5 - Add navigation

Update the sidebar config.

## Common Mistakes

- Adding the model but not scoping it to team when it should be workspace data
- Putting all logic in the route file instead of the feature folder

## Related Documents

- `how-to-edit-the-schema.md`
- `../dashboard/how-to-create-a-new-feature-from-an-existing-one.md`
