"use client";

import { ArrowLeftIcon, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

import {
  NavGroup,
  SidebarMenuLink,
} from "@/shared/components/navigation/nav-group";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/shared/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

import { AssistantSidebarNav } from "@/features/assistant/components/assistant-sidebar-nav";

import { routes } from "@/shared/constants/routes";
import { SidebarGroupSearch } from "@/shared/components/navigation/sidebar-group-search";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function AssistantSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton variant="ghost" asChild tooltip="Back">
          <Link
            href={routes.app.dashboard}
            className="justify-start whitespace-nowrap"
          >
            <ArrowLeftIcon className="size-4" />
            Back
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
