# How to Change Sign In Page

## Purpose

Customize the sign-in and sign-up screens without touching the auth backend.

## Files to Edit

- `app/(auth)/sign-in/page.tsx`
- `app/(auth)/sign-up/page.tsx`
- `features/auth/components/AuthCard.tsx`
- `features/auth/components/AuthForm.tsx`
- `features/auth/components/OAuthButtons.tsx`
- `features/auth/components/MagicLinkForm.tsx`

## Steps

### Step 1 - Change page copy and structure

Edit `app/(auth)/sign-in/page.tsx` and `app/(auth)/sign-up/page.tsx` for titles, descriptions, and footer copy.

### Step 2 - Change the shared card shell

Edit `features/auth/components/AuthCard.tsx` if you want both pages to share a new layout.

### Step 3 - Change provider button presentation

Edit `features/auth/components/OAuthButtons.tsx` if you want different button text, order, or styling.

### Step 4 - Change magic-link form wording

Edit `features/auth/components/MagicLinkForm.tsx`.

## Common Mistakes

- Editing backend provider logic when you only want to change copy
- Changing one page and forgetting the other

## Related Documents

- `how-to-add-auth-provider.md`
- `../../02-getting-started/auth-setup.md`
