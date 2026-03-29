import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { isOrgRole, type OrgRole } from "@/shared/lib/db/enums";

export type ActiveOrganizationMembership = {
  organizationId: string;
  role: OrgRole;
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

  if (!isOrgRole(member.role)) {
    return null;
  }

  return {
    organizationId: member.organizationId,
    role: member.role,
  };
}
