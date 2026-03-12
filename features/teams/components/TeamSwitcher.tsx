'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { listTeamsAction } from '@/features/teams/actions/list-teams.action'
import { switchTeamAction } from '@/features/teams/actions/switch-team.action'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

type TeamOption = {
  id: number
  name: string
}

export function TeamSwitcher() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [teams, setTeams] = React.useState<TeamOption[]>([])
  const [activeTeamId, setActiveTeamId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSwitching, setIsSwitching] = React.useState(false)

  React.useEffect(() => {
    void (async () => {
      try {
        const result = await listTeamsAction()
        console.log(result)
        if (!result.ok || !result.data) {
          return
        }

        setTeams(result.data.teams)
        setActiveTeamId(result.data.activeTeamId)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])


  async function handleSwitch(nextTeamId: number) {
    if (!nextTeamId || nextTeamId === activeTeamId) {
      return
    }

    setIsSwitching(true)

    try {
      const result = await switchTeamAction({ teamId: nextTeamId })

      if (!result.ok) {
        return
      }

      setActiveTeamId(nextTeamId)
      router.refresh()
    } finally {
      setIsSwitching(false)
    }
  }

  if (isLoading || teams.length < 1) {
    return null
  }

  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]
  const activeTeamInitial = activeTeam?.name.charAt(0).toUpperCase() ?? 'T'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              disabled={isSwitching}
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <span className='text-sm font-semibold'>{activeTeamInitial}</span>
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{activeTeam?.name}</span>
                <span className='truncate text-xs'>Team</span>
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
              Teams
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => {
                  void handleSwitch(team.id)
                }}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <span className='text-xs font-semibold'>
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
