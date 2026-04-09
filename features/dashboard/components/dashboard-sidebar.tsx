"use client";

import { ChevronRight } from "lucide-react";

import { AssistantSidebarNav } from "@/features/assistant/components/assistant-sidebar-nav";
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

export function DashboardSidebar() {
  const { navGroups } = dashboardSidebarData;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DashboardSidebarUser />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
        <SidebarGroup>
          <Collapsible defaultOpen>
            <SidebarGroupLabel>
              <CollapsibleTrigger className="group/collapsible flex w-full items-center">
                Assistant
                <ChevronRight className="size-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenu>
                <AssistantSidebarNav />
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
