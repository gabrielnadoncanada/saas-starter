# How to Change Colors and Theme

## Purpose

Re-theme the starter without rebuilding the component system.

## Files to Edit

- `app/theme.css`
- `app/globals.css`

## Steps

### Step 1 - Change the design tokens

Edit the color variables in `app/theme.css`.

### Step 2 - Change shared radius or token wiring if needed

Also use `app/theme.css` for radius and font token changes.

### Step 3 - Change global behavior only if needed

Edit `app/globals.css` for base styles, scrollbar behavior, animation utilities, or shared layout CSS.

## Common Mistakes

- Editing dozens of components directly instead of changing tokens first
- Changing global CSS when the token layer is enough

## Related Documents

- `how-to-rebrand-the-dashboard.md`
