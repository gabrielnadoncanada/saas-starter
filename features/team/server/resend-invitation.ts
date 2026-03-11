import type { User } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { sendTeamInvitationEmail } from '@/lib/email/senders';
import { getUserWithTeam } from '@/features/auth/server/current-user';

type ResendInvitationParams = {
  invitationId: number;
  user: Pick<User, 'id' | 'name' | 'email'>;
};

export async function resendInvitation({
  invitationId,
  user,
}: ResendInvitationParams) {
  const userWithTeam = await getUserWithTeam(user.id);

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
