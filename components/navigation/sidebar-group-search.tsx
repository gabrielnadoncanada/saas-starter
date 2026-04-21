"use client";

import { SearchIcon } from "lucide-react";

import { useSearch } from "@/components/command/search-provider";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type SearchProps = {
  className?: string;
  placeholder?: string;
};

export function SidebarGroupSearch({
  className,
  placeholder = "Search",
}: SearchProps) {
  const { setOpen } = useSearch();
  return (
    <SidebarGroup className="mt-2 border-b pb-2">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              variant="outline"
              tooltip="Search"
              className={cn(
                "group relative h-8 w-full !pr-2 flex-1 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none justify-start rounded-md bg-muted/25 text-sm font-normal shadow-none hover:bg-accent  sm:pe-12 md:flex-none ",
                className,
              )}
              onClick={() => setOpen(true)}
            >
              <SearchIcon aria-hidden="true" size={16} />

              <span className="group-data-[collapsible=icon]:hidden">
                {placeholder}
              </span>
              <kbd className="ml-auto group-data-[collapsible=icon]:hidden pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none group-hover:bg-accent sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
