import { syncSeatQuantity } from "@/features/billing/server/sync-seat-quantity";
import { assertCapability, assertLimit } from "@/features/billing/guards";
import { resolveTeamPlan } from "@/features/billing/plans";
import { ActivityType } from "@/shared/lib/db/enums";
import { db } from "@/shared/lib/db/prisma";
import { ensureUserWorkspace } from "@/features/auth/server/onboarding";

type CompletePostSignInParams = {
  userId: number;
  email: string;
  inviteId?: string | null;
};

export async function completePostSignIn({
  userId,
  email,
  inviteId,
}: CompletePostSignInParams) {
  if (!inviteId) {
    return ensureUserWorkspace(userId, email);
  }

  const invitationId = Number(inviteId);

  if (!Number.isInteger(invitationId) || invitationId <= 0) {
    return ensureUserWorkspace(userId, email);
  }

  const invitation = await db.invitation.findFirst({
    where: {
      id: invitationId,
      email,
      status: "PENDING",
    },
  });

  if (!invitation) {
    return ensureUserWorkspace(userId, email);
  }

  const invitedTeam = await db.team.findUnique({
    where: { id: invitation.teamId },
    select: {
      planId: true,
      planName: true,
      subscriptionStatus: true,
      _count: {
        select: {
          teamMembers: true,
        },
      },
    },
  });

  if (!invitedTeam) {
    throw new Error("Invited team not found.");
  }

  const invitedTeamPlan = resolveTeamPlan(invitedTeam);
  assertCapability(invitedTeamPlan, "team.invite");
  assertLimit(invitedTeamPlan, "teamMembers", invitedTeam._count.teamMembers);

  await db.$transaction(async (tx) => {
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
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
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

  await syncSeatQuantity(invitation.teamId);

  return invitation.teamId;
}
