import { cache } from "react";

import { getAuthSession } from "@/shared/lib/auth/get-session";

export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof getAuthSession>>
>["user"] & {
  role: string | null;
};

export type SidebarUser = {
  name: string;
  email: string;
  image: string | null;
  role: string | null;
};

export function toSidebarUser(user: CurrentUser): SidebarUser {
  return {
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    image: user.image ?? null,
    role: user.role ?? null,
  };
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return {
    ...session.user,
    role: session.user.role ?? null,
  };
});
