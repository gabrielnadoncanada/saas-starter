import "server-only";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import { db } from "@/shared/lib/db/prisma";

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
