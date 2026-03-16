# How to Edit the Schema

## Purpose

Change the Prisma data model safely.

## Files to Edit

- `prisma/models/*.prisma`
- `prisma/schema.prisma`

## Steps

### Step 1 - Edit the model file

The repo splits models by domain under `prisma/models/`. Edit the model closest to your change.

### Step 2 - Create and apply the migration

Run:

```bash
pnpm db:migrate
pnpm db:generate
```

### Step 3 - Update the feature code

Any changed field, relation, or enum usually also needs matching updates in:

- server queries
- validation schema
- UI forms

## Common Mistakes

- Editing only Prisma without updating the feature code that reads the old shape
- Forgetting to regenerate the client

## Related Documents

- `how-to-add-a-new-entity.md`
