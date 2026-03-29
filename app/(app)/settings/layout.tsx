import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/shared/components/layout/shell/header";
import { Search } from "@/shared/components/navigation/search";
import { cn } from "@/shared/lib/utils";
import { SearchProvider } from "@/shared/components/command/search-provider";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { SettingsSidebar } from "@/shared/components/layout/shell/settings-sidebar";
import { SkipToMain } from "@/shared/components/a11y/skip-to-main";
import { ensureActiveOrganization } from "@/features/organizations/server/ensure-active-organization";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { ActiveOrganizationProvider } from "@/shared/components/providers/active-organization-provider";
import { UserProvider } from "@/shared/components/providers/user-provider";
import { routes } from "@/shared/constants/routes";

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

  const sidebarUser = {
    name: user.name ?? user.email ?? "User",
    email: user.email ?? "",
    image: user.image ?? null,
    role: (user as any).role ?? null,
  };

  return (
    <ActiveOrganizationProvider organizationId={activeOrgId}>
      <UserProvider user={sidebarUser}>
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


