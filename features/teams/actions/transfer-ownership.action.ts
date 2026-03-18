"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { createActivityLog } from "@/shared/lib/activity-log";
import { ActivityType } from "@/shared/lib/db/enums";
import { db } from "@/shared/lib/db/prisma";
import { z } from "zod";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";

const transferOwnershipSchema = z.object({
  newOwnerMemberId: z.coerce.number(),
});

export const transferOwnershipAction = validatedActionWithUser<
  typeof transferOwnershipSchema,
  { refreshKey?: number }
>(
  transferOwnershipSchema,
  async ({ newOwnerMemberId }, _, user) => {
    const guard = await requireTeamRole(user.id, ["OWNER"]);

    if (isTeamRoleError(guard)) {
      return guard;
    }

    const targetMember = await db.teamMember.findFirst({
      where: {
        id: newOwnerMemberId,
        teamId: guard.teamId,
      },
      select: { id: true, userId: true, role: true },
    });

    if (!targetMember) {
      return { error: "Team member not found." };
    }

    if (targetMember.role === "OWNER") {
      return { error: "This member is already an owner." };
    }

    // Find the current user's membership to demote
    const currentMember = await db.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId: guard.teamId,
      },
      select: { id: true },
    });

    if (!currentMember) {
      return { error: "Your membership was not found." };
    }

    await db.$transaction(async (tx) => {
      // Promote target to OWNER
      await tx.teamMember.update({
        where: { id: targetMember.id },
        data: { role: "OWNER" },
      });

      // Demote current owner to ADMIN
      await tx.teamMember.update({
        where: { id: currentMember.id },
        data: { role: "ADMIN" },
      });
    });

    await createActivityLog({
      teamId: guard.teamId,
      userId: user.id,
      action: ActivityType.REMOVE_TEAM_MEMBER, // reuse closest existing type
    });

    return {
      success: "Ownership transferred successfully.",
      refreshKey: Date.now(),
    };
  },
);
