"use client";

import {
  BadgeCheck,
  Building2,
  Check,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  SunMoon,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import useDialogState from '@/shared/hooks/useDialogState'
import { useActiveOrganization } from '@/features/teams/data/active-organization'
import { useOrganizationList } from '@/features/teams/data/organization-list'
import { useSetActiveOrganization } from '@/features/teams/data/set-active-organization'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar'
import Link from 'next/link'
import { routes } from '@/shared/constants/routes'
import { SignOutDialog } from '@/features/auth/components/session/sign-out-dialog'

type NavUserProps = {
  user: {
    name: string
    email: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useDialogState()
  const { data: organizations } = useOrganizationList()
  const { data: activeOrganization } = useActiveOrganization()
  const setActiveOrganization = useSetActiveOrganization()
  const orgItems = organizations ?? []
  const currentOrg = activeOrganization ?? orgItems[0]
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('') || 'U'

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{user.name}</span>
                    <span className='truncate text-xs'>{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Building2 />
                    {currentOrg?.name ?? 'Organization'}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Organizations
                      </DropdownMenuLabel>
                      {orgItems.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={async () => {
                            if (org.id !== activeOrganization?.id) {
                              await setActiveOrganization.mutate({ organizationId: org.id })
                              router.refresh()
                            }
                          }}
                        >
                          <div className="flex size-5 items-center justify-center rounded-sm border">
                            <span className="text-xs font-semibold">
                              {org.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {org.name}
                          {org.id === activeOrganization?.id && <Check className="ms-auto size-4" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={routes.app.account}>
                    <BadgeCheck />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={routes.app.team}>
                    <Users />
                    Team
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={routes.app.billing}>
                    <CreditCard />
                    Billing
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="size-4 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute size-4 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
                    Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun />
                        Light
                        {theme === 'light' && <Check className="ms-auto size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon />
                        Dark
                        {theme === 'dark' && <Check className="ms-auto size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')}>
                        <SunMoon />
                        System
                        {theme === 'system' && <Check className="ms-auto size-4" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
