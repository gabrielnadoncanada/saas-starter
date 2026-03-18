import type { User } from "@prisma/client";
import { ActivityType, type TeamRole } from "@/shared/lib/db/enums";
import { LimitReachedError, UpgradeRequiredError } from "@/features/billing/errors";
import { assertCapability, assertLimit } from "@/features/billing/guards";
import type { PlanId } from "@/features/billing/plans";
import { db } from "@/shared/lib/db/prisma";
import { sendTeamInvitationEmail } from "@/shared/lib/email/senders";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

export type InviteTeamMemberInput = {
  teamId: number;
  planId: PlanId;
  inviter: Pick<User, "id" | "email" | "name">;
  email: string;
  role: TeamRole;
};

type InviteTeamMemberResult = { error: string } | { success: string };

async function createInvitationRecord(input: InviteTeamMemberInput) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Team" WHERE id = ${input.teamId} FOR UPDATE`;

    const team = await tx.team.findUnique({
      where: { id: input.teamId },
      select: {
        name: true,
        _count: {
          select: {
            teamMembers: true,
          },
        },
      },
    });

    if (!team) {
      return { error: "Team not found" } satisfies InviteTeamMemberResult;
    }

    try {
      assertCapability(input.planId, "team.invite");
      const pendingInvitationCount = await tx.invitation.count({
        where: {
          teamId: input.teamId,
          status: "PENDING",
        },
      });
      assertLimit(
        input.planId,
        "teamMembers",
        team._count.teamMembers + pendingInvitationCount,
      );
    } catch (error) {
      if (error instanceof UpgradeRequiredError || error instanceof LimitReachedError) {
        return { error: error.message } satisfies InviteTeamMemberResult;
      }

      throw error;
    }

    const existingMember = await tx.teamMember.findFirst({
      where: {
        teamId: input.teamId,
        user: {
          email: input.email,
        },
      },
    });

    if (existingMember) {
      return { error: "User is already a member of this team" } satisfies InviteTeamMemberResult;
    }

    const existingInvitation = await tx.invitation.findFirst({
      where: {
        email: input.email,
        teamId: input.teamId,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return {
        error: "An invitation has already been sent to this email",
      } satisfies InviteTeamMemberResult;
    }

    const INVITATION_EXPIRY_DAYS = 7;

    const invitation = await tx.invitation.create({
      data: {
        teamId: input.teamId,
        email: input.email,
        role: input.role,
        invitedBy: input.inviter.id,
        status: "PENDING",
        expiresAt: new Date(
          Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    await tx.activityLog.create({
      data: {
        teamId: input.teamId,
        userId: input.inviter.id,
        action: ActivityType.INVITE_TEAM_MEMBER,
        ipAddress: "",
      },
    });

    return { invitationToken: invitation.token, teamName: team.name };
  });
}

async function sendInvitationEmail(
  input: InviteTeamMemberInput,
  invitationToken: string,
  teamName: string,
): Promise<InviteTeamMemberResult> {
  try {
    await sendTeamInvitationEmail({
      email: input.email,
      role: input.role,
      inviterName: input.inviter.name || input.inviter.email,
      teamName,
      invitationToken,
    });
  } catch (error) {
    console.error("[team:invitation.email-failed]", {
      email: input.email,
      invitationToken,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success:
        "Invitation created successfully. Email delivery could not be confirmed.",
    };
  }

  return { success: "Invitation sent successfully" };
}

export async function inviteTeamMemberToTeam(input: InviteTeamMemberInput) {
  const result = await createInvitationRecord(input);

  if ("error" in result) {
    return result;
  }

  return sendInvitationEmail(input, result.invitationToken, result.teamName);
}

export async function listPendingInvitationsForCurrentTeam() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const membership = await getUserTeamMembership(user.id);

  if (!membership?.teamId) {
    return [];
  }

  const invitations = await db.invitation.findMany({
    where: {
      teamId: membership.teamId,
      status: "PENDING",
    },
    select: {
      id: true,
      email: true,
      role: true,
      invitedAt: true,
    },
    orderBy: { invitedAt: "desc" },
  });

  return invitations.map((invitation) => ({
    ...invitation,
    invitedAt: invitation.invitedAt.toISOString(),
  }));
}
