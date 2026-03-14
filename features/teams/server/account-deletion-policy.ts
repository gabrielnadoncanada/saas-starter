import { db } from "@/shared/lib/db/prisma";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

export type UserTeamMembershipLike = {
  teamId: number | null;
};

export async function getAccountDeletionBlocker(
  membership: UserTeamMembershipLike | null,
) {
  if (!membership?.teamId) {
    return null;
  }

  const team = await db.team.findUnique({
    where: { id: membership.teamId },
    select: {
      subscriptionStatus: true,
      _count: {
        select: {
          teamMembers: true,
        },
      },
    },
  });

  if (!team) {
    return null;
  }

  const hasActiveSubscription =
    !!team.subscriptionStatus &&
    ACTIVE_STATUSES.includes(
      team.subscriptionStatus as (typeof ACTIVE_STATUSES)[number],
    );

  const isLastTeamMember = team._count.teamMembers <= 1;

  if (isLastTeamMember && hasActiveSubscription) {
    return "You have an active subscription. Cancel it from your billing settings before deleting your account.";
  }

  return null;
}
