# How to Add Seed Data

## Purpose

Extend the local seed so the app starts with useful demo content.

## Files to Edit

- `shared/lib/db/seed.ts`

## Steps

### Step 1 - Find the base seed flow

The current seed creates:

- a user
- a team
- a membership
- Stripe products and prices

### Step 2 - Add your new records after the team exists

If your data is team-scoped, create it after the team has been created or found.

### Step 3 - Keep the seed idempotent

Prefer `findFirst`, `findUnique`, or `upsert` before creating duplicate data.

### Step 4 - Re-run the seed

Use:

```bash
pnpm db:seed
```

## Common Mistakes

- Writing a seed that creates duplicate data every time
- Seeding entity records before the required user or team exists

## Related Documents

- `how-to-add-a-new-entity.md`
- `../../02-getting-started/seed-demo-data.md`
