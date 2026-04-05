import { cookies } from "next/headers";

import { ensureActiveOrganization } from "@/features/organizations/server/organization-membership";
import { SettingsSidebar } from "@/shared/components/navigation/settings-sidebar";
import { AppShell } from "@/shared/components/layout/shell/app-shell";
import { ActiveOrganizationProvider } from "@/shared/components/providers/active-organization-provider";
import { UserProvider } from "@/shared/components/providers/user-provider";
import {
  getCurrentUser,
  toSidebarUser,
} from "@/shared/lib/auth/get-current-user";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const [user, activeOrgId] = await Promise.all([
    getCurrentUser(),
    ensureActiveOrganization(),
  ]);

  if (!user) return null;

  return (
    <ActiveOrganizationProvider organizationId={activeOrgId}>
      <UserProvider user={toSidebarUser(user)}>
        <AppShell defaultOpen={defaultOpen} sidebar={<SettingsSidebar />}>
          {children}
        </AppShell>
      </UserProvider>
    </ActiveOrganizationProvider>
  );
}
