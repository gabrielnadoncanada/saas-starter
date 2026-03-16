# How to Edit FAQ

## Purpose

Add or change a public FAQ section for the marketing site.

## Current State

There is no dedicated FAQ route or FAQ data source in `app/` yet. If you want FAQ content, you will first decide where it lives.

## Simplest Path

Add the FAQ directly to `app/(marketing)/page.tsx` if you only need a short landing-page section.

## Better Path If FAQ Matters

Create a dedicated component or route, then link to it from the marketing page.

## Files to Edit

- `app/(marketing)/page.tsx`
- optionally a new component under `features/` or `shared/components/`

## Flags

- This guide is short only because the feature does not exist yet

## Simplification Recommendation

If FAQ is part of your public sales flow, add one clear `MarketingFaqSection` component instead of scattering answers inline through the page.

## Related Documents

- `how-to-edit-landing-page.md`
