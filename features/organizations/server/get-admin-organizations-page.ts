import "server-only";

import type { AdminOrganizationsTableSearchParams } from "@/features/organizations/admin-organizations-table-search-params";
import { listAdminOrganizations } from "@/features/organizations/server/admin-organizations";

export async function getAdminOrganizationsPage(
  params: AdminOrganizationsTableSearchParams,
) {
  const offset = (params.page - 1) * params.pageSize;

  const result = await listAdminOrganizations({
    limit: params.pageSize,
    offset,
    sortBy: params.sort,
    sortDirection: params.order,
    search: params.q,
  });

  return {
    rows: result.organizations,
    rowCount: result.total,
    pageCount: Math.max(1, Math.ceil(result.total / params.pageSize)),
  };
}
