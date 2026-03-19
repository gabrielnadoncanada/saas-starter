import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db/prisma";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return db.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null,
    },
  });
});
