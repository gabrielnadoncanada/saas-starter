import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth/auth-config";
import {
  getPrimaryOrgRole,
  parseOrgRoles,
  type OrgRole,
} from "@/shared/lib/db/enums";

export type ActiveOrganizationMembership = {
  organizationId: string;
  roles: OrgRole[];
  primaryRole: OrgRole;
};

export async function getActiveOrganizationMembership(
  _userId: string,
): Promise<ActiveOrganizationMembership | null> {
  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!member) {
    return null;
  }

  const roles = parseOrgRoles(member.role);

  if (roles.length === 0) {
    return null;
  }

  return {
    organizationId: member.organizationId,
    roles,
    primaryRole: getPrimaryOrgRole(roles),
  };
}
