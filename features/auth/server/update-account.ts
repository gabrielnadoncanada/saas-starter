import { ActivityType } from "@/lib/db/types";
import { db } from "@/lib/db/prisma";
import { logAuthActivity } from "@/features/auth/server/auth-activity";
import { getUserWithTeam } from "@/features/auth/server/current-user";

type UpdateAccountParams = {
  userId: number;
  name: string;
  email: string;
};

type UpdateAccountDeps = {
  getUserWithTeam: (userId: number) => Promise<{ teamId: number | null } | null>;
  logAuthActivity: (
    teamId: number | null | undefined,
    userId: number,
    action: ActivityType,
  ) => Promise<void>;
  db: { user: Pick<typeof db.user, "update"> };
};

const defaultDeps: UpdateAccountDeps = { getUserWithTeam, logAuthActivity, db };

export async function updateAccount(
  { userId, name, email }: UpdateAccountParams,
  deps = defaultDeps,
) {
  const userWithTeam = await deps.getUserWithTeam(userId);

  await Promise.all([
    deps.db.user.update({
      where: { id: userId },
      data: { name, email },
    }),
    deps.logAuthActivity(
      userWithTeam?.teamId,
      userId,
      ActivityType.UPDATE_ACCOUNT,
    ),
  ]);

  return { name, success: "Account updated successfully." };
}
