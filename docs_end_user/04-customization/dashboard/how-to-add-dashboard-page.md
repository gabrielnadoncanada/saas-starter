# How to Add Dashboard Page

## Purpose

Add a new page inside the authenticated app area.

## Files to Edit

- `app/(app)/dashboard/<your-page>/page.tsx`
- `shared/components/navigation/config/sidebar-data.ts`
- optionally `shared/constants/routes.ts`

## Steps

### Step 1 - Create the route

Add a new folder and `page.tsx` under `app/(app)/dashboard/`.

### Step 2 - Reuse the dashboard shell

Your new page automatically inherits the shared dashboard layout from `app/(app)/dashboard/layout.tsx`.

### Step 3 - Add the navigation item

Update `shared/components/navigation/config/sidebar-data.ts` so the page appears in the sidebar.

### Step 4 - Add a route constant if you want one

If the route will be reused in multiple places, add it to `shared/constants/routes.ts`.

## Example

To add `/dashboard/reports`, create:

```text
app/(app)/dashboard/reports/page.tsx
```

Then add a matching nav item.

## Common Mistakes

- Creating the page but forgetting the sidebar link
- Adding route strings everywhere instead of using `routes.ts` when reused

## Related Documents

- `how-to-change-navigation.md`
- `how-to-create-a-new-feature-from-an-existing-one.md`
