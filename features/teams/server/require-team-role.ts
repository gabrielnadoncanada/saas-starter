import type { TeamRole } from "@/shared/lib/db/enums";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

type TeamRoleSuccess = {
  teamId: number;
  teamRole: string;
  user: NonNullable<Awaited<ReturnType<typeof getUserTeamMembership>>>["user"];
};

type TeamRoleError = {
  error: string;
};

type RequireTeamRoleResult = TeamRoleSuccess | TeamRoleError;

export function isTeamRoleError(
  result: RequireTeamRoleResult,
): result is TeamRoleError {
  return "error" in result;
}

export async function requireTeamRole(
  userId: string,
  allowedRoles: TeamRole[],
): Promise<RequireTeamRoleResult> {
  const membership = await getUserTeamMembership(userId);

  if (!membership?.teamId) {
    return { error: "User is not part of a team" };
  }

  if (
    !membership.teamRole ||
    !allowedRoles.includes(membership.teamRole as TeamRole)
  ) {
    return { error: "You do not have permission to perform this action" };
  }

  return {
    teamId: membership.teamId,
    teamRole: membership.teamRole,
    user: membership.user,
  };
}
