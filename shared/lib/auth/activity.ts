import { ActivityType } from "@/shared/lib/db/enums";
import { createActivityLog } from "@/shared/lib/activity-log";

async function createAuthActivity(
  userId: string,
  action: ActivityType,
  ipAddress = "",
) {
  await createActivityLog({
    userId,
    action,
    ipAddress,
  });
}

export async function logUserSignIn(userId: string, ipAddress = "") {
  await createAuthActivity(userId, ActivityType.SIGN_IN, ipAddress);
}

export async function logLinkedAuthProvider(
  userId: string,
  action: "LINK_AUTH_PROVIDER" | "UNLINK_AUTH_PROVIDER",
  ipAddress = "",
) {
  await createAuthActivity(userId, action, ipAddress);
}
