import { db } from '@/lib/db/prisma';
import { getUserWithTeam } from '@/features/auth/server/current-user';

type CancelInvitationParams = {
  invitationId: number;
  userId: number;
};

type CancelInvitationDeps = {
  getUserWithTeam: typeof getUserWithTeam;
  db: Pick<typeof db, 'invitation'>;
};

const defaultDeps: CancelInvitationDeps = { getUserWithTeam, db };

export async function cancelInvitation(
  { invitationId, userId }: CancelInvitationParams,
  deps = defaultDeps,
) {
  const userWithTeam = await deps.getUserWithTeam(userId);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  const invitation = await deps.db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: userWithTeam.teamId,
      status: 'pending',
    },
  });

  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  await deps.db.invitation.update({
    where: { id: invitationId },
    data: { status: 'canceled' },
  });

  return { success: 'Invitation canceled' };
}
