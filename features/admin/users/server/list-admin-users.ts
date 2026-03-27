import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import type { ListAdminUsersQuery } from "../users.types";

export async function listAdminUsers(query: ListAdminUsersQuery) {
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
