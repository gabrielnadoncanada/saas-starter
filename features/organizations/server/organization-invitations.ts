import { headers } from "next/headers";

import type { OrganizationInvitationView } from "@/features/organizations/types";
import { auth } from "@/shared/lib/auth/auth-config";
import { getPrimaryOrgRole, parseOrgRoles } from "@/shared/lib/db/enums";

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
    roles: parseOrgRoles(invitation.role),
    primaryRole: getPrimaryOrgRole(invitation.role),
    invitedAt: toIsoString(invitation.createdAt) ?? new Date(0).toISOString(),
    expiresAt: toIsoString(invitation.expiresAt),
  };
}

export async function inviteOrganizationMember(input: {
  organizationId: string;
  email: string;
  role: "admin" | "member";
}) {
  return auth.api.createInvitation({
    headers: await headers(),
    body: {
      organizationId: input.organizationId,
      email: input.email,
      role: input.role,
    },
  });
}

export async function listPendingOrganizationInvitations(
  organizationId: string,
): Promise<PendingOrganizationInvitation[]> {
  const requestHeaders = await headers();

  const invitations = await auth.api.listInvitations({
    query: { organizationId },
    headers: requestHeaders,
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

export async function resendOrganizationInvitation(input: {
  invitationId: string;
  organizationId: string;
}) {
  const requestHeaders = await headers();
  const invitations = await auth.api.listInvitations({
    query: { organizationId: input.organizationId },
    headers: requestHeaders,
  });
  const invitation = (invitations ?? []).find(
    (item: { id: string; status: string }) =>
      item.id === input.invitationId && item.status === "pending",
  );

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  try {
    await auth.api.cancelInvitation({
      headers: requestHeaders,
      body: { invitationId: input.invitationId },
    });

    await auth.api.createInvitation({
      headers: requestHeaders,
      body: {
        organizationId: input.organizationId,
        email: invitation.email,
        role: (invitation.role as "admin" | "member") ?? "member",
      },
    });
  } catch {
    return { error: "Failed to resend invitation" };
  }

  return { success: "Invitation resent" };
}
