"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { db } from "@/shared/lib/db/prisma";
import { inviteTeamMemberSchema } from "@/features/teams/schemas/team.schema";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";
import { inviteTeamMemberToTeam } from "@/features/teams/server/team-invitations";

export const inviteTeamMemberAction = validatedActionWithUser<
  typeof inviteTeamMemberSchema,
  { refreshKey?: number }
>(
  inviteTeamMemberSchema,
  async ({ email, role }, _, user) => {
    const userWithTeam = await getUserTeamMembership(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    if (userWithTeam.teamRole !== "OWNER") {
      return { error: "Only team owners can invite members" };
    }

    const team = await db.team.findUnique({
      where: { id: userWithTeam.teamId },
      select: { name: true },
    });

    if (!team) {
      return { error: "Team not found" };
    }

    const result = await inviteTeamMemberToTeam({
      teamId: userWithTeam.teamId,
      teamName: team.name,
      inviter: user,
      email,
      role,
    });

    if ("error" in result) {
      return result;
    }

    return { ...result, refreshKey: Date.now() };
  },
);
