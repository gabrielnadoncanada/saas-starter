import { db } from '@/lib/db/prisma';
import { getUserWithTeam } from '@/features/auth/server/current-user';

type CancelInvitationParams = {
  invitationId: number;
  userId: number;
};

export async function cancelInvitation({
  invitationId,
  userId,
}: CancelInvitationParams) {
  const userWithTeam = await getUserWithTeam(userId);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  const invitation = await db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: userWithTeam.teamId,
      status: 'pending',
    },
  });

  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  await db.invitation.update({
    where: { id: invitationId },
    data: { status: 'canceled' },
  });

  return { success: 'Invitation canceled' };
}
