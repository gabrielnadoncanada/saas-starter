# How to Remove Unused Settings

## Purpose

Strip out account settings you do not want in your product.

## Files to Edit

- `app/(app)/dashboard/settings/account/page.tsx`
- `features/account/components/settings/GeneralSettingsForm.tsx`
- `features/account/components/settings/DeleteAccountCard.tsx`
- `shared/components/navigation/config/settings-group.ts`

## Steps

### Step 1 - Remove the field or card from the page

Delete the component from `app/(app)/dashboard/settings/account/page.tsx` if you want to remove a whole section.

### Step 2 - Remove individual inputs from the form

Delete the matching field block from `features/account/components/settings/GeneralSettingsForm.tsx`.

### Step 3 - Remove server support if the field is truly gone

If you permanently remove a saved field, also remove it from:

- `features/account/schemas/account.schema.ts`
- `features/account/server/update-account.ts`
- the `User` model if you no longer need the data at all

### Step 4 - Remove the nav link if you remove an entire settings page

If you delete a whole settings page, also remove the corresponding item from `shared/components/navigation/config/settings-group.ts`.

## Common Mistakes

- Hiding a field in the UI but still validating it on the server
- Removing the page but leaving the sidebar link

## Related Documents

- `how-to-customize-profile-settings.md`
