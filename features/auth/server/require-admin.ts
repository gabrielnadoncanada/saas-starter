import { headers } from "next/headers";

import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { getRequestLocale } from "@/shared/i18n/server-locale";
import { auth } from "@/shared/lib/auth/auth-config";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { isPlatformAdmin } from "@/shared/lib/auth/roles";

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirectToLocale(await getRequestLocale(), routes.auth.login);
  }

  if (!isPlatformAdmin(user.role)) {
    redirectToLocale(user.preferredLocale, routes.app.dashboard);
  }

  return user;
}

export async function requireAdminAction(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!isPlatformAdmin(session.user.role)) {
    throw new Error("Forbidden: admin role required");
  }

  return session.user.id;
}

