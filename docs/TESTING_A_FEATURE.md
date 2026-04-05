# Testing a Feature

The starter uses Vitest with focused unit and integration-style tests built around mocks.

## Minimum Test Bar

For a new feature, add:

1. one success-path test
2. one permission or billing-gate test
3. one failure-path test

## Good Reference Files

- `test/organizations/organization-membership.test.ts`
- `test/billing/organization-plan.test.ts`
- `test/assistant/assistant-tools.test.ts`

## Suggested Workflow

1. Mock auth and external APIs first.
2. Assert the business outcome, not framework internals.
3. Keep tests close to the user-facing contract: returned data, thrown error, or redirect behavior.

## Typical Commands

```bash
pnpm test
pnpm test:watch
```

## What To Avoid

- snapshot-heavy tests for ordinary business logic
- mocking every tiny helper when one higher-level mock proves the behavior
- skipping billing and org-scope tests on monetized features
