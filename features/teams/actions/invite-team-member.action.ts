"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { db } from "@/shared/lib/db/prisma";
import { inviteTeamMemberSchema } from "@/features/teams/schemas/team.schema";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";
import { inviteTeamMemberToTeam } from "@/features/teams/server/team-invitations";
import { getTeamPlan, assertCapability, assertLimit } from "@/features/billing/guards";
import { UpgradeRequiredError, LimitReachedError } from "@/features/billing/errors";

export const inviteTeamMemberAction = validatedActionWithUser<
  typeof inviteTeamMemberSchema,
  { refreshKey?: number }
>(
  inviteTeamMemberSchema,
  async ({ email, role }, _, user) => {
    const guard = await requireTeamRole(user.id, ["OWNER"]);

    if (isTeamRoleError(guard)) {
      return guard;
    }

    const team = await db.team.findUnique({
      where: { id: guard.teamId },
      select: { name: true, _count: { select: { teamMembers: true } } },
    });

    if (!team) {
      return { error: "Team not found" };
    }

    const teamPlan = await getTeamPlan();

    if (!teamPlan) {
      return { error: "Unable to determine team plan" };
    }

    try {
      assertCapability(teamPlan.planId, "team.invite");
      assertLimit(teamPlan.planId, "teamMembers", team._count.teamMembers);
    } catch (error) {
      if (error instanceof UpgradeRequiredError || error instanceof LimitReachedError) {
        return { error: error.message };
      }
      throw error;
    }

    const result = await inviteTeamMemberToTeam({
      teamId: guard.teamId,
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
