import { ActivityType } from "@prisma/client";
import type { TeamRole, User } from "@prisma/client";
import { db } from "@/shared/lib/db/prisma";
import { sendTeamInvitationEmail } from "@/shared/lib/email/senders";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

export type InviteTeamMemberInput = {
  teamId: number;
  teamName: string;
  inviter: Pick<User, "id" | "email" | "name">;
  email: string;
  role: TeamRole;
};

type InviteTeamMemberResult = { error: string } | { success: string };

async function ensureNoExistingMembership(
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult | null> {
  const existingMember = await db.teamMember.findFirst({
    where: {
      teamId: input.teamId,
      user: {
        email: input.email,
      },
    },
  });

  if (existingMember) {
    return { error: "User is already a member of this team" };
  }

  return null;
}

async function ensureNoPendingInvitation(
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult | null> {
  const existingInvitation = await db.invitation.findFirst({
    where: {
      email: input.email,
      teamId: input.teamId,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    return { error: "An invitation has already been sent to this email" };
  }

  return null;
}

async function createInvitationRecord(input: InviteTeamMemberInput) {
  return db.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        teamId: input.teamId,
        email: input.email,
        role: input.role,
        invitedBy: input.inviter.id,
        status: "PENDING",
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

    return invitation;
  });
}

async function sendInvitationEmail(
  input: InviteTeamMemberInput,
  invitationId: number,
): Promise<InviteTeamMemberResult> {
  try {
    await sendTeamInvitationEmail({
      email: input.email,
      role: input.role,
      inviterName: input.inviter.name || input.inviter.email,
      teamName: input.teamName,
      invitationId,
    });
  } catch (error) {
    console.error("[team:invitation.email-failed]", {
      email: input.email,
      invitationId,
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
  const membershipError = await ensureNoExistingMembership(input);

  if (membershipError) {
    return membershipError;
  }

  const invitationError = await ensureNoPendingInvitation(input);

  if (invitationError) {
    return invitationError;
  }

  const invitation = await createInvitationRecord(input);

  return sendInvitationEmail(input, invitation.id);
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
