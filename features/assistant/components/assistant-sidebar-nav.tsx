"use client";

import {
  ChevronRight,
  Loader2,
  MessageSquarePlus,
  MoreHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteAssistantConversationRequest,
  listAssistantConversationsRequest,
} from "@/features/assistant/client/conversations";
import type { AssistantConversationListItem } from "@/features/assistant/types";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/utils";

// ---------------------------------------------------------------------------
// Conversation actions menu (delete) — rendered inline per conversation row
// ---------------------------------------------------------------------------

function ConversationActionsMenu({
  conversationId,
  conversationTitle,
  isDeleting,
  onDelete,
  variant,
}: {
  conversationId: string;
  conversationTitle: string;
  isDeleting: boolean;
  onDelete: (conversationId: string) => void;
  variant: "sidebar" | "dropdown";
}) {
  const trigger =
    variant === "sidebar" ? (
      <SidebarMenuAction
        aria-label={`Open actions for ${conversationTitle}`}
        disabled={isDeleting}
        showOnHover
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
        <span className="sr-only">Conversation actions</span>
      </SidebarMenuAction>
    ) : (
      <Button
        aria-label={`Open actions for ${conversationTitle}`}
        className="size-8 shrink-0"
        disabled={isDeleting}
        size="icon"
        type="button"
        variant="ghost"
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
        <span className="sr-only">Conversation actions</span>
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem
          className="text-destructive"
          disabled={isDeleting}
          onClick={() => onDelete(conversationId)}
        >
          <Trash2 />
          Delete conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Sidebar navigation for the assistant conversations
// ---------------------------------------------------------------------------

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
            <SidebarMenuButton
              tooltip="AI Assistant"
              isActive={isAssistantActive}
            >
              <Sparkles />
              <span>AI Assistant</span>
              <ChevronRight className="ms-auto transition-transform duration-200" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72" side="right">
            <DropdownMenuItem asChild>
              <Link
                href={routes.app.assistant}
                onClick={() => setOpenMobile(false)}
              >
                <MessageSquarePlus />
                <span>New Conversation</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

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

                      <ConversationActionsMenu
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
      <SidebarMenuItem>
        <SidebarMenuButton
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
        </SidebarMenuButton>
      </SidebarMenuItem>

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
            <ConversationActionsMenu
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
