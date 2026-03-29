"use server";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { listAdminOrganizations } from "@/features/organizations/server/list-admin-organizations";
import type { ListAdminOrganizationsQuery } from "@/features/organizations/types/admin-organizations.types";

export async function listOrganizationsAction(
  query: ListAdminOrganizationsQuery,
) {
  await requireAdminAction();
  return listAdminOrganizations(query);
}
