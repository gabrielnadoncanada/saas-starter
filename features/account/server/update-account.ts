import { ActivityType, Prisma } from "@prisma/client";

import { createActivityLog } from "@/shared/lib/activity-log";
import { db } from "@/shared/lib/db/prisma";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";
import type { UpdateAccountActionState } from "@/features/account/types/account.types";

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
}: UpdateAccountParams): Promise<UpdateAccountActionState> {
  const userWithTeam = await getUserTeamMembership(userId);

  try {
    await db.user.update({
      where: { id: userId },
      data: { name, email, phoneNumber },
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
        email,
        phoneNumber,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "Please fix the highlighted fields.",
        values: {
          name,
          email,
          phoneNumber,
        },
        fieldErrors: {
          email: ["This email is already in use."],
        },
      };
    }

    throw error;
  }
}
