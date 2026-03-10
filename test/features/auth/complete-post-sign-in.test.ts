import { completePostSignIn } from '@/features/auth/server/complete-post-sign-in';

const PENDING_INVITATION = {
  id: 10,
  email: 'user@example.com',
  teamId: 5,
  role: 'member',
  status: 'pending'
};

function createDeps(overrides: {
  invitation?: unknown;
  existingMembership?: unknown;
} = {}) {
  const ensureWorkspaceCalls: Array<{ userId: number; email: string }> = [];
  const teamMemberCreateCalls: unknown[] = [];
  const invitationUpdateCalls: unknown[] = [];
  const activityLogCalls: unknown[] = [];

  const deps = {
    ensureUserWorkspace: async (userId: number, email: string) => {
      ensureWorkspaceCalls.push({ userId, email });
      return 99;
    },
    db: {
      invitation: {
        findFirst: async () => overrides.invitation ?? null
      },
      $transaction: async (
        callback: (tx: Record<string, any>) => Promise<void>
      ) =>
        callback({
          teamMember: {
            findFirst: async () => overrides.existingMembership ?? null,
            create: async (args: unknown) => {
              teamMemberCreateCalls.push(args);
            }
          },
          user: {
            update: async () => undefined
          },
          invitation: {
            update: async (args: unknown) => {
              invitationUpdateCalls.push(args);
            }
          },
          activityLog: {
            create: async (args: unknown) => {
              activityLogCalls.push(args);
            }
          }
        })
    } as never
  };

  return {
    deps,
    ensureWorkspaceCalls,
    teamMemberCreateCalls,
    invitationUpdateCalls,
    activityLogCalls
  };
}

it('delegates to ensureUserWorkspace when no inviteId', async () => {
  const { deps, ensureWorkspaceCalls } = createDeps();

  const result = await completePostSignIn(
    { userId: 1, email: 'user@example.com' },
    deps
  );

  expect(result).toBe(99);
  expect(ensureWorkspaceCalls).toHaveLength(1);
});

it('delegates to ensureUserWorkspace when inviteId is invalid', async () => {
  const { deps, ensureWorkspaceCalls } = createDeps();

  const result = await completePostSignIn(
    { userId: 1, email: 'user@example.com', inviteId: 'abc' },
    deps
  );

  expect(result).toBe(99);
  expect(ensureWorkspaceCalls).toHaveLength(1);
});

it('delegates to ensureUserWorkspace when invitation not found', async () => {
  const { deps, ensureWorkspaceCalls } = createDeps();

  const result = await completePostSignIn(
    { userId: 1, email: 'user@example.com', inviteId: '10' },
    deps
  );

  expect(result).toBe(99);
  expect(ensureWorkspaceCalls).toHaveLength(1);
});

it('accepts invitation and creates membership for new member', async () => {
  const { deps, ensureWorkspaceCalls, teamMemberCreateCalls, invitationUpdateCalls, activityLogCalls } =
    createDeps({ invitation: PENDING_INVITATION });

  const result = await completePostSignIn(
    { userId: 1, email: 'user@example.com', inviteId: '10' },
    deps
  );

  expect(result).toBe(5);
  expect(ensureWorkspaceCalls).toHaveLength(0);
  expect(teamMemberCreateCalls).toHaveLength(1);
  expect(invitationUpdateCalls).toHaveLength(1);
  expect(activityLogCalls).toHaveLength(1);
});

it('skips membership creation when user is already a member', async () => {
  const { deps, teamMemberCreateCalls, invitationUpdateCalls, activityLogCalls } =
    createDeps({
      invitation: PENDING_INVITATION,
      existingMembership: { id: 1 }
    });

  const result = await completePostSignIn(
    { userId: 1, email: 'user@example.com', inviteId: '10' },
    deps
  );

  expect(result).toBe(5);
  expect(teamMemberCreateCalls).toHaveLength(0);
  expect(invitationUpdateCalls).toHaveLength(1);
  expect(activityLogCalls).toHaveLength(1);
});
