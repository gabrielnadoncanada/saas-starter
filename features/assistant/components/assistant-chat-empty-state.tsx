"use client";

import { BookOpen, ListChecks, Sparkles } from "lucide-react";

import { ConversationEmptyState } from "@/shared/components/ai-elements/conversation";
import { Button } from "@/shared/components/ui/button";

type EmptyStateProps = {
  onPromptClick: (text: string) => void;
};

export function AssistantChatEmptyState({ onPromptClick }: EmptyStateProps) {
  const title = "AI-ready billing pattern";
  const description = "Create and organize tasks from natural language.";

  const suggested = [
    {
      icon: ListChecks,
      label: "Create a follow-up task",
      prompt:
        "Create a high-priority task titled Follow up with Acme about the proposal.",
    },
    {
      icon: BookOpen,
      label: "Add a documentation task",
      prompt:
        "Create a Medium priority documentation task titled Update API reference for the auth endpoints.",
    },
  ];

  return (
    <ConversationEmptyState>
      <div className="flex size-full flex-col items-center justify-center gap-6 px-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
          <Sparkles className="h-6 w-6 text-orange-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="grid w-full max-w-md gap-3">
          {suggested.map((item) => (
            <Button
              key={item.label}
              className="h-auto items-start justify-start gap-3 whitespace-normal px-4 py-4 text-left"
              onClick={() => onPromptClick(item.prompt)}
              type="button"
              variant="outline"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="line-clamp-2 block text-xs text-muted-foreground">
                  {item.prompt}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </ConversationEmptyState>
  );
}
