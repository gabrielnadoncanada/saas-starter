import { ActivityType } from "@prisma/client";
import { createActivityLog } from "@/lib/activity-log";
import { db } from "@/lib/db/prisma";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

type UpdateAccountParams = {
  userId: number;
  name: string;
  email: string;
};

export async function updateAccount({
  userId,
  name,
  email,
}: UpdateAccountParams) {
  const userWithTeam = await getUserTeamMembership(userId);

  await Promise.all([
    db.user.update({
      where: { id: userId },
      data: { name, email },
    }),
    ...(userWithTeam?.teamId
      ? [
          createActivityLog({
            teamId: userWithTeam.teamId,
            userId,
            action: ActivityType.UPDATE_ACCOUNT,
          }),
        ]
      : []),
  ]);

  return { name, success: "Account updated successfully." };
}

