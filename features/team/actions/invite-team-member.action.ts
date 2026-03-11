"use server";

import { validatedActionWithUser } from "@/lib/auth/validated-action-with-user";
import { db } from "@/lib/db/prisma";
import { inviteTeamMemberSchema } from "@/features/team/schemas/team.schema";
import { getUserTeamMembership } from "@/features/team/server/team-membership";
import { inviteTeamMemberToTeam } from "@/features/team/server/team-invitations";

export const inviteTeamMemberAction = validatedActionWithUser(
  inviteTeamMemberSchema,
  async ({ email, role }, _, user) => {
    const userWithTeam = await getUserTeamMembership(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    if (userWithTeam.teamRole !== 'OWNER') {
      return { error: "Only team owners can invite members" };
    }

    const team = await db.team.findUnique({
      where: { id: userWithTeam.teamId },
      select: { name: true },
    });

    if (!team) {
      return { error: "Team not found" };
    }

    return inviteTeamMemberToTeam({
      teamId: userWithTeam.teamId,
      teamName: team.name,
      inviter: user,
      email,
      role,
    });
  },
);
