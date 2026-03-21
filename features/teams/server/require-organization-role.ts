import type { OrgRole } from "@/shared/lib/db/enums";
import { getActiveOrganizationMembership } from "@/features/teams/server/organization-membership";

type OrganizationRoleSuccess = {
  organizationId: string;
  role: OrgRole;
};

type OrganizationRoleError = {
  error: string;
};

type RequireOrganizationRoleResult = OrganizationRoleSuccess | OrganizationRoleError;

export function isOrganizationRoleError(
  result: RequireOrganizationRoleResult,
): result is OrganizationRoleError {
  return "error" in result;
}

export async function requireOrganizationRole(
  userId: string,
  allowedRoles: OrgRole[],
): Promise<RequireOrganizationRoleResult> {
  const membership = await getActiveOrganizationMembership(userId);

  if (!membership?.organizationId) {
    return { error: "User is not part of an organization" };
  }

  if (!allowedRoles.includes(membership.role)) {
    return { error: "You do not have permission to perform this action" };
  }

  return {
    organizationId: membership.organizationId,
    role: membership.role,
  };
}
