import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { routes } from "@/shared/constants/routes";

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  if (user.role !== "admin") {
    redirect(routes.app.dashboard);
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

  if (session.user.role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }

  return session.user.id;
}
