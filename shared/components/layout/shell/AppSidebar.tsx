"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/shared/components/ui/sidebar'
import { sidebarData } from '@/shared/components/layout/navigation/config/sidebar-data'
import { NavGroup } from '@/shared/components/layout/navigation/NavGroup'
import { TeamSwitcher } from '@/features/teams/components/TeamSwitcher'
import { NavUser } from '@/shared/components/layout/user/NavUser'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
