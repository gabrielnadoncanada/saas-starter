import { createInviteTeamMemberHandler } from '@/features/team/lib/team-invitations';

function createDbDouble(overrides: Partial<Record<string, unknown>> = {}) {
  const invitationCreateCalls: unknown[] = [];
  const activityLogCalls: unknown[] = [];

  const db = {
    teamMember: {
      findFirst: async () => null
    },
    invitation: {
      findFirst: async () => null
    },
    activityLog: {
      create: async () => undefined
    },
    $transaction: async (
      callback: (tx: {
        invitation: { create: (args: unknown) => Promise<{ id: number }> };
        activityLog: { create: (args: unknown) => Promise<void> };
      }) => Promise<{ id: number }>
    ) =>
      callback({
        invitation: {
          create: async (args: unknown) => {
            invitationCreateCalls.push(args);
            return { id: 7 };
          }
        },
        activityLog: {
          create: async (args: unknown) => {
            activityLogCalls.push(args);
          }
        }
      }),
    ...overrides
  };

  return {
    db,
    invitationCreateCalls,
    activityLogCalls
  };
}

it('inviteTeamMemberToTeam rejects existing members', async () => {
  const { db } = createDbDouble({
    teamMember: {
      findFirst: async () => ({ id: 1 })
    }
  });

  const handler = createInviteTeamMemberHandler({
    db: db as never,
    sendTeamInvitationEmail: async () => undefined
  });

  const result = await handler({
    teamId: 1,
    teamName: 'Platform Team',
    inviter: { id: 10, email: 'owner@example.com', name: 'Owner' },
    email: 'member@example.com',
    role: 'member'
  });

  expect(result).toEqual({ error: 'User is already a member of this team' });
});

it('inviteTeamMemberToTeam rejects duplicate pending invitations', async () => {
  const { db } = createDbDouble({
    invitation: {
      findFirst: async () => ({ id: 4 })
    }
  });

  const handler = createInviteTeamMemberHandler({
    db: db as never,
    sendTeamInvitationEmail: async () => undefined
  });

  const result = await handler({
    teamId: 1,
    teamName: 'Platform Team',
    inviter: { id: 10, email: 'owner@example.com', name: 'Owner' },
    email: 'member@example.com',
    role: 'member'
  });

  expect(result).toEqual({
    error: 'An invitation has already been sent to this email'
  });
});

it('inviteTeamMemberToTeam creates invitation and sends email', async () => {
  const { db, invitationCreateCalls, activityLogCalls } = createDbDouble();
  const sentPayloads: unknown[] = [];
  const handler = createInviteTeamMemberHandler({
    db: db as never,
    sendTeamInvitationEmail: async (payload: unknown) => {
      sentPayloads.push(payload);
    }
  });

  const result = await handler({
    teamId: 1,
    teamName: 'Platform Team',
    inviter: { id: 10, email: 'owner@example.com', name: 'Owner' },
    email: 'member@example.com',
    role: 'owner'
  });

  expect(result).toEqual({ success: 'Invitation sent successfully' });
  expect(invitationCreateCalls).toHaveLength(1);
  expect(activityLogCalls).toHaveLength(1);
  expect(sentPayloads).toEqual([
    {
      email: 'member@example.com',
      role: 'owner',
      inviterName: 'Owner',
      teamName: 'Platform Team',
      invitationId: 7
    }
  ]);
});

it('inviteTeamMemberToTeam logs email failures and keeps invitation created', async () => {
  const { db } = createDbDouble();
  const errors: unknown[] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args);
  };

  try {
    const handler = createInviteTeamMemberHandler({
      db: db as never,
      sendTeamInvitationEmail: async () => {
        throw new Error('resend unavailable');
      }
    });

    const result = await handler({
      teamId: 1,
      teamName: 'Platform Team',
      inviter: { id: 10, email: 'owner@example.com', name: 'Owner' },
      email: 'member@example.com',
      role: 'member'
    });

    expect(result).toEqual({
      success: 'Invitation created successfully. Email delivery could not be confirmed.'
    });
    expect(errors).toHaveLength(1);
  } finally {
    console.error = originalConsoleError;
  }
});
