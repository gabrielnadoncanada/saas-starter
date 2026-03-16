"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/shared/components/ui/sidebar'
import { sidebarData } from '@/shared/components/navigation/config/sidebar-data'
import { TeamSwitcher } from '@/features/teams/components/TeamSwitcher'
import { NavUser } from '@/shared/components/layout/user/NavUser'
import { NavGroup } from '@/shared/components/navigation/NavGroup'
import type { SidebarNavGroup } from '@/shared/components/navigation/sidebar-types'
import { useUser } from '@/shared/components/providers/UserProvider'

export function AppSidebar() {
  const user = useUser()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props: SidebarNavGroup) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...user, avatar: '' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
