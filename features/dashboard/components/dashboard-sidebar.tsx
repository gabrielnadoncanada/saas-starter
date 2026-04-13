"use client";


import { NavGroup } from "@/components/navigation/nav-group";
import { SidebarGroupSearch } from "@/components/navigation/sidebar-group-search";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardSidebarUser } from "@/features/dashboard/components/dashboard-sidebar-user";
import { dashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";

export function DashboardSidebar() {
  const { navGroups } = dashboardSidebarData;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DashboardSidebarUser />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupSearch />
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
