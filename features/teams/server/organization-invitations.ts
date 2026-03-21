import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { toOrgRole, type OrgRole } from "@/shared/lib/db/enums";

export type PendingOrganizationInvitation = {
  id: string;
  email: string;
  role: OrgRole;
  invitedAt: string;
};

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

  return (invitations ?? [])
    .filter(
      (inv: { status: string }) => inv.status === "pending",
    )
    .map(
      (inv: {
        id: string;
        email: string;
        role?: string | null;
        createdAt: Date | string;
      }) => ({
        id: inv.id,
        email: inv.email,
        role: toOrgRole(inv.role),
        invitedAt:
          typeof inv.createdAt === "string"
            ? inv.createdAt
            : inv.createdAt.toISOString(),
      }),
    );
}

export async function cancelOrganizationInvitation(input: {
  invitationId: string;
}) {
  await auth.api.cancelInvitation({
    headers: await headers(),
    body: { invitationId: input.invitationId },
  });
}
