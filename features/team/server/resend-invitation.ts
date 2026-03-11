import type { User } from '@prisma/client';
import { db } from '@/lib/db/prisma';
import { sendTeamInvitationEmail } from '@/lib/email/senders';
import { getUserTeamMembership } from '@/features/team/server/team-membership';

type ResendInvitationParams = {
  invitationId: number;
  user: Pick<User, 'id' | 'name' | 'email'>;
};

export async function resendInvitation({
  invitationId,
  user,
}: ResendInvitationParams) {
  const userWithTeam = await getUserTeamMembership(user.id);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  if (userWithTeam.teamRole !== 'OWNER') {
    return { error: 'Only team owners can resend invitations' };
  }

  const invitation = await db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: userWithTeam.teamId,
      status: 'PENDING',
    },
    include: { team: { select: { name: true } } },
  });

  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  try {
    await sendTeamInvitationEmail({
      email: invitation.email,
      role: invitation.role,
      inviterName: user.name || user.email,
      teamName: invitation.team.name,
      invitationId: invitation.id,
    });
  } catch {
    return { error: 'Failed to send email' };
  }

  return { success: 'Invitation email resent' };
}
