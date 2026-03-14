import { ActivityType } from "@prisma/client";
import { db } from "@/shared/lib/db/prisma";

export async function ensureUserWorkspace(userId: number, email: string) {
  const existingTeamMember = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
  });

  if (existingTeamMember) {
    return existingTeamMember.teamId;
  }

  const createdTeam = await db.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: `${email}'s Team`,
      },
    });

    await tx.teamMember.create({
      data: {
        userId,
        teamId: team.id,
        role: "OWNER",
      },
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
