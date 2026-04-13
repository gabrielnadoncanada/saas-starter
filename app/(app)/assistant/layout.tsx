import { cookies } from "next/headers";

import { AssistantSidebar } from "@/features/assistant/components/assistant-sidebar";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { AppShell } from "@/shared/components/layout/shell/app-shell";
import { ActiveOrganizationProvider } from "@/shared/components/providers/active-organization-provider";
import { UserProvider } from "@/shared/components/providers/user-provider";
import {
  getCurrentUser,
  toDisplayUser,
} from "@/shared/lib/auth/get-current-user";

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

  return (
    <ActiveOrganizationProvider organizationId={organization?.id ?? null}>
      <UserProvider user={toDisplayUser(user)}>
        <AppShell defaultOpen={defaultOpen} sidebar={<AssistantSidebar />}>
          {children}
        </AppShell>
      </UserProvider>
    </ActiveOrganizationProvider>
  );
}
