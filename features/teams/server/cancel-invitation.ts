import { db } from "@/shared/lib/db/prisma";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";

type CancelInvitationParams = {
  invitationId: number;
  userId: number;
};

export async function cancelInvitation({
  invitationId,
  userId,
}: CancelInvitationParams) {
  const guard = await requireTeamRole(userId, ["OWNER"]);

  if (isTeamRoleError(guard)) {
    return guard;
  }

  const invitation = await db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: guard.teamId,
      status: "PENDING",
    },
  });

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  await db.invitation.update({
    where: { id: invitationId },
    data: { status: "CANCELED" },
  });

  return { success: "Invitation canceled" };
}
