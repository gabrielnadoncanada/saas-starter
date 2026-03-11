import { ActivityType } from "@/lib/db/types";
import { db } from "@/lib/db/prisma";
import { logAuthActivity } from "@/features/auth/server/auth-activity";
import { getUserWithTeam } from "@/features/auth/server/current-user";

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
  const userWithTeam = await getUserWithTeam(userId);

  await Promise.all([
    db.user.update({
      where: { id: userId },
      data: { name, email },
    }),
    logAuthActivity(
      userWithTeam?.teamId,
      userId,
      ActivityType.UPDATE_ACCOUNT,
    ),
  ]);

  return { name, success: "Account updated successfully." };
}
