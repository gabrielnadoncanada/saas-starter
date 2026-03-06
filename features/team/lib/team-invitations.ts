import { ActivityType, type User } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { sendTeamInvitationEmail } from '@/lib/email/senders';

export type InviteTeamMemberInput = {
  teamId: number;
  teamName: string;
  inviter: Pick<User, 'id' | 'email' | 'name'>;
  email: string;
  role: 'member' | 'owner';
};

type InviteTeamMemberDependencies = {
  db: typeof db;
  sendTeamInvitationEmail: typeof sendTeamInvitationEmail;
};

type InviteTeamMemberResult = { error: string } | { success: string };

async function ensureNoExistingMembership(
  dependencies: InviteTeamMemberDependencies,
  input: InviteTeamMemberInput
): Promise<InviteTeamMemberResult | null> {
  const existingMember = await dependencies.db.teamMember.findFirst({
    where: {
      teamId: input.teamId,
      user: {
        email: input.email
      }
    }
  });

  if (existingMember) {
    return { error: 'User is already a member of this team' };
  }

  return null;
}

async function ensureNoPendingInvitation(
  dependencies: InviteTeamMemberDependencies,
  input: InviteTeamMemberInput
): Promise<InviteTeamMemberResult | null> {
  const existingInvitation = await dependencies.db.invitation.findFirst({
    where: {
      email: input.email,
      teamId: input.teamId,
      status: 'pending'
    }
  });

  if (existingInvitation) {
    return { error: 'An invitation has already been sent to this email' };
  }

  return null;
}

async function createInvitationRecord(
  dependencies: InviteTeamMemberDependencies,
  input: InviteTeamMemberInput
) {
  return dependencies.db.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        teamId: input.teamId,
        email: input.email,
        role: input.role,
        invitedBy: input.inviter.id,
        status: 'pending'
      }
    });

    await tx.activityLog.create({
      data: {
        teamId: input.teamId,
        userId: input.inviter.id,
        action: ActivityType.INVITE_TEAM_MEMBER,
        ipAddress: ''
      }
    });

    return invitation;
  });
}

async function sendInvitationEmail(
  dependencies: InviteTeamMemberDependencies,
  input: InviteTeamMemberInput,
  invitationId: number
): Promise<InviteTeamMemberResult> {
  try {
    await dependencies.sendTeamInvitationEmail({
      email: input.email,
      role: input.role,
      inviterName: input.inviter.name || input.inviter.email,
      teamName: input.teamName,
      invitationId
    });
  } catch (error) {
    console.error('[team:invitation.email-failed]', {
      email: input.email,
      invitationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: 'Invitation created successfully. Email delivery could not be confirmed.'
    };
  }

  return { success: 'Invitation sent successfully' };
}

export function createInviteTeamMemberHandler(
  dependencies: InviteTeamMemberDependencies = {
    db,
    sendTeamInvitationEmail
  }
) {
  return async function inviteTeamMemberToTeam(input: InviteTeamMemberInput) {
    const membershipError = await ensureNoExistingMembership(
      dependencies,
      input
    );

    if (membershipError) {
      return membershipError;
    }

    const invitationError = await ensureNoPendingInvitation(
      dependencies,
      input
    );

    if (invitationError) {
      return invitationError;
    }

    const invitation = await createInvitationRecord(dependencies, input);

    return sendInvitationEmail(dependencies, input, invitation.id);
  };
}

export const inviteTeamMemberToTeam = createInviteTeamMemberHandler();
