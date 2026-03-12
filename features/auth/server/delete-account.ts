import { ActivityType } from "@prisma/client";

import { createActivityLog } from "@/lib/activity-log";
import { db } from "@/lib/db/prisma";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";
import { getAccountDeletionBlocker } from "@/features/teams/server/account-deletion-policy";

export type DeleteAccountUser = {
  id: number;
  email: string;
};

export async function deleteAccount(user: DeleteAccountUser) {
  const membership = await getUserTeamMembership(user.id);

  const blocker = await getAccountDeletionBlocker(membership);

  if (blocker) {
    return { error: blocker };
  }

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

    await tx.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    if (membership?.teamId) {
      await tx.teamMember.deleteMany({
        where: {
          userId: user.id,
          teamId: membership.teamId,
        },
      });
    }
  });

  return { success: "Account deleted successfully." };
}

