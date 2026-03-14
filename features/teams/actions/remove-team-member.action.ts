"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { createActivityLog } from "@/shared/lib/activity-log";
import { ActivityType } from "@prisma/client";
import { db } from "@/shared/lib/db/prisma";
import { removeTeamMemberSchema } from "@/features/teams/schemas/team.schema";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

export const removeTeamMemberAction = validatedActionWithUser<
  typeof removeTeamMemberSchema,
  { refreshKey?: number }
>(
  removeTeamMemberSchema,
  async ({ memberId }, _, user) => {
    const userWithTeam = await getUserTeamMembership(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    if (userWithTeam.teamRole !== "OWNER") {
      return { error: "Only team owners can remove members" };
    }

    await db.teamMember.deleteMany({
      where: {
        id: memberId,
        teamId: userWithTeam.teamId,
      },
    });

    await createActivityLog({
      teamId: userWithTeam.teamId,
      userId: user.id,
      action: ActivityType.REMOVE_TEAM_MEMBER,
    });

    return {
      success: "Team member removed successfully",
      refreshKey: Date.now(),
    };
  },
);
