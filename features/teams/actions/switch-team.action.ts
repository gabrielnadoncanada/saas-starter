"use server";

import { setActiveTeamId } from "@/features/teams/server/active-team";
import { listTeamsForUser } from "@/features/teams/server/team-membership";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

interface SwitchTeamInput {
  teamId: number;
}

export async function switchTeamAction({ teamId }: SwitchTeamInput) {
  if (!Number.isInteger(teamId) || teamId <= 0) {
    return { ok: false, error: "Invalid team id" };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "User is not authenticated" };
  }

  const teams = await listTeamsForUser(user.id);

  if (!teams.some((team) => team.id === teamId)) {
    return { ok: false, error: "Team not found" };
  }

  await setActiveTeamId(teamId);

  return { ok: true };
}
