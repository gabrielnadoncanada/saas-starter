import { cache } from "react";

import { getAuthSession } from "@/shared/lib/auth/get-session";

export const getCurrentUser = cache(async () => {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
});
