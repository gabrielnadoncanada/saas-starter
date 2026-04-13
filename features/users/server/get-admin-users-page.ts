import "server-only";

import type { AdminUsersTableSearchParams } from "@/features/users/admin-users-table-search-params";
import { listAdminUsers } from "@/features/users/server/admin-users";

export async function getAdminUsersPage(params: AdminUsersTableSearchParams) {
  const offset = (params.page - 1) * params.pageSize;

  const result = await listAdminUsers({
    limit: params.pageSize,
    offset,
    sortBy: params.sort,
    sortDirection: params.order,
    ...(params.q
      ? {
          searchField: "email" as const,
          searchOperator: "contains" as const,
          searchValue: params.q,
        }
      : {}),
  });

  return {
    rows: result.users,
    rowCount: result.total,
    pageCount: Math.max(1, Math.ceil(result.total / params.pageSize)),
  };
}
