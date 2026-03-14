import { db } from "@/shared/lib/db/prisma";

export async function getActiveAuthUserById(userId: number) {
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deletedAt: true,
      platformRole: true,
    },
  });

  if (!user || user.deletedAt) {
    return null;
  }

  return {
    id: user.id,
    platformRole: user.platformRole,
  };
}
