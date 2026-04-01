import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth/auth-config";
import type { UserSession } from "../types/admin-users.types";

function normalizeUserSessions(value: unknown): UserSession[] {
  if (Array.isArray(value)) {
    return value as UserSession[];
  }

  if (
    value &&
    typeof value === "object" &&
    "sessions" in value &&
    Array.isArray((value as { sessions?: unknown }).sessions)
  ) {
    return (value as { sessions: UserSession[] }).sessions;
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
    sessions: normalizeUserSessions(sessionsResult),
  };
}
