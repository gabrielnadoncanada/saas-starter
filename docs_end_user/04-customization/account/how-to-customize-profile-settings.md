# How to Customize Profile Settings

## Purpose

Change what appears in account settings without redesigning the whole dashboard.

## Files to Edit

- `app/(app)/dashboard/settings/account/page.tsx`
- `features/account/components/settings/GeneralSettingsForm.tsx`
- `features/account/components/settings/DeleteAccountCard.tsx`
- `features/account/components/settings/ContentSection.tsx`

## Steps

### Step 1 - Change page-level title and description

Edit the `ContentSection` props in `app/(app)/dashboard/settings/account/page.tsx`.

### Step 2 - Change form fields or copy

Edit `features/account/components/settings/GeneralSettingsForm.tsx` to change labels, placeholders, layout, or field order.

### Step 3 - Change destructive account actions

Edit `features/account/components/settings/DeleteAccountCard.tsx` if you want to rename, hide, or rewrite the delete-account block.

### Step 4 - Change the section shell only if needed

Only edit `features/account/components/settings/ContentSection.tsx` if you want to change the shared settings section layout.

## Example

Common customizations include:

- rename `General Settings`
- remove phone number
- move email lower in the form
- rewrite delete-account warnings for your product

## Common Mistakes

- Editing shared layout first when a local component change is enough
- Changing form copy without checking server-side validation messages

## Related Documents

- `how-to-add-profile-fields.md`
- `how-to-remove-unused-settings.md`
