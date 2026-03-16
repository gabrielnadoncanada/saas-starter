import type { User } from "@prisma/client";
import { db } from "@/shared/lib/db/prisma";
import { sendTeamInvitationEmail } from "@/shared/lib/email/senders";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";

type ResendInvitationParams = {
  invitationId: number;
  user: Pick<User, "id" | "name" | "email">;
};

export async function resendInvitation({
  invitationId,
  user,
}: ResendInvitationParams) {
  const guard = await requireTeamRole(user.id, ["OWNER"]);

  if (isTeamRoleError(guard)) {
    return guard;
  }

  const invitation = await db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: guard.teamId,
      status: "PENDING",
    },
    include: { team: { select: { name: true } } },
  });

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  try {
    await sendTeamInvitationEmail({
      email: invitation.email,
      role: invitation.role,
      inviterName: user.name || user.email,
      teamName: invitation.team.name,
      invitationId: invitation.id,
    });
  } catch {
    return { error: "Failed to send email" };
  }

  return { success: "Invitation email resent" };
}
