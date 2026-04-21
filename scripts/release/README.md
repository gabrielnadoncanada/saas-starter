# Release pipeline: tenviq-com → tenviq-starter

This repo is **tenviq-com**: the marketing site, the live demo, the blog, the
/compare pages, the founding-seat FOMO pricing. It is not what buyers get.

**tenviq-starter** is the stripped snapshot of this repo that buyers are
invited to. It contains the same app code (auth, billing, orgs, admin, AI,
tasks, assistant, emails), but the marketing surfaces are replaced with
generic templates so buyers aren't forced to delete Tenviq-specific content
before they can customize anything.

## How to release

```bash
# Plan the release (no writes, prints what will happen)
pnpm release:starter --dry-run

# Write the snapshot to ../tenviq-starter
pnpm release:starter

# Write to a custom location
pnpm release:starter --target /path/to/out
```

The script only touches files tracked by `git` in this repo, so uncommitted
work in progress isn't snapshotted.

## What happens

1. **Enumerate tracked files** via `git ls-files`.
2. **Strip** everything listed in `manifest.remove` (Tenviq-only blog posts,
   marketing context, /compare routes, release tooling itself).
3. **Copy** the remaining files to the target, applying the simple token
   replacements in `manifest.stringReplace` (e.g. `Tenviq` → `SaaS Starter`)
   to every text file.
4. **Overlay** the files listed in `manifest.overrideFrom` with the generic
   versions stored under `scripts/release/templates/` (landing page, README,
   LICENSE, legal stubs, etc.).
5. **Add** any extra files that exist under `templates/` but are not listed
   in `overrideFrom` (e.g. a placeholder welcome blog post).
6. **Write a snapshot marker** (`.release-starter-snapshot`) at the root so
   the next run can safely wipe the target.

## When to update the manifest

Add to `manifest.remove` when you create Tenviq-only content that buyers
should never see (new blog posts about Tenviq, new /compare pages, marketing
scripts, product-marketing context docs).

Add to `manifest.overrideFrom` (and create a matching template) when you
modify a file in a way that is Tenviq-specific but buyers still need a
generic version — e.g., you rewrite the landing page, the OG image, or the
license.

Use `manifest.stringReplace` sparingly. It's a fallback for isolated brand
mentions; most rebranding should go through `overrideFrom` so the diff is
reviewable.

## Validating a snapshot

After running the release, you can smoke-test it:

```bash
cd ../tenviq-starter
pnpm install
pnpm exec tsc --noEmit
pnpm build
```

If the build succeeds and the landing loads at `pnpm dev`, the snapshot is
ready to publish to the tenviq-starter GitHub repo.

## What buyers get

The snapshot is a self-contained, working Next.js SaaS starter. Everything
Tenviq-specific — FOMO pricing, /compare pages, Tenviq branding, the
founding-seat narrative — is gone. Buyers clone it, run `pnpm setup`, and
start customizing their own landing, pricing, blog, and branding.
