import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ensureActiveOrganization } from "@/features/organizations/server/ensure-active-organization";
import { SettingsSidebar } from "@/features/settings/components/settings-sidebar";
import { SkipToMain } from "@/shared/components/a11y/skip-to-main";
import { SearchProvider } from "@/shared/components/command/search-provider";
import { Header } from "@/shared/components/layout/shell/header";
import { Search } from "@/shared/components/navigation/search";
import { ActiveOrganizationProvider } from "@/shared/components/providers/active-organization-provider";
import { UserProvider } from "@/shared/components/providers/user-provider";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { routes } from "@/shared/constants/routes";
import {
  getCurrentUser,
  toSidebarUser,
} from "@/shared/lib/auth/get-current-user";
import { cn } from "@/shared/lib/utils";

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

  if (!user) {
    redirect(routes.auth.login);
  }

  return (
    <ActiveOrganizationProvider organizationId={activeOrgId}>
      <UserProvider user={toSidebarUser(user)}>
        <SearchProvider>
          <TooltipProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <SkipToMain />
              <SettingsSidebar />
              <SidebarInset
                className={cn(
                  "@container/content",
                  "has-data-[layout=fixed]:h-svh",
                  "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
                )}
              >
                <Header>
                  <Search />
                </Header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </SearchProvider>
      </UserProvider>
    </ActiveOrganizationProvider>
  );
}
