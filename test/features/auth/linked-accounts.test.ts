import {
  unlinkOAuthAccountForUser,
  getLinkedAccountsOverview
} from '@/features/auth/server/linked-accounts';

function createDbDouble(overrides: Record<string, Record<string, unknown>> = {}) {
  const deleteCalls: unknown[] = [];
  const activityLogCalls: unknown[] = [];

  const db = {
    account: {
      findFirst: async () => null,
      findMany: async () => [],
      delete: async (args: unknown) => {
        deleteCalls.push(args);
      },
      ...overrides.account
    },
    teamMember: {
      findFirst: async () => null,
      ...overrides.teamMember
    },
    activityLog: {
      create: async (args: unknown) => {
        activityLogCalls.push(args);
      },
      ...overrides.activityLog
    }
  };

  return { db, deleteCalls, activityLogCalls };
}

it('unlink returns not-found when account does not exist', async () => {
  const { db, deleteCalls } = createDbDouble();

  const result = await unlinkOAuthAccountForUser(
    { userId: 1, provider: 'google' },
    { db: db as never }
  );

  expect(result).toEqual({ status: 'not-found' });
  expect(deleteCalls).toHaveLength(0);
});

it('unlink deletes account and logs activity when user has a team', async () => {
  const { db, deleteCalls, activityLogCalls } = createDbDouble({
    account: { findFirst: async () => ({ id: 42 }) },
    teamMember: { findFirst: async () => ({ teamId: 5 }) }
  });

  const result = await unlinkOAuthAccountForUser(
    { userId: 1, provider: 'github' },
    { db: db as never }
  );

  expect(result).toEqual({ status: 'unlinked' });
  expect(deleteCalls).toHaveLength(1);
  expect(deleteCalls[0]).toEqual({ where: { id: 42 } });
  expect(activityLogCalls).toHaveLength(1);
});

it('unlink deletes account without logging when user has no team', async () => {
  const { db, deleteCalls, activityLogCalls } = createDbDouble({
    account: { findFirst: async () => ({ id: 7 }) }
  });

  const result = await unlinkOAuthAccountForUser(
    { userId: 1, provider: 'google' },
    { db: db as never }
  );

  expect(result).toEqual({ status: 'unlinked' });
  expect(deleteCalls).toHaveLength(1);
  expect(activityLogCalls).toHaveLength(0);
});

it('overview returns all providers with linked status', async () => {
  const now = new Date('2026-01-15');
  const { db } = createDbDouble({
    account: {
      findMany: async () => [{ provider: 'google', createdAt: now }]
    }
  });

  const result = await getLinkedAccountsOverview(
    1,
    ['google', 'github'],
    { db: db as never }
  );

  expect(result.providers).toHaveLength(2);
  expect(result.providers[0]).toEqual({
    provider: 'google',
    linkedAt: now,
    isLinked: true,
    canUnlink: true
  });
  expect(result.providers[1]).toEqual({
    provider: 'github',
    linkedAt: null,
    isLinked: false,
    canUnlink: false
  });
});

it('overview returns all unlinked when no accounts exist', async () => {
  const { db } = createDbDouble();

  const result = await getLinkedAccountsOverview(
    1,
    ['google', 'github'],
    { db: db as never }
  );

  expect(result.providers.every((p) => !p.isLinked)).toBe(true);
});
