"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/shared/components/ui/sidebar'
import { sidebarData } from '@/shared/components/navigation/config/sidebar-data'
import { OrganizationSwitcher } from '@/features/teams/components/organization-switcher'
import { NavUser } from '@/shared/components/layout/user/nav-user'
import { NavGroup } from '@/shared/components/navigation/nav-group'
import type { SidebarNavGroup } from '@/shared/components/navigation/sidebar-types'
import { useUser } from '@/shared/components/providers/user-provider'

export function AppSidebar() {
  const user = useUser()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <OrganizationSwitcher />
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
