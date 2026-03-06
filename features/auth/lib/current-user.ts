import { auth } from '@/auth';
import { db } from '@/lib/db/prisma';

export async function getCurrentUser() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return db.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    }
  });
}

export async function getUserWithTeam(userId: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      teamMembers: {
        take: 1,
        select: { teamId: true }
      }
    }
  });

  if (!user) {
    return null;
  }

  return {
    user,
    teamId: user.teamMembers[0]?.teamId ?? null
  };
}
