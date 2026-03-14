"use server";

import { listTeamsForUser } from "@/features/teams/server/team-membership";
import { getActiveTeamId } from "@/features/teams/server/active-team";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function listTeamsAction() {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "User is not authenticated" };
  }

  const [teams, activeTeamId] = await Promise.all([
    listTeamsForUser(user.id),
    getActiveTeamId(),
  ]);

  const selectedTeamId =
    activeTeamId && teams.some((team) => team.id === activeTeamId)
      ? activeTeamId
      : (teams[0]?.id ?? null);

  return {
    ok: true,
    data: {
      teams,
      activeTeamId: selectedTeamId,
    },
  };
}
