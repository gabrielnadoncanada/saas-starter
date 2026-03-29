import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";

type ResendOrganizationInvitationParams = {
  invitationId: string;
  organizationId: string;
};

export async function resendOrganizationInvitation({
  invitationId,
  organizationId,
}: ResendOrganizationInvitationParams) {
  const reqHeaders = await headers();

  const invitations = await auth.api.listInvitations({
    query: { organizationId },
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
    await auth.api.cancelInvitation({
      headers: reqHeaders,
      body: { invitationId },
    });

    await auth.api.createInvitation({
      headers: reqHeaders,
      body: {
        organizationId,
        email: invitation.email,
        role: (invitation.role as "admin" | "member") ?? "member",
      },
    });
  } catch {
    return { error: "Failed to resend invitation" };
  }

  return { success: "Invitation resent" };
}
