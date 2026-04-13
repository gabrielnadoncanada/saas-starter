import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/shell/app-shell";
import { ActiveOrganizationProvider } from "@/components/providers/active-organization-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import {
  getCurrentUser,
  toDisplayUser,
} from "@/lib/auth/get-current-user";

export default async function DashboardLayout({
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

  return (
    <ActiveOrganizationProvider organizationId={organization?.id ?? null}>
      <UserProvider user={toDisplayUser(user)}>
        <AppShell defaultOpen={defaultOpen} sidebar={<DashboardSidebar />}>
          {children}
        </AppShell>
      </UserProvider>
    </ActiveOrganizationProvider>
  );
}
