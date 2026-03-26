# How to Add Profile Fields

## Purpose

Add a new account field to the settings form and persist it in the database.

## When to Use This

Use this when you want fields like company name, job title, timezone, or any other user-level profile value.

## Files to Edit

- `prisma/models/auth.prisma`
- `features/account/schemas/account.schema.ts`
- `features/account/types/account.types.ts`
- `features/account/server/update-account.ts`
- `features/account/components/settings/GeneralSettingsForm.tsx`
- `app/(app)/dashboard/settings/account/page.tsx`

## Steps

### Step 1 - Add the column to `User`

Add your new field to `prisma/models/auth.prisma`, then run:

```bash
pnpm db:migrate
pnpm db:generate
```

### Step 2 - Accept the field in validation

Update `features/account/schemas/account.schema.ts` so the account update schema knows about the new field.

### Step 3 - Add the field to the account types

Extend the initial values and action state types in `features/account/types/account.types.ts`.

### Step 4 - Save the field on update

Update `features/account/server/update-account.ts` so the field is written in `db.user.update`.

### Step 5 - Render the field in the form

Add a new `Field` block in `features/account/components/settings/GeneralSettingsForm.tsx`.

### Step 6 - Pass the initial value from the page

Update `app/(app)/dashboard/settings/account/page.tsx` so `GeneralSettingsForm` receives the field from the current user.

## Example

If you add `companyName`, the change should stay local to the account feature plus the Prisma model.

## Common Mistakes

- Adding the form field but forgetting the Prisma column
- Updating Prisma but forgetting the server update function
- Forgetting to pass the initial value from the page

## Related Documents

- `how-to-customize-profile-settings.md`
- `../../02-getting-started/database-setup.md`
