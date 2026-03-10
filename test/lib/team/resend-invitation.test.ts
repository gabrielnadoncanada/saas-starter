vi.mock('@/features/auth/server/current-user', () => ({
  getUserWithTeam: async () => null,
}));

import { resendInvitation } from '@/features/team/lib/resend-invitation';

const USER = { id: 1, name: 'Owner', email: 'owner@example.com' };

const PENDING_INVITATION = {
  id: 5,
  email: 'invitee@example.com',
  teamId: 1,
  role: 'member',
  status: 'pending',
  team: { name: 'Platform Team' },
};

function createDeps(overrides: {
  teamId?: number | null;
  invitation?: unknown;
  emailError?: boolean;
} = {}) {
  const sentEmails: unknown[] = [];

  const deps = {
    getUserWithTeam: async () =>
      overrides.teamId === null
        ? null
        : { teamId: overrides.teamId ?? 1, user: {} },
    db: {
      invitation: {
        findFirst: async () => overrides.invitation ?? null,
      },
    },
    sendTeamInvitationEmail: async (payload: unknown) => {
      if (overrides.emailError) {
        throw new Error('smtp down');
      }
      sentEmails.push(payload);
    },
  };

  return { deps: deps as never, sentEmails };
}

it('returns error when user has no team', async () => {
  const { deps } = createDeps({ teamId: null });

  const result = await resendInvitation(
    { invitationId: 5, user: USER },
    deps,
  );

  expect(result).toEqual({ error: 'User is not part of a team' });
});

it('returns error when invitation not found', async () => {
  const { deps } = createDeps();

  const result = await resendInvitation(
    { invitationId: 99, user: USER },
    deps,
  );

  expect(result).toEqual({ error: 'Invitation not found' });
});

it('resends the invitation email', async () => {
  const { deps, sentEmails } = createDeps({
    invitation: PENDING_INVITATION,
  });

  const result = await resendInvitation(
    { invitationId: 5, user: USER },
    deps,
  );

  expect(result).toEqual({ success: 'Invitation email resent' });
  expect(sentEmails).toHaveLength(1);
  expect(sentEmails[0]).toEqual({
    email: 'invitee@example.com',
    role: 'member',
    inviterName: 'Owner',
    teamName: 'Platform Team',
    invitationId: 5,
  });
});

it('uses email as inviter name when name is missing', async () => {
  const { deps, sentEmails } = createDeps({
    invitation: PENDING_INVITATION,
  });

  const result = await resendInvitation(
    { invitationId: 5, user: { ...USER, name: null } },
    deps,
  );

  expect(result).toEqual({ success: 'Invitation email resent' });
  expect((sentEmails[0] as Record<string, unknown>).inviterName).toBe(
    'owner@example.com',
  );
});

it('returns error when email sending fails', async () => {
  const { deps } = createDeps({
    invitation: PENDING_INVITATION,
    emailError: true,
  });

  const result = await resendInvitation(
    { invitationId: 5, user: USER },
    deps,
  );

  expect(result).toEqual({ error: 'Failed to send email' });
});
