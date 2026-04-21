import { headers } from "next/headers";

import type { OrganizationInvitationView } from "@/features/organizations/types";
import { auth } from "@/lib/auth/auth-config";
import type { OrganizationInvitationRow } from "@/lib/auth/better-auth-inferred-types";
import { toIsoString } from "@/lib/date/to-iso-string";
import {
  getPrimaryOrgRole,
  isInvitationPending,
  parseOrgRoles,
} from "@/lib/db/enums";

function isPendingInvitation(invitation: OrganizationInvitationRow) {
  return isInvitationPending(invitation.status);
}

function mapPendingInvitation(
  invitation: OrganizationInvitationRow,
): OrganizationInvitationView {
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
): Promise<OrganizationInvitationView[]> {
  const requestHeaders = await headers();

  const invitations = await auth.api.listInvitations({
    query: { organizationId },
    headers: requestHeaders,
  });

  return (invitations ?? [])
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
    (item) =>
      item.id === input.invitationId && isInvitationPending(item.status),
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
