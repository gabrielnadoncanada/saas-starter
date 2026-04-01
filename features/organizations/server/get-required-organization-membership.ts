import {
  type ActiveOrganizationMembership,
  getActiveOrganizationMembership,
} from "@/features/organizations/server/organization-membership";
import { hasAnyOrgRole, type OrgRole } from "@/shared/lib/db/enums";

export class OrganizationMembershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationMembershipError";
  }
}

export async function getRequiredOrganizationMembership(
  userId: string,
  allowedRoles: OrgRole[],
): Promise<ActiveOrganizationMembership> {
  const membership = await getActiveOrganizationMembership(userId);

  if (!membership?.organizationId) {
    throw new OrganizationMembershipError(
      "User is not part of an organization",
    );
  }

  if (!hasAnyOrgRole(membership.roles, allowedRoles)) {
    throw new OrganizationMembershipError(
      "You do not have permission to perform this action",
    );
  }

  return membership;
}
