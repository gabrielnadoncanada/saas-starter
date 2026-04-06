import { redirect } from "next/navigation";

import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { isPlatformAdmin } from "@/shared/lib/auth/roles";

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  if (!isPlatformAdmin(user.role)) {
    redirect(routes.app.dashboard);
  }

  return user;
}

export async function requireAdminAction(): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!isPlatformAdmin(user.role)) {
    throw new Error("Forbidden: admin role required");
  }

  return user.id;
}

