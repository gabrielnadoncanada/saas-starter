import { db } from './prisma';
import { auth } from '@/auth';

export async function getUser() {
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

export async function getTeamByStripeCustomerId(customerId: string) {
  return db.team.findFirst({
    where: { stripeCustomerId: customerId }
  });
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db.team.update({
    where: { id: teamId },
    data: subscriptionData
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

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const logs = await db.activityLog.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 10
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
    userName: log.user?.name ?? null
  }));
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.teamMember.findFirst({
    where: { userId: user.id },
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
