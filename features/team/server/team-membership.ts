import { db } from "@/lib/db/prisma";

export async function getUserTeamId(userId: number) {
  const membership = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
    orderBy: { joinedAt: "asc" },
  });

  return membership?.teamId ?? null;
}

export async function getUserTeamMembership(userId: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      teamMembers: {
        take: 1,
        select: { teamId: true, role: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    user,
    teamId: user.teamMembers[0]?.teamId ?? null,
    teamRole: user.teamMembers[0]?.role ?? null,
  };
}
