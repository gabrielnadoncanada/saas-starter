"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Trash2 } from "lucide-react";

import type { AssistantConversationListItem } from "@/features/assistant/types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type AssistantConversationHistoryProps = {
  conversations: AssistantConversationListItem[];
  selectedConversationId: string | null;
  isLoadingConversation: boolean;
  onDeleteConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
};

function formatLastActivity(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function AssistantConversationHistory({
  conversations,
  selectedConversationId,
  isLoadingConversation,
  onDeleteConversation,
  onNewConversation,
  onSelectConversation,
}: AssistantConversationHistoryProps) {
  return (
    <aside className="flex flex-col rounded-lg border bg-background">
      <div className="border-b p-3">
        <Button
          className="w-full justify-start"
          onClick={onNewConversation}
          type="button"
          variant="outline"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      <div className="flex max-h-64 flex-col overflow-y-auto p-2 lg:max-h-none lg:flex-1">
        {conversations.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Your recent assistant threads will appear here.
          </div>
        ) : (
          conversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId;

            return (
              <div
                className={cn(
                  "group flex items-start gap-2 rounded-lg border p-2 transition-colors",
                  isSelected
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-transparent hover:bg-muted/40"
                )}
                key={conversation.id}
              >
                <button
                  className="min-w-0 flex-1 text-left"
                  disabled={isLoadingConversation}
                  onClick={() => onSelectConversation(conversation.id)}
                  type="button"
                >
                  <p className="truncate text-sm font-medium">{conversation.title}</p>
                  {conversation.preview ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {conversation.preview}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {formatLastActivity(conversation.lastMessageAt)}
                  </p>
                </button>

                <Button
                  className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  onClick={() => onDeleteConversation(conversation.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete conversation</span>
                </Button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
