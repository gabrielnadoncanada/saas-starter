import { ActivityType } from "@/lib/db/types";
import { db } from "@/lib/db/prisma";

type OnboardingDeps = {
  db: Pick<typeof db, "teamMember" | "user" | "$transaction">;
};

const defaultDeps: OnboardingDeps = { db };

export async function ensureUserWorkspace(
  userId: number,
  email: string,
  deps = defaultDeps,
) {
  const existingTeamMember = await deps.db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
  });

  if (existingTeamMember) {
    return existingTeamMember.teamId;
  }

  const createdTeam = await deps.db.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: `${email}'s Team`,
      },
    });

    await tx.teamMember.create({
      data: {
        userId,
        teamId: team.id,
        role: "owner",
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { role: "owner" },
    });

    await tx.activityLog.createMany({
      data: [
        {
          teamId: team.id,
          userId,
          action: ActivityType.CREATE_TEAM,
          ipAddress: "",
        },
        {
          teamId: team.id,
          userId,
          action: ActivityType.SIGN_UP,
          ipAddress: "",
        },
      ],
    });

    return team;
  });

  return createdTeam.id;
}
