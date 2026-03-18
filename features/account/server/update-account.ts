import { ActivityType } from "@/shared/lib/db/enums";

import { createActivityLog } from "@/shared/lib/activity-log";
import { db } from "@/shared/lib/db/prisma";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";
import type { UpdateAccountActionState } from "@/features/account/types/account.types";

type UpdateAccountParams = {
  userId: number;
  name: string;
  phoneNumber: string | null;
};

export async function updateAccount({
  userId,
  name,
  phoneNumber,
}: UpdateAccountParams): Promise<UpdateAccountActionState> {
  const userWithTeam = await getUserTeamMembership(userId);

  await db.user.update({
    where: { id: userId },
    data: { name, phoneNumber },
  });

  if (userWithTeam?.teamId) {
    try {
      await createActivityLog({
        teamId: userWithTeam.teamId,
        userId,
        action: ActivityType.UPDATE_ACCOUNT,
      });
    } catch {
      // optional: internal logging
    }
  }

  return {
    success: "Account updated successfully.",
    values: {
      name,
      phoneNumber,
    },
  };
}
