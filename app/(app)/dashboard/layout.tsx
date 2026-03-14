import { ThemeSwitch } from '@/shared/components/layout/preferences/ThemeSwitch';
import { Header } from '@/shared/components/layout/shell/Header';
import { Search } from '@/shared/components/layout/navigation/Search';
import { ProfileDropdown } from '@/shared/components/layout/user/ProfileDropdown';
import { getCookie } from '@/shared/lib/cookies'
import { cn } from '@/shared/lib/utils'
import { SearchProvider } from '@/shared/components/command/SearchProvider'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { AppSidebar } from '@/shared/components/layout/shell/AppSidebar'
import { SkipToMain } from '@/shared/components/a11y/SkipToMain'


export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <SearchProvider >
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
  );
}
