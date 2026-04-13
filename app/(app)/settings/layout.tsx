import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/shell/app-shell";
import { SettingsSidebar } from "@/components/navigation/settings-sidebar";
import { ActiveOrganizationProvider } from "@/components/providers/active-organization-provider";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const organization = await getCurrentOrganization();

  return (
    <ActiveOrganizationProvider organizationId={organization?.id ?? null}>
      <AppShell defaultOpen={defaultOpen} sidebar={<SettingsSidebar />}>
        {children}
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
