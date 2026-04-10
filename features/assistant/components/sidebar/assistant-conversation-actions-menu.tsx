"use client";

import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/shared/components/ui/sidebar";

type AssistantConversationActionsMenuProps = {
  conversationId: string;
  conversationTitle: string;
  isDeleting: boolean;
  onDelete: (conversationId: string) => void;
  variant: "sidebar" | "dropdown";
};

export function AssistantConversationActionsMenu({
  conversationId,
  conversationTitle,
  isDeleting,
  onDelete,
  variant,
}: AssistantConversationActionsMenuProps) {
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
