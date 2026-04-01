"use client";

import { ChevronRight, MessageSquarePlus, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { listAssistantConversationsRequest } from "@/features/assistant/client/conversations";
import type { AssistantConversationListItem } from "@/features/assistant/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { routes } from "@/shared/constants/routes";

export function NavAssistant() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversationId");
  const [conversations, setConversations] = useState<
    AssistantConversationListItem[]
  >([]);

  useEffect(() => {
    listAssistantConversationsRequest().then(setConversations);
  }, [pathname]);

  const isAssistantActive = pathname.startsWith(routes.app.assistant);

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip="AI Assistant"
              isActive={isAssistantActive}
            >
              <Sparkles />
              <span>AI Assistant</span>
              <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={4}>
            <DropdownMenuLabel>AI Assistant</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={routes.app.assistant}>
                <MessageSquarePlus />
                <span>New Conversation</span>
              </Link>
            </DropdownMenuItem>
            {conversations.map((conversation) => (
              <DropdownMenuItem key={conversation.id} asChild>
                <Link
                  href={`${routes.app.assistant}?conversationId=${conversation.id}`}
                  className={
                    activeConversationId === conversation.id
                      ? "bg-secondary"
                      : ""
                  }
                >
                  <span className="max-w-52 truncate">
                    {conversation.title}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      asChild
      defaultOpen={isAssistantActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="AI Assistant">
            <Sparkles />
            <span>AI Assistant</span>
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                asChild
                isActive={isAssistantActive && !activeConversationId}
              >
                <Link
                  href={routes.app.assistant}
                  onClick={() => setOpenMobile(false)}
                >
                  <MessageSquarePlus />
                  <span>New Conversation</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {conversations.map((conversation) => (
              <SidebarMenuSubItem key={conversation.id}>
                <SidebarMenuSubButton
                  asChild
                  isActive={activeConversationId === conversation.id}
                >
                  <Link
                    href={`${routes.app.assistant}?conversationId=${conversation.id}`}
                    onClick={() => setOpenMobile(false)}
                  >
                    <span className="truncate">{conversation.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
