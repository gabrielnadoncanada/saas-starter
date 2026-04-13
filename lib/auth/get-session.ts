import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth/auth-config";

type RawAuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type AuthSession = RawAuthSession & {
  session: RawAuthSession["session"] & {
    activeOrganizationId?: string | null;
  };
};

export const getAuthSession = cache(async (): Promise<AuthSession | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session as AuthSession | null;
});
