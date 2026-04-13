"use client";

import { ArrowLeftIcon, MessageSquarePlus } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuLink } from "@/components/navigation/nav-group";
import { SidebarGroupSearch } from "@/components/navigation/sidebar-group-search";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { routes } from "@/constants/routes";
import { AssistantSidebarNav } from "@/features/assistant/components/assistant-sidebar-nav";

export function AssistantSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton variant="ghost" asChild tooltip="Back to dashboard">
          <Link
            href={routes.app.dashboard}
            className="justify-start whitespace-nowrap"
          >
            <ArrowLeftIcon className="size-4" />
            Back to dashboard
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupSearch />
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>Assistant</SidebarGroupLabel>
            <SidebarMenuLink
              item={{
                title: "New Conversation",
                url: routes.app.assistant,
                icon: MessageSquarePlus,
              }}
              pathname={usePathname()}
            />
          </SidebarGroup>
          <SidebarGroup>
            <Collapsible defaultOpen>
              <SidebarGroupLabel>
                <CollapsibleTrigger className="group/collapsible flex w-full items-center">
                  History
                  <ChevronRight className="size-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  <AssistantSidebarNav />
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
