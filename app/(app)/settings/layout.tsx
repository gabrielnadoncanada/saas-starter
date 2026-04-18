import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/shell/app-shell";
import { SettingsSidebar } from "@/components/navigation/settings-sidebar";
import { ActiveOrganizationProvider } from "@/components/providers/active-organization-provider";
import { getDashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const organization = await getCurrentOrganization();

  const sidebarData = getDashboardSidebarData({
    assistantEnabled: hasAnyAiProvider(),
  });

  return (
    <ActiveOrganizationProvider organizationId={organization?.id ?? null}>
      <AppShell
        defaultOpen={defaultOpen}
        sidebar={<SettingsSidebar />}
        sidebarData={sidebarData}
      >
        {children}
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
