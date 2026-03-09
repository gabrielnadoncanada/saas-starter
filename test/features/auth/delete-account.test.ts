vi.mock('@/auth', () => ({ auth: vi.fn() }));

import {
  deleteAccount,
  type DeleteAccountUser
} from '@/features/auth/server/delete-account';

const TEST_USER: DeleteAccountUser = { id: 1, email: 'user@example.com' };

function createDbDouble(teamOverride?: {
  subscriptionStatus: string | null;
  memberCount: number;
}) {
  const transactionCalls: unknown[] = [];

  const db = {
    team: {
      findUnique: async () =>
        teamOverride
          ? {
              subscriptionStatus: teamOverride.subscriptionStatus,
              _count: { teamMembers: teamOverride.memberCount }
            }
          : null
    },
    $transaction: async (callback: (tx: Record<string, any>) => Promise<void>) => {
      const tx = {
        activityLog: { create: async () => undefined },
        user: { update: async () => undefined },
        account: { deleteMany: async () => undefined },
        session: { deleteMany: async () => undefined },
        verificationToken: { deleteMany: async () => undefined },
        teamMember: { deleteMany: async () => undefined }
      };
      transactionCalls.push(true);
      return callback(tx);
    }
  };

  return { db, transactionCalls };
}

function createDeps(
  teamOverride?: { subscriptionStatus: string | null; memberCount: number },
  teamId: number | null = 10
) {
  const { db, transactionCalls } = createDbDouble(teamOverride);

  const deps = {
    getUserWithTeam: async () => (teamId !== null ? { teamId } : null),
    db: db as never
  };

  return { deps, transactionCalls };
}

it('blocks deletion when sole member has active subscription', async () => {
  const { deps, transactionCalls } = createDeps({
    subscriptionStatus: 'active',
    memberCount: 1
  });

  const result = await deleteAccount(TEST_USER, deps);

  expect(result).toEqual({
    error:
      'You have an active subscription. Cancel it from your billing settings before deleting your account.'
  });
  expect(transactionCalls).toHaveLength(0);
});

it('blocks deletion when sole member has trialing subscription', async () => {
  const { deps, transactionCalls } = createDeps({
    subscriptionStatus: 'trialing',
    memberCount: 1
  });

  const result = await deleteAccount(TEST_USER, deps);

  expect(result).toEqual({
    error:
      'You have an active subscription. Cancel it from your billing settings before deleting your account.'
  });
  expect(transactionCalls).toHaveLength(0);
});

it('allows deletion when subscription is canceled', async () => {
  const { deps, transactionCalls } = createDeps({
    subscriptionStatus: 'canceled',
    memberCount: 1
  });

  const result = await deleteAccount(TEST_USER, deps);

  expect(result).toEqual({ success: 'Account deleted successfully.' });
  expect(transactionCalls).toHaveLength(1);
});

it('allows deletion when team has multiple members', async () => {
  const { deps, transactionCalls } = createDeps({
    subscriptionStatus: 'active',
    memberCount: 3
  });

  const result = await deleteAccount(TEST_USER, deps);

  expect(result).toEqual({ success: 'Account deleted successfully.' });
  expect(transactionCalls).toHaveLength(1);
});

it('allows deletion when user has no team', async () => {
  const { deps, transactionCalls } = createDeps(undefined, null);

  const result = await deleteAccount(TEST_USER, deps);

  expect(result).toEqual({ success: 'Account deleted successfully.' });
  expect(transactionCalls).toHaveLength(1);
});

it('allows deletion when team has no subscription', async () => {
  const { deps, transactionCalls } = createDeps({
    subscriptionStatus: null,
    memberCount: 1
  });

  const result = await deleteAccount(TEST_USER, deps);

  expect(result).toEqual({ success: 'Account deleted successfully.' });
  expect(transactionCalls).toHaveLength(1);
});
