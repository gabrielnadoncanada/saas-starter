import { cookies } from "next/headers";

import { ensureActiveOrganization } from "@/features/organizations/server/organization-membership";
import { SettingsSidebar } from "@/shared/components/navigation/settings-sidebar";
import { AppShell } from "@/shared/components/layout/shell/app-shell";
import { ActiveOrganizationProvider } from "@/shared/components/providers/active-organization-provider";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const activeOrgId = await ensureActiveOrganization();

  return (
    <ActiveOrganizationProvider organizationId={activeOrgId}>
      <AppShell defaultOpen={defaultOpen} sidebar={<SettingsSidebar />}>
        {children}
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
