import { getActiveTeamId } from "@/features/teams/server/active-team";
import { db } from "@/shared/lib/db/prisma";

type TeamMembership = {
  teamId: number;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

function pickTeamMembership(
  memberships: TeamMembership[],
  activeTeamId: number | null,
) {
  return (
    memberships.find((membership) => membership.teamId === activeTeamId) ??
    memberships[0] ??
    null
  );
}

export async function listTeamsForUser(userId: number) {
  const memberships = await db.teamMember.findMany({
    where: { userId },
    orderBy: { joinedAt: "asc" },
    select: {
      role: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.team.id,
    name: membership.team.name,
    role: membership.role,
  }));
}

export async function getUserTeamMembership(userId: number) {
  const [user, memberships, activeTeamId] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
    }),
    db.teamMember.findMany({
      where: { userId },
      orderBy: { joinedAt: "asc" },
      select: { teamId: true, role: true },
    }),
    getActiveTeamId(),
  ]);

  if (!user) {
    return null;
  }

  const membership = pickTeamMembership(memberships, activeTeamId);

  return {
    user,
    teamId: membership?.teamId ?? null,
    teamRole: membership?.role ?? null,
  };
}
