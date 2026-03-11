import { db } from '@/lib/db/prisma';
import { getUserTeamMembership } from '@/features/team/server/team-membership';

type CancelInvitationParams = {
  invitationId: number;
  userId: number;
};

export async function cancelInvitation({
  invitationId,
  userId,
}: CancelInvitationParams) {
  const userWithTeam = await getUserTeamMembership(userId);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  if (userWithTeam.teamRole !== 'OWNER') {
    return { error: 'Only team owners can cancel invitations' };
  }

  const invitation = await db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: userWithTeam.teamId,
      status: 'PENDING',
    },
  });

  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  await db.invitation.update({
    where: { id: invitationId },
    data: { status: 'CANCELED' },
  });

  return { success: 'Invitation canceled' };
}
