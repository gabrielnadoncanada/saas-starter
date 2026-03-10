import { ActivityType } from "@/lib/db/types";
import { db } from "@/lib/db/prisma";
import { ensureUserWorkspace } from "@/features/auth/server/onboarding";

type CompletePostSignInParams = {
  userId: number;
  email: string;
  inviteId?: string | null;
};

type CompletePostSignInDeps = {
  db: Pick<typeof db, "invitation" | "$transaction">;
  ensureUserWorkspace: (userId: number, email: string) => Promise<number>;
};

const defaultDeps: CompletePostSignInDeps = { db, ensureUserWorkspace };

export async function completePostSignIn(
  { userId, email, inviteId }: CompletePostSignInParams,
  deps = defaultDeps,
) {
  if (!inviteId) {
    return deps.ensureUserWorkspace(userId, email);
  }

  const invitationId = Number(inviteId);

  if (!Number.isInteger(invitationId) || invitationId <= 0) {
    return deps.ensureUserWorkspace(userId, email);
  }

  const invitation = await deps.db.invitation.findFirst({
    where: {
      id: invitationId,
      email,
      status: "pending",
    },
  });

  if (!invitation) {
    return deps.ensureUserWorkspace(userId, email);
  }

  await deps.db.$transaction(async (tx) => {
    const existingMembership = await tx.teamMember.findFirst({
      where: {
        userId,
        teamId: invitation.teamId,
      },
    });

    if (!existingMembership) {
      await tx.teamMember.create({
        data: {
          userId,
          teamId: invitation.teamId,
          role: invitation.role,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: invitation.role },
      });
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    await tx.activityLog.create({
      data: {
        teamId: invitation.teamId,
        userId,
        action: ActivityType.ACCEPT_INVITATION,
        ipAddress: "",
      },
    });
  });

  return invitation.teamId;
}
