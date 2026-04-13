"use client";

import { Sparkles } from "lucide-react";

import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";

type EmptyStateProps = {
  onPromptClick: (text: string) => void;
};

const suggestedPrompts = [
  {
    label: "Create a follow-up task",
    prompt:
      "Create a high-priority task titled Follow up with Acme about the proposal.",
  },
  {
    label: "Add a documentation task",
    prompt:
      "Create a Medium priority documentation task titled Update API reference for the auth endpoints.",
  },
] as const;

export function AssistantChatEmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <ConversationEmptyState>
      <div className="flex size-full flex-col items-center justify-center gap-6 px-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
          <Sparkles className="h-6 w-6 text-orange-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Billing copilot</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Create and organize tasks from natural language.
          </p>
        </div>
        <Suggestions className="max-w-full justify-center">
          {suggestedPrompts.map((item) => (
            <Suggestion
              key={item.label}
              onClick={onPromptClick}
              suggestion={item.prompt}
            >
              {item.label}
            </Suggestion>
          ))}
        </Suggestions>
      </div>
    </ConversationEmptyState>
  );
}
