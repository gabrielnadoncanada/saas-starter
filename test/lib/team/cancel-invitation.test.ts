vi.mock('@/features/auth/server/current-user', () => ({
  getUserWithTeam: async () => null,
}));

import { cancelInvitation } from '@/features/team/lib/cancel-invitation';

const PENDING_INVITATION = {
  id: 5,
  email: 'invitee@example.com',
  teamId: 1,
  role: 'member',
  status: 'pending',
};

function createDeps(overrides: {
  teamId?: number | null;
  invitation?: unknown;
} = {}) {
  const updateCalls: unknown[] = [];

  const deps = {
    getUserWithTeam: async () =>
      overrides.teamId === null
        ? null
        : { teamId: overrides.teamId ?? 1, user: {} },
    db: {
      invitation: {
        findFirst: async () => overrides.invitation ?? null,
        update: async (args: unknown) => {
          updateCalls.push(args);
        },
      },
    },
  };

  return { deps: deps as never, updateCalls };
}

it('returns error when user has no team', async () => {
  const { deps } = createDeps({ teamId: null });

  const result = await cancelInvitation(
    { invitationId: 5, userId: 1 },
    deps,
  );

  expect(result).toEqual({ error: 'User is not part of a team' });
});

it('returns error when invitation not found', async () => {
  const { deps } = createDeps();

  const result = await cancelInvitation(
    { invitationId: 99, userId: 1 },
    deps,
  );

  expect(result).toEqual({ error: 'Invitation not found' });
});

it('cancels a pending invitation', async () => {
  const { deps, updateCalls } = createDeps({
    invitation: PENDING_INVITATION,
  });

  const result = await cancelInvitation(
    { invitationId: 5, userId: 1 },
    deps,
  );

  expect(result).toEqual({ success: 'Invitation canceled' });
  expect(updateCalls).toHaveLength(1);
  expect(updateCalls[0]).toEqual({
    where: { id: 5 },
    data: { status: 'canceled' },
  });
});
