import { db } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getUserTeamMembership } from '@/features/team/server/team-membership';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json([], { status: 401 });
  }

  const userWithTeam = await getUserTeamMembership(user.id);
  if (!userWithTeam?.teamId) {
    return Response.json([]);
  }

  const invitations = await db.invitation.findMany({
    where: {
      teamId: userWithTeam.teamId,
      status: 'PENDING',
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
