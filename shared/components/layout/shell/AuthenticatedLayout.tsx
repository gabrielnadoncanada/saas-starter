import { getCookie } from '@/shared/lib/cookies'
import { cn } from '@/shared/lib/utils'
import { SearchProvider } from '@/shared/components/command/SearchProvider'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { AppSidebar } from '@/shared/components/layout/shell/AppSidebar'
import { SkipToMain } from '@/shared/components/a11y/SkipToMain'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
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
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </SearchProvider>
  )
