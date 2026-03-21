import { headers } from "next/headers";
import type { User } from "@prisma/client";
import { auth } from "@/shared/lib/auth";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";

type ResendInvitationParams = {
  invitationId: string;
  user: Pick<User, "id" | "name" | "email">;
};

export async function resendInvitation({
  invitationId,
  user,
}: ResendInvitationParams) {
  const guard = await requireOrganizationRole(user.id, ["owner"]);

  if (isOrganizationRoleError(guard)) {
    return guard;
  }

  const reqHeaders = await headers();

  const invitations = await auth.api.listInvitations({
    query: { organizationId: guard.organizationId },
    headers: reqHeaders,
  });

  const invitation = (invitations ?? []).find(
    (inv: { id: string; status: string }) =>
      inv.id === invitationId && inv.status === "pending",
  );

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  try {
    // Cancel the old invitation and create a new one.
    // The plugin's sendInvitationEmail callback fires automatically on creation.
    await auth.api.cancelInvitation({
      headers: reqHeaders,
      body: { invitationId },
    });

    await auth.api.createInvitation({
      headers: reqHeaders,
      body: {
        organizationId: guard.organizationId,
        email: invitation.email,
        role: (invitation.role as "admin" | "member") ?? "member",
      },
    });
  } catch {
    return { error: "Failed to resend invitation" };
  }

  return { success: "Invitation resent" };
}
