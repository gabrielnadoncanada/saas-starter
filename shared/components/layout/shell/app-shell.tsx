"use client";

import { SearchProvider } from "@/shared/components/command/search-provider";
import { Header } from "@/shared/components/layout/shell/header";
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
          {sidebar}
          <SidebarInset
            className={cn(
              "@container/content border",
              "has-data-[layout=fixed]:h-svh",
              "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
            )}
          >
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </SearchProvider>
  );
}
