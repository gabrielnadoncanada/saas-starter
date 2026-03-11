import type { ActivityType } from "@prisma/client";
import { createActivityLog } from "@/lib/activity-log";
import { getUserTeamId } from "@/lib/auth/queries";

export async function createAuthActivityForUser(
  userId: number,
  action: ActivityType,
  ipAddress = "",
) {
  const teamId = await getUserTeamId(userId);

  if (!teamId) {
    return;
  }

  await createActivityLog({
    teamId,
    userId,
    action,
    ipAddress,
  });
}
