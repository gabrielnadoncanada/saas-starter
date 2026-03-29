"use server";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { getAdminOrganizationDetail } from "@/features/organizations/server/get-admin-organization-detail";

export async function getOrganizationDetailAction(organizationId: string) {
  await requireAdminAction();
  return getAdminOrganizationDetail(organizationId);
}
