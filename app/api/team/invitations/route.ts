import { db } from '@/lib/db/prisma';
import { getCurrentUser } from '@/features/auth/server/current-user';
import { getUserWithTeam } from '@/features/auth/server/current-user';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json([], { status: 401 });
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    return Response.json([]);
  }

  const invitations = await db.invitation.findMany({
    where: {
      teamId: userWithTeam.teamId,
      status: 'pending',
    },
    select: {
      id: true,
      email: true,
      role: true,
      invitedAt: true,
    },
    orderBy: { invitedAt: 'desc' },
  });

  return Response.json(invitations);
}
