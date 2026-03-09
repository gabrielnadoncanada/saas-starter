import { ActivityType } from "@/lib/db/types";
import { db } from "@/lib/db/prisma";
import { getUserWithTeam } from "@/features/auth/server/current-user";

const ACTIVE_STATUSES = ["active", "trialing"];

export type DeleteAccountUser = {
  id: number;
  email: string;
};

type DeleteAccountDeps = {
  getUserWithTeam: (
    userId: number,
  ) => Promise<{ teamId: number | null } | null>;
  db: Pick<typeof db, "team" | "$transaction">;
};

const defaultDeps: DeleteAccountDeps = { getUserWithTeam, db };

export async function deleteAccount(
  user: DeleteAccountUser,
  deps = defaultDeps,
) {
  const userWithTeam = await deps.getUserWithTeam(user.id);

  if (userWithTeam?.teamId) {
    const team = await deps.db.team.findUnique({
      where: { id: userWithTeam.teamId },
      select: {
        subscriptionStatus: true,
        _count: { select: { teamMembers: true } },
      },
    });

    if (
      team &&
      team._count.teamMembers <= 1 &&
      team.subscriptionStatus &&
      ACTIVE_STATUSES.includes(team.subscriptionStatus)
    ) {
      return {
        error:
          "You have an active subscription. Cancel it from your billing settings before deleting your account.",
      };
    }
  }

  await deps.db.$transaction(async (tx: any) => {
    if (userWithTeam?.teamId) {
      await tx.activityLog.create({
        data: {
          teamId: userWithTeam.teamId,
          userId: user.id,
          action: ActivityType.DELETE_ACCOUNT,
          ipAddress: "",
        },
      });
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        email: `${user.email}-${user.id}-deleted`,
        image: null,
      },
    });

    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    if (userWithTeam?.teamId) {
      await tx.teamMember.deleteMany({
        where: { userId: user.id, teamId: userWithTeam.teamId },
      });
    }
  });

  return { success: "Account deleted successfully." };
}
