"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/shared/components/ui/sidebar";
import { dashboardSidebarData } from "@/shared/components/navigation/config/dashboard-sidebar-data";
import { NavUser } from "@/shared/components/layout/user/nav-user";
import { NavAssistant } from "@/shared/components/navigation/nav-assistant";
import { NavGroup } from "@/shared/components/navigation/nav-group";

export function DashboardSidebar() {
  const generalGroup = dashboardSidebarData.navGroups[0];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup {...generalGroup}>
          <NavAssistant />
        </NavGroup>
      </SidebarContent>
    </Sidebar>
  );
}
