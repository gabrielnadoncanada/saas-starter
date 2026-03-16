"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { createActivityLog } from "@/shared/lib/activity-log";
import { ActivityType } from "@/shared/lib/db/enums";
import { db } from "@/shared/lib/db/prisma";
import { removeTeamMemberSchema } from "@/features/teams/schemas/team.schema";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";

export const removeTeamMemberAction = validatedActionWithUser<
  typeof removeTeamMemberSchema,
  { refreshKey?: number }
>(
  removeTeamMemberSchema,
  async ({ memberId }, _, user) => {
    const guard = await requireTeamRole(user.id, ["OWNER"]);

    if (isTeamRoleError(guard)) {
      return guard;
    }

    await db.teamMember.deleteMany({
      where: {
        id: memberId,
        teamId: guard.teamId,
      },
    });

    await createActivityLog({
      teamId: guard.teamId,
      userId: user.id,
      action: ActivityType.REMOVE_TEAM_MEMBER,
    });

    return {
      success: "Team member removed successfully",
      refreshKey: Date.now(),
    };
  },
);
