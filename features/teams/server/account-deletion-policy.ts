import { db } from "@/shared/lib/db/prisma";

const ACTIVE_STATUSES = ["active", "trialing", "lifetime"] as const;

function hasActiveSubscription(team: {
  subscriptionStatus: string | null;
}) {
  return (
    !!team.subscriptionStatus &&
    ACTIVE_STATUSES.includes(
      team.subscriptionStatus as (typeof ACTIVE_STATUSES)[number],
    )
  );
}

export async function getAccountDeletionBlocker(userId: number) {
  // Check ALL teams where this user is OWNER
  const ownedTeams = await db.teamMember.findMany({
    where: { userId, role: "OWNER" },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
          _count: { select: { teamMembers: true } },
        },
      },
    },
  });

  for (const membership of ownedTeams) {
    const team = membership.team;

    // Check if there's another OWNER in this team
    const otherOwnerCount = await db.teamMember.count({
      where: {
        teamId: team.id,
        role: "OWNER",
        userId: { not: userId },
      },
    });

    // If sole owner and team has other members, block deletion
    if (otherOwnerCount === 0 && team._count.teamMembers > 1) {
      return `You are the sole owner of "${team.name}". Transfer ownership before deleting your account.`;
    }

    // If sole owner and team has an active subscription, block deletion
    if (otherOwnerCount === 0 && hasActiveSubscription(team)) {
      return `Cancel the subscription for "${team.name}" before deleting your account.`;
    }
  }

  return null;
}
