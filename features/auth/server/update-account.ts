import { ActivityType } from "@prisma/client";
import { createActivityLog } from "@/shared/lib/activity-log";
import { db } from "@/shared/lib/db/prisma";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

type UpdateAccountParams = {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string | null;
};

export async function updateAccount({
  userId,
  name,
  email,
  phoneNumber,
}: UpdateAccountParams) {
  const userWithTeam = await getUserTeamMembership(userId);

  await Promise.all([
    db.user.update({
      where: { id: userId },
      data: { name, email, phoneNumber },
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

  return {
    name,
    phoneNumber: phoneNumber ?? "",
    success: "Account updated successfully.",
  };
}
