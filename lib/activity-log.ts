import type { ActivityType } from "@prisma/client";
import { db } from "@/lib/db/prisma";

type ActivityLogClient = Pick<typeof db, "activityLog">;

type CreateActivityLogInput = {
  client?: ActivityLogClient;
  teamId?: number | null;
  userId: number;
  action: ActivityType;
  ipAddress?: string;
};

export async function createActivityLog({
  client = db,
  teamId,
  userId,
  action,
  ipAddress = "",
}: CreateActivityLogInput) {
  return client.activityLog.create({
    data: {
      teamId: teamId ?? null,
      userId,
      action,
      ipAddress,
    },
  });
}
