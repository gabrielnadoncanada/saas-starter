"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { inviteTeamMemberSchema } from "@/features/teams/schemas/team.schema";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";
import { inviteTeamMemberToTeam } from "@/features/teams/server/team-invitations";
import { getTeamPlan } from "@/features/billing/guards/get-team-plan";

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

    const teamPlan = await getTeamPlan();
    if (!teamPlan) {
      return { error: "Unable to determine team plan" };
    }

    const result = await inviteTeamMemberToTeam({
      teamId: guard.teamId,
      planId: teamPlan.planId,
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
