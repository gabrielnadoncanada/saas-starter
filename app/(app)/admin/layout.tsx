import { cookies } from "next/headers";
import { Header } from "@/shared/components/layout/shell/header";
import { Search } from "@/shared/components/navigation/search";
import { cn } from "@/shared/lib/utils";
import { SearchProvider } from "@/shared/components/command/search-provider";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { SkipToMain } from "@/shared/components/a11y/skip-to-main";
import { requireAdmin } from "@/features/auth/server/require-admin";
import { UserProvider } from "@/shared/components/providers/user-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const user = await requireAdmin();

  const sidebarUser = {
    name: user.name ?? user.email ?? "Admin",
    email: user.email ?? "",
    image: user.image ?? null,
    role: (user as any).role ?? null,
  };

  return (
    <UserProvider user={sidebarUser}>
      <SearchProvider>
        <TooltipProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <SkipToMain />
            <AdminSidebar />
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
  );
}

