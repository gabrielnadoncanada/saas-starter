import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  return children;
}
