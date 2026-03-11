import { db } from "@/lib/db/prisma";

export async function getUserTeamId(userId: number) {
  const membership = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
    orderBy: { joinedAt: "asc" },
  });

  return membership?.teamId ?? null;
}
