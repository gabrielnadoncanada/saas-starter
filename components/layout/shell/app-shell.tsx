"use client";

import { SearchProvider } from "@/components/command/search-provider";
import { Header } from "@/components/layout/shell/header";
import type { SidebarData } from "@/components/navigation/sidebar-types";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AppShellProps = {
  defaultOpen: boolean;
  sidebar: React.ReactNode;
  sidebarData: SidebarData;
  children: React.ReactNode;
};

export function AppShell({
  defaultOpen,
  sidebar,
  sidebarData,
  children,
}: AppShellProps) {
  return (
    <SearchProvider sidebarData={sidebarData}>
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
