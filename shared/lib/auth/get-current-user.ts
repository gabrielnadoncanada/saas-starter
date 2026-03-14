import { auth } from "@/auth";
import { db } from "@/shared/lib/db/prisma";

export async function getCurrentUser() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return db.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });
}
