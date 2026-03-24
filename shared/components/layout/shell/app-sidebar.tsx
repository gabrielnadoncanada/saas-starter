"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { sidebarData } from "@/shared/components/navigation/config/sidebar-data";
import { NavUser } from "@/shared/components/layout/user/nav-user";
import { NavAssistant } from "@/shared/components/navigation/nav-assistant";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import type { SidebarNavGroup } from "@/shared/components/navigation/sidebar-types";
import { useUser } from "@/shared/components/providers/user-provider";
import { CommandIcon, PanelLeftIcon } from "lucide-react";

export function AppSidebar() {
  const user = useUser();
  const { state, isMobile, toggleSidebar } = useSidebar();
  const [generalGroup, ...otherGroups] = sidebarData.navGroups;
  const isCollapsed = state === "collapsed";

  // Delay the icon swap so it doesn't flash during the collapse animation
  const [showToggleOnHover, setShowToggleOnHover] = useState(isCollapsed);
  useEffect(() => {
    if (isCollapsed) {
      const timer = setTimeout(() => setShowToggleOnHover(true), 300);
      return () => clearTimeout(timer);
    }
    setShowToggleOnHover(false);
  }, [isCollapsed]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="flex flex-row items-center justify-between">
        <button
          type="button"
          onClick={isCollapsed ? toggleSidebar : undefined}
          className="group relative flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <CommandIcon className={showToggleOnHover ? "h-4 w-4 group-hover:hidden" : "h-4 w-4"} />
          {showToggleOnHover && (
            <PanelLeftIcon className="hidden h-4 w-4 group-hover:block" />
          )}
        </button>
        {(isMobile || !isCollapsed) && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <PanelLeftIcon className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavGroup {...generalGroup}>
          <NavAssistant />
        </NavGroup>
        {otherGroups.map((props: SidebarNavGroup) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
