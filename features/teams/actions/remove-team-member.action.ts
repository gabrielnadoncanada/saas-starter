"use server";

import { syncSeatQuantity } from "@/features/billing/server/sync-seat-quantity";
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

    // Load the target member to check role and prevent dangerous removals
    const targetMember = await db.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: guard.teamId,
      },
      select: { id: true, userId: true, role: true },
    });

    if (!targetMember) {
      return { error: "Team member not found." };
    }

    // Prevent removing the last member of a team
    const memberCount = await db.teamMember.count({
      where: { teamId: guard.teamId },
    });

    if (memberCount <= 1) {
      return { error: "Cannot remove the last member of a team." };
    }

    // If the target is an OWNER, ensure another OWNER exists
    if (targetMember.role === "OWNER") {
      const otherOwnerCount = await db.teamMember.count({
        where: {
          teamId: guard.teamId,
          role: "OWNER",
          id: { not: targetMember.id },
        },
      });

      if (otherOwnerCount === 0) {
        return {
          error:
            "Cannot remove the sole owner. Transfer ownership to another member first.",
        };
      }
    }

    await db.teamMember.deleteMany({
      where: {
        id: memberId,
        teamId: guard.teamId,
      },
    });

    await syncSeatQuantity(guard.teamId);

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
