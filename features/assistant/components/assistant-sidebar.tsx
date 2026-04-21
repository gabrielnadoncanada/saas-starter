"use client";

import { ArrowLeftIcon, ChevronRight } from "lucide-react";
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
import { useAssistantConversations } from "@/features/assistant/hooks/use-assistant-conversations";

export function AssistantSidebar() {
  const pathname = usePathname();
  const {
    conversations,
    activeConversationId,
    deletingConversationId,
    deleteConversation,
  } = useAssistantConversations();

  const hasConversations = conversations.length > 0;

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
                icon: "message-square-plus",
              }}
              pathname={pathname}
            />
          </SidebarGroup>
          {hasConversations ? (
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
                    <AssistantSidebarNav
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                      deletingConversationId={deletingConversationId}
                      onDelete={(id) => void deleteConversation(id)}
                    />
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          ) : null}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
