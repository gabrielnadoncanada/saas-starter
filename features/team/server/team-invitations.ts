import { ActivityType, type TeamRole, type User } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { sendTeamInvitationEmail } from '@/lib/email/senders';

export type InviteTeamMemberInput = {
  teamId: number;
  teamName: string;
  inviter: Pick<User, 'id' | 'email' | 'name'>;
  email: string;
  role: TeamRole;
};

type InviteTeamMemberResult = { error: string } | { success: string };

async function ensureNoExistingMembership(
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult | null> {
  const existingMember = await db.teamMember.findFirst({
    where: {
      teamId: input.teamId,
      user: {
        email: input.email,
      },
    },
  });

  if (existingMember) {
    return { error: 'User is already a member of this team' };
  }

  return null;
}

async function ensureNoPendingInvitation(
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult | null> {
  const existingInvitation = await db.invitation.findFirst({
    where: {
      email: input.email,
      teamId: input.teamId,
      status: 'PENDING',
    },
  });

  if (existingInvitation) {
    return { error: 'An invitation has already been sent to this email' };
  }

  return null;
}

async function createInvitationRecord(input: InviteTeamMemberInput) {
  return db.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        teamId: input.teamId,
        email: input.email,
        role: input.role,
        invitedBy: input.inviter.id,
        status: 'PENDING',
      },
    });

    await tx.activityLog.create({
      data: {
        teamId: input.teamId,
        userId: input.inviter.id,
        action: ActivityType.INVITE_TEAM_MEMBER,
        ipAddress: '',
      },
    });

    return invitation;
  });
}

async function sendInvitationEmail(
  input: InviteTeamMemberInput,
  invitationId: number,
): Promise<InviteTeamMemberResult> {
  try {
    await sendTeamInvitationEmail({
      email: input.email,
      role: input.role,
      inviterName: input.inviter.name || input.inviter.email,
      teamName: input.teamName,
      invitationId,
    });
  } catch (error) {
    console.error('[team:invitation.email-failed]', {
      email: input.email,
      invitationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: 'Invitation created successfully. Email delivery could not be confirmed.',
    };
  }

  return { success: 'Invitation sent successfully' };
}

export async function inviteTeamMemberToTeam(input: InviteTeamMemberInput) {
  const membershipError = await ensureNoExistingMembership(input);

  if (membershipError) {
    return membershipError;
  }

  const invitationError = await ensureNoPendingInvitation(input);

  if (invitationError) {
    return invitationError;
  }

  const invitation = await createInvitationRecord(input);

  return sendInvitationEmail(input, invitation.id);
}
