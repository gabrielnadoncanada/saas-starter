"use client";

import { ChevronRight, HistoryIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteAssistantConversationRequest,
  listAssistantConversationsRequest,
} from "@/features/assistant/client/assistant-conversations-api";
import { AssistantConversationActionsMenu } from "@/features/assistant/components/sidebar/assistant-conversation-actions-menu";
import type { AssistantConversationListItem } from "@/features/assistant/schemas/conversation-api.schema";
import { Button } from "@/shared/components/ui/button";
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
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/utils";

function getConversationHref(conversationId: string) {
  return `${routes.app.assistant}?conversationId=${conversationId}`;
}

export function AssistantSidebarNav() {
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversationId");
  const [conversations, setConversations] = useState<
    AssistantConversationListItem[]
  >([]);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadConversations() {
      const nextConversations = await listAssistantConversationsRequest();

      if (!isCancelled) {
        setConversations(nextConversations);
      }
    }

    void loadConversations();

    return () => {
      isCancelled = true;
    };
  }, [pathname, activeConversationId]);

  const isAssistantActive = pathname.startsWith(routes.app.assistant);

  async function deleteConversation(conversationId: string) {
    setDeletingConversationId(conversationId);

    try {
      await deleteAssistantConversationRequest(conversationId);
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId),
      );

      if (activeConversationId === conversationId) {
        router.replace(routes.app.assistant, { scroll: false });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete conversation";

      toast.error(message);
    } finally {
      setDeletingConversationId(null);
    }
  }

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="History" isActive={isAssistantActive}>
              <HistoryIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72" side="right">
            {conversations.length === 0 ? (
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                No conversations yet.
              </DropdownMenuLabel>
            ) : (
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
                        onDelete={(id) => {
                          void deleteConversation(id);
                        }}
                        variant="dropdown"
                      />
                    </div>
                  );
                })}
              </div>
            )}
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
              onDelete={(id) => {
                void deleteConversation(id);
              }}
              variant="sidebar"
            />
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
