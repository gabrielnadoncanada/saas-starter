import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/shell/app-shell";
import { ActiveOrganizationProvider } from "@/components/providers/active-organization-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { AssistantSidebar } from "@/features/assistant/components/assistant-sidebar";
import { getDashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";
import {
  getCurrentUser,
  toDisplayUser,
} from "@/lib/auth/get-current-user";

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const [user, organization] = await Promise.all([
    getCurrentUser(),
    getCurrentOrganization(),
  ]);

  if (!user) return null;

  const sidebarData = getDashboardSidebarData({
    assistantEnabled: hasAnyAiProvider(),
  });

  return (
    <ActiveOrganizationProvider organizationId={organization?.id ?? null}>
      <UserProvider user={toDisplayUser(user)}>
        <AppShell
          defaultOpen={defaultOpen}
          sidebar={<AssistantSidebar />}
          sidebarData={sidebarData}
        >
          {children}
        </AppShell>
      </UserProvider>
    </ActiveOrganizationProvider>
  );
}
