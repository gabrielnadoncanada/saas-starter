import type { ActivityType } from "@prisma/client";
import { db } from "@/lib/db/prisma";

type CreateActivityLogInput = {
  teamId: number;
  userId: number;
  action: ActivityType;
  ipAddress?: string;
};

export async function createActivityLog({
  teamId,
  userId,
  action,
  ipAddress = "",
}: CreateActivityLogInput) {
  return db.activityLog.create({
    data: {
      teamId,
      userId,
      action,
      ipAddress,
    },
  });
}
