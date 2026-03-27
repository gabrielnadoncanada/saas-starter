'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useActiveOrganization } from '@/features/teams/shared/data/active-organization'
import { useOrganizationList } from '@/features/teams/shared/data/organization-list'
import { useSetActiveOrganization } from '@/features/teams/shared/data/set-active-organization'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar'

export function OrganizationSwitcher() {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const { data: organizations, isPending: isLoadingOrganizations } =
    useOrganizationList()
  const { data: activeOrganization, isPending: isLoadingActiveOrganization } =
    useActiveOrganization()
  const setActiveOrganization = useSetActiveOrganization()

  const isLoading =
    isLoadingOrganizations ||
    isLoadingActiveOrganization ||
    setActiveOrganization.isPending
  const items = organizations ?? []

  async function handleSwitch(nextOrgId: string) {
    if (!nextOrgId || nextOrgId === activeOrganization?.id) {
      return
    }

    await setActiveOrganization.mutate({ organizationId: nextOrgId })
    router.refresh()
  }

  if (isLoading || items.length < 1) {
    return null
  }

  const currentOrganization = activeOrganization ?? items[0]
  const activeOrganizationInitial = currentOrganization?.name?.charAt(0).toUpperCase() ?? 'O'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <span className='text-sm font-semibold'>{activeOrganizationInitial}</span>
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{currentOrganization?.name}</span>
                <span className='truncate text-xs'>Organization</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Organizations
            </DropdownMenuLabel>
            {items.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => {
                  void handleSwitch(organization.id)
                }}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <span className='text-xs font-semibold'>
                    {organization.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {organization.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
