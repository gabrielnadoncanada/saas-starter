import { headers } from "next/headers";
import type { OrganizationInvitationView } from "@/features/teams/types/organization.types";
import { auth } from "@/shared/lib/auth";
import { toOrgRole, type OrgRole } from "@/shared/lib/db/enums";

type RawOrganizationInvitation = {
  id: string;
  email: string;
  role?: string | null;
  status: string;
  createdAt: Date | string;
  expiresAt?: Date | string | null;
};

export type PendingOrganizationInvitation = OrganizationInvitationView;

function toIsoString(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}

function isPendingInvitation(invitation: RawOrganizationInvitation) {
  return invitation.status === "pending";
}

function mapPendingInvitation(
  invitation: RawOrganizationInvitation,
): PendingOrganizationInvitation {
  return {
    id: invitation.id,
    email: invitation.email,
    role: toOrgRole(invitation.role),
    invitedAt: toIsoString(invitation.createdAt) ?? new Date(0).toISOString(),
    expiresAt: toIsoString(invitation.expiresAt),
  };
}

export async function inviteOrganizationMember(input: {
  organizationId: string;
  email: string;
  role: "admin" | "member";
}) {
  const result = await auth.api.createInvitation({
    headers: await headers(),
    body: {
      organizationId: input.organizationId,
      email: input.email,
      role: input.role,
    },
  });

  return result;
}

export async function listPendingOrganizationInvitations(
  organizationId: string,
): Promise<PendingOrganizationInvitation[]> {
  const reqHeaders = await headers();

  const invitations = await auth.api.listInvitations({
    query: { organizationId },
    headers: reqHeaders,
  });

  return ((invitations ?? []) as RawOrganizationInvitation[])
    .filter(isPendingInvitation)
    .map(mapPendingInvitation);
}

export async function cancelOrganizationInvitation(input: {
  invitationId: string;
}) {
  await auth.api.cancelInvitation({
    headers: await headers(),
    body: { invitationId: input.invitationId },
  });
}
