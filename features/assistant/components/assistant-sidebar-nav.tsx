"use client";

import { HistoryIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { routes } from "@/constants/routes";
import { AssistantConversationActionsMenu } from "@/features/assistant/components/assistant-conversation-actions-menu";
import type { AssistantConversationListItem } from "@/features/assistant/schemas/conversation-api.schema";
import { cn } from "@/lib/utils";

type AssistantSidebarNavProps = {
  conversations: AssistantConversationListItem[];
  activeConversationId: string | null;
  deletingConversationId: string | null;
  onDelete: (conversationId: string) => void;
};

function getConversationHref(conversationId: string) {
  return `${routes.app.assistant}?conversationId=${conversationId}`;
}

export function AssistantSidebarNav({
  conversations,
  activeConversationId,
  deletingConversationId,
  onDelete,
}: AssistantSidebarNavProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();

  if (conversations.length === 0) {
    return null;
  }

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="History">
              <HistoryIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72" side="right">
            <div className="space-y-1 p-1">
              {conversations.map((conversation) => {
                const isDeleting = deletingConversationId === conversation.id;

                return (
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-md",
                      activeConversationId === conversation.id &&
                        "bg-accent text-accent-foreground",
                    )}
                    key={conversation.id}
                  >
                    <Button
                      asChild
                      className="h-8 flex-1 justify-start px-2 font-normal overflow-hidden"
                      variant="ghost"
                    >
                      <Link
                        href={getConversationHref(conversation.id)}
                        onClick={() => setOpenMobile(false)}
                      >
                        <span className="truncate">{conversation.title}</span>
                      </Link>
                    </Button>

                    <AssistantConversationActionsMenu
                      conversationId={conversation.id}
                      conversationTitle={conversation.title}
                      isDeleting={isDeleting}
                      onDelete={onDelete}
                      variant="dropdown"
                    />
                  </div>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <>
      {conversations.map((conversation) => {
        const isDeleting = deletingConversationId === conversation.id;

        return (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButton
              asChild
              isActive={activeConversationId === conversation.id}
            >
              <Link
                href={getConversationHref(conversation.id)}
                onClick={() => setOpenMobile(false)}
              >
                <span className="truncate">{conversation.title}</span>
              </Link>
            </SidebarMenuButton>
            <AssistantConversationActionsMenu
              conversationId={conversation.id}
              conversationTitle={conversation.title}
              isDeleting={isDeleting}
              onDelete={onDelete}
              variant="sidebar"
            />
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
