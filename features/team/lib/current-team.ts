import { db } from '@/lib/db/prisma';

import { getCurrentUser } from '@/features/auth/lib/current-user';

export async function getCurrentTeam() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return getTeamForUser(user.id);
}

export async function getTeamForUser(userId: number) {
  const result = await db.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          teamMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team ?? null;
}
