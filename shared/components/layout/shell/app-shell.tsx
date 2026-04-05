"use client";

import { SkipToMain } from "@/shared/components/a11y/skip-to-main";
import { SearchProvider } from "@/shared/components/command/search-provider";
import { Header } from "@/shared/components/layout/shell/header";
import { Search } from "@/shared/components/navigation/search";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

type AppShellProps = {
  defaultOpen: boolean;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ defaultOpen, sidebar, children }: AppShellProps) {
  return (
    <SearchProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          {sidebar}
          <SidebarInset
            className={cn(
              "@container/content",
              "has-data-[layout=fixed]:h-svh",
              "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
            )}
          >
            <Header>
              <Search />
            </Header>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </SearchProvider>
  );
}
