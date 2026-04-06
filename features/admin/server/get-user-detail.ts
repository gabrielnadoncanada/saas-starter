import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import type { ListUserSessionsResult } from "@/shared/lib/auth/better-auth-inferred-types";

function sessionsFromListResult(
  value: ListUserSessionsResult,
): ListUserSessionsResult["sessions"] {
  if (value && typeof value === "object" && "sessions" in value) {
    const { sessions } = value;
    return Array.isArray(sessions) ? sessions : [];
  }

  return [];
}

export async function getAdminUserDetail(userId: string) {
  const requestHeaders = await headers();

  const [user, sessionsResult] = await Promise.all([
    auth.api.getUser({
      query: { id: userId },
      headers: requestHeaders,
    }),
    auth.api.listUserSessions({
      body: { userId },
      headers: requestHeaders,
    }),
  ]);

  return {
    user,
    sessions: sessionsFromListResult(sessionsResult),
  };
}
