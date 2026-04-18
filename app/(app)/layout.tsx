import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";
import { ensureUserOrganization } from "@/features/auth/server/onboarding";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { identifySentryUser } from "@/lib/sentry";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  await ensureUserOrganization(user.email);
  identifySentryUser(user);

  return (
    <>
      <ImpersonationBanner />
      {children}
    </>
  );
}
