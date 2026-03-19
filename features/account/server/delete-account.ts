import { ActivityType } from "@/shared/lib/db/enums";

import { syncSeatQuantity } from "@/features/billing/server/sync-seat-quantity";
import { createActivityLog } from "@/shared/lib/activity-log";
import { db } from "@/shared/lib/db/prisma";
import { getAccountDeletionBlocker } from "@/features/teams/server/account-deletion-policy";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

export type DeleteAccountUser = {
  id: string;
  email: string;
};

export async function deleteAccount(user: DeleteAccountUser) {
  const membership = await getUserTeamMembership(user.id);

  const blocker = await getAccountDeletionBlocker(user.id);

  if (blocker) {
    return { error: blocker };
  }

  // Get ALL memberships before transaction for seat sync after
  const allMemberships = await db.teamMember.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  });

  await db.$transaction(async (tx) => {
    await createActivityLog({
      client: tx,
      teamId: membership?.teamId,
      userId: user.id,
      action: ActivityType.DELETE_ACCOUNT,
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        email: `${user.email}-${user.id}-deleted`,
        image: null,
      },
    });

    await tx.account.deleteMany({
      where: { userId: user.id },
    });

    await tx.session.deleteMany({
      where: { userId: user.id },
    });

    // Delete ALL memberships, not just the active team
    await tx.teamMember.deleteMany({
      where: { userId: user.id },
    });

    // Cancel all pending invitations sent by this user
    await tx.invitation.updateMany({
      where: {
        invitedBy: user.id,
        status: "PENDING",
      },
      data: { status: "CANCELED" },
    });
  });

  // Sync seat quantity for ALL affected teams
  for (const m of allMemberships) {
    await syncSeatQuantity(m.teamId);
  }

  return { success: "Account deleted successfully." };
}
