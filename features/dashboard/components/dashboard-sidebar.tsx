"use client";

import { dashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";
import { NavUser } from "@/shared/components/layout/user/nav-user";
import { NavAssistant } from "@/shared/components/navigation/nav-assistant";
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
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group}>
            <NavAssistant />
          </NavGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
