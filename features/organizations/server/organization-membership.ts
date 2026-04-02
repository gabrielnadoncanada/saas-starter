import "server-only";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getAuthSession } from "@/shared/lib/auth/get-session";
import {
  getPrimaryOrgRole,
  hasAnyOrgRole,
  type OrgRole,
  parseOrgRoles,
} from "@/shared/lib/db/enums";

export type ActiveOrganizationMembership = {
  organizationId: string;
  roles: OrgRole[];
  primaryRole: OrgRole;
};

export class OrganizationMembershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationMembershipError";
  }
}

// Layouts call this when they only need an active organization id.
// Actions and server queries should use the membership helpers below instead.
export async function ensureActiveOrganization(): Promise<string | null> {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  if (session.session.activeOrganizationId) {
    return session.session.activeOrganizationId;
  }

  const reqHeaders = await headers();
  const organizations = await auth.api.listOrganizations({
    headers: reqHeaders,
  });
  const organizationId = organizations?.[0]?.id ?? null;

  if (!organizationId) {
    return null;
  }

  await auth.api.setActiveOrganization({
    headers: reqHeaders,
    body: { organizationId },
  });

  return organizationId;
}

export async function getActiveOrganizationMembership(): Promise<ActiveOrganizationMembership | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

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

export async function requireActiveOrganizationMembership() {
  const membership = await getActiveOrganizationMembership();

  if (!membership?.organizationId) {
    throw new OrganizationMembershipError(
      "User is not part of an organization",
    );
  }

  return membership;
}

export async function requireActiveOrganizationRole(allowedRoles: OrgRole[]) {
  const membership = await requireActiveOrganizationMembership();

  if (!hasAnyOrgRole(membership.roles, allowedRoles)) {
    throw new OrganizationMembershipError(
      "You do not have permission to perform this action",
    );
  }

  return membership;
}
