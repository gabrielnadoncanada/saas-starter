import type { OrgRole } from "@/shared/lib/db/enums";
import {
  getActiveOrganizationMembership,
  type ActiveOrganizationMembership,
} from "@/features/teams/shared/server/organization-membership";

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
    throw new OrganizationMembershipError("User is not part of an organization");
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new OrganizationMembershipError(
      "You do not have permission to perform this action",
    );
  }

  return membership;
}
