"use client";

import { ConversationEmptyState } from "@/shared/components/ai-elements/conversation";
import { Button } from "@/shared/components/ui/button";
import { FileText, Mail, Sparkles } from "lucide-react";

const suggestedPrompts = [
  {
    icon: Mail,
    label: "Review the demo inbox",
    prompt:
      "Review the demo inbox and suggest tasks for today based on emails that need action.",
  },
  {
    icon: FileText,
    label: "Draft an invoice",
    prompt:
      "Draft an invoice for Acme Corp for 10 hours of consulting at $150/hour, due in 30 days.",
  },
];

type AssistantEmptyStateProps = {
  onPromptClick: (text: string) => void;
};

export function AssistantEmptyState({
  onPromptClick,
}: AssistantEmptyStateProps) {
  return (
    <ConversationEmptyState
      description="Review the demo inbox, create tasks, or draft invoices from natural language."
      icon={<Sparkles className="h-6 w-6 text-orange-500" />}
      title="AI-ready billing pattern"
    >
      <div className="flex size-full flex-col items-center justify-center gap-6 px-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
          <Sparkles className="h-6 w-6 text-orange-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">AI-ready billing pattern</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Review the demo inbox, create tasks, or draft invoices from natural
            language.
          </p>
        </div>
        <div className="grid w-full max-w-md gap-3">
          {suggestedPrompts.map((item) => (
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
