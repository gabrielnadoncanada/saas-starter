import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ThemeSwitch } from '@/shared/components/layout/preferences/ThemeSwitch'
import { Header } from '@/shared/components/layout/shell/Header'
import { Search } from '@/shared/components/navigation/Search'
import { ProfileDropdown } from '@/shared/components/layout/user/ProfileDropdown'
import { cn } from '@/shared/lib/utils'
import { SearchProvider } from '@/shared/components/command/SearchProvider'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { AppSidebar } from '@/shared/components/layout/shell/AppSidebar'
import { SkipToMain } from '@/shared/components/a11y/SkipToMain'
import { getCurrentUser } from '@/shared/lib/auth/get-current-user'
import { UserProvider } from '@/shared/components/providers/UserProvider'
import { routes } from '@/shared/constants/routes'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  const user = await getCurrentUser()
  if (!user) {
    redirect(routes.auth.login)
  }

  const sidebarUser = {
    name: user.name ?? user.email ?? 'User',
    email: user.email ?? '',
  }

  return (
    <UserProvider user={sidebarUser}>
      <SearchProvider>
        <TooltipProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <SkipToMain />
            <AppSidebar />
            <SidebarInset
              className={cn(
                '@container/content',
                'has-data-[layout=fixed]:h-svh',
                'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
            >
              <Header>
                <Search />
                <div className="ms-auto flex items-center space-x-4">
                  <ThemeSwitch />
                  <ProfileDropdown />
                </div>
              </Header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </SearchProvider>
    </UserProvider>
  );
}
