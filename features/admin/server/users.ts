import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth-config";
import type {
  ListUserSessionsResult,
  ListUsersQueryInput,
} from "@/lib/auth/better-auth-inferred-types";
import { db } from "@/lib/db/prisma";

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

export async function getAdminOverviewStats() {
  const requestHeaders = await headers();

  const [allUsers, bannedUsers, totalOrganizations] = await Promise.all([
    auth.api.listUsers({
      query: { limit: 1, offset: 0 },
      headers: requestHeaders,
    }),
    auth.api.listUsers({
      query: {
        limit: 1,
        offset: 0,
        filterField: "banned",
        filterValue: "true",
        filterOperator: "eq",
      },
      headers: requestHeaders,
    }),
    db.organization.count(),
  ]);

  return {
    totalUsers: allUsers.total,
    activeUsers: allUsers.total - bannedUsers.total,
    bannedUsers: bannedUsers.total,
    totalOrganizations,
  };
}
