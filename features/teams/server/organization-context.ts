import "server-only";

import { isOrgRole, type OrgRole } from "@/shared/lib/db/enums";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getCurrentOrganization } from "@/features/teams/server/current-organization";

export type CurrentOrganizationContext = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>;
  currentMember: NonNullable<
    NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>["members"][number]
  >;
  role: OrgRole;
  canInviteMembers: boolean;
  canManageBilling: boolean;
  canManageMembers: boolean;
  canTransferOwnership: boolean;
};

export async function getCurrentOrganizationContext(): Promise<CurrentOrganizationContext | null> {
  const [user, organization] = await Promise.all([
    getCurrentUser(),
    getCurrentOrganization(),
  ]);

  if (!user || !organization) {
    return null;
  }

  const currentMember = organization.members.find(
    (member) => member.user.id === user.id,
  );

  if (!currentMember) {
    return null;
  }

  if (!isOrgRole(currentMember.role)) {
    return null;
  }

  const role: OrgRole = currentMember.role;
  const isOwner = role === "owner";

  return {
    user,
    organization,
    currentMember,
    role,
    canInviteMembers: isOwner,
    canManageBilling: isOwner,
    canManageMembers: isOwner,
    canTransferOwnership: isOwner,
  };
}
