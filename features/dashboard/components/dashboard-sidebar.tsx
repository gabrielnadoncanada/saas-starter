import { AssistantSidebarNav } from "@/features/assistant/components/assistant-sidebar-nav";
import { DashboardSidebarUser } from "@/features/dashboard/components/dashboard-sidebar-user";
import { dashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/shared/components/ui/sidebar";

export function DashboardSidebar() {
  const { navGroups } = dashboardSidebarData;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <DashboardSidebarUser />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group}>
            <AssistantSidebarNav />
          </NavGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
