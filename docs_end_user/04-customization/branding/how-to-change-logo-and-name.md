# How to Change Logo and Name

## Purpose

Replace the starter branding with your product name and identity.

## Files to Edit

- `app/layout.tsx`
- `app/(marketing)/page.tsx`
- `app/(marketing)/pricing/page.tsx`
- `shared/components/navigation/config/sidebar-data.ts`

## Steps

### Step 1 - Change metadata

Edit the `metadata` export in `app/layout.tsx` for the app title and description.

### Step 2 - Change landing page branding

Edit `app/(marketing)/page.tsx` for headline, supporting copy, and CTA text.

### Step 3 - Change pricing page naming

Edit any plan or brand references in `features/billing/components/PricingSection.tsx`.

### Step 4 - Change dashboard identity

Edit `shared/components/navigation/config/sidebar-data.ts` if you want the sidebar team and user placeholders to stop showing starter/demo names.

## Common Mistakes

- Updating metadata but not the visible landing page copy
- Leaving demo team names in the sidebar config

## Related Documents

- `how-to-rebrand-the-dashboard.md`
