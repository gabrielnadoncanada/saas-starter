"use client";

import { NavGroup } from "@/components/navigation/nav-group";
import { SidebarGroupSearch } from "@/components/navigation/sidebar-group-search";
import type { SidebarData } from "@/components/navigation/sidebar-types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardSidebarBrand } from "@/features/dashboard/components/dashboard-sidebar-brand";
import { DashboardSidebarUser } from "@/features/dashboard/components/dashboard-sidebar-user";

type DashboardSidebarProps = {
  sidebarData: SidebarData;
};

export function DashboardSidebar({ sidebarData }: DashboardSidebarProps) {
  const { navGroups } = sidebarData;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DashboardSidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupSearch />
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <DashboardSidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
