import { ActivityType } from "@prisma/client";
import { createActivityLog } from "@/lib/activity-log";

async function createAuthActivity(
  userId: number,
  action: ActivityType,
  ipAddress = "",
) {
  await createActivityLog({
    userId,
    action,
    ipAddress,
  });
}

export async function logUserSignIn(userId: number, ipAddress = "") {
  await createAuthActivity(userId, ActivityType.SIGN_IN, ipAddress);
}

export async function logLinkedAuthProvider(
  userId: number,
  action: "LINK_AUTH_PROVIDER" | "UNLINK_AUTH_PROVIDER",
  ipAddress = "",
) {
  await createAuthActivity(userId, action, ipAddress);
}
