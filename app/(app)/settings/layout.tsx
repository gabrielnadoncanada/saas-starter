import { cookies } from "next/headers";

import { getCurrentOrganization } from "@/features/organizations/server/organizations";
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
  const organization = await getCurrentOrganization();

  return (
    <ActiveOrganizationProvider organizationId={organization?.id ?? null}>
      <AppShell defaultOpen={defaultOpen} sidebar={<SettingsSidebar />}>
        {children}
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
