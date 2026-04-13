import "server-only";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import type {
  ListUserSessionsResult,
  ListUsersQueryInput,
} from "@/shared/lib/auth/better-auth-inferred-types";

export async function listAdminUsers(query: Partial<ListUsersQueryInput>) {
  return auth.api.listUsers({
    query: {
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      ...(query.searchValue
        ? {
            searchValue: query.searchValue,
            searchField: query.searchField ?? "email",
            searchOperator: query.searchOperator ?? "contains",
          }
        : {}),
      sortBy: query.sortBy ?? "createdAt",
      sortDirection: query.sortDirection ?? "desc",
    },
    headers: await headers(),
  });
}

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
