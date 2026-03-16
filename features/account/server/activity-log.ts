import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { db } from "@/shared/lib/db/prisma";

export async function getActivityLogs() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const logs = await db.activityLog.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
    userName: log.user?.name ?? null,
  }));
}
