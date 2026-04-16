# Changelog

All notable changes to this starter are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Rate limiting via Upstash Redis (`lib/rate-limit.ts`) with presets for AI, server actions, public assets, and checkout. Integrated on the assistant route, avatar/files routes, checkout, invitation, resend-invitation, and delete-account actions.
- Sentry error tracking (`@sentry/nextjs`) with server, edge, and client init, `onRequestError` forwarding, Replay on error, and a root `app/global-error.tsx`. `identifySentryUser` called from the authenticated `(app)` layout.
- `app/sitemap.ts` covering marketing pages and all curated docs entries.
- `app/robots.ts` disallowing authenticated and API paths, pointing to `/sitemap.xml`.
- GitHub Actions workflow (`.github/workflows/ci.yml`) running lint, typecheck, and tests on push and pull requests.
- `CHANGELOG.md`.

### Changed
- `next.config.mjs` wraps config with `withSentryConfig` when `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` are both set.
- `lib/env.ts` tracks optional feature groups for Upstash rate limiting and Sentry, warning in production when unset.
- Existing per-section `error.tsx` boundaries (`admin`, `dashboard`, `settings`) report through `Sentry.captureException`.
- `eslint.config.mjs` ignores `.source/` and `scripts/` to keep lint focused on app code.

### Fixed
- Dashboard overview test now stubs `aiConversation.findMany` and `member.findMany`, matching the current implementation.
