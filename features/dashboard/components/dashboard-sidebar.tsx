"use client";

import { ChevronRight } from "lucide-react";

import { AssistantSidebarNav } from "@/features/assistant/components/sidebar/assistant-sidebar-nav";
import { DashboardSidebarUser } from "@/features/dashboard/components/dashboard-sidebar-user";
import { dashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import { SidebarGroupSearch } from "@/shared/components/navigation/sidebar-group-search";

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
