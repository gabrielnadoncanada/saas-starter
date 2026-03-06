import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';

export async function getUserTeamId(userId: number) {
  const teamMember = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
    orderBy: { id: 'asc' }
  });

  return teamMember?.teamId ?? null;
}

export async function logAuthActivity(
  teamId: number | null | undefined,
  userId: number,
  action: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }

  await db.activityLog.create({
    data: {
      teamId,
      userId,
      action,
      ipAddress: ipAddress || ''
    }
  });
}

export async function logUserSignIn(userId: number) {
  const teamId = await getUserTeamId(userId);

  if (!teamId) {
    return;
  }

  await db.activityLog.create({
    data: {
      teamId,
      userId,
      action: 'SIGN_IN',
      ipAddress: ''
    }
  });
}
