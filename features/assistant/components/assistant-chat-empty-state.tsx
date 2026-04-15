"use client";

import { ArrowUpRight, BarChart3, ListChecks, Sparkles } from "lucide-react";

import { ConversationEmptyState } from "@/components/ai-elements/conversation";

type EmptyStateProps = {
  onPromptClick: (text: string) => void;
};

type SuggestedPrompt = {
  icon: typeof Sparkles;
  label: string;
  hint: string;
  prompt: string;
};

const suggestedPrompts: SuggestedPrompt[] = [
  {
    icon: ListChecks,
    label: "Create a follow-up task",
    hint: "High priority · assigned to me",
    prompt:
      "Create a high-priority task titled Follow up with Acme about the proposal.",
  },
  {
    icon: ListChecks,
    label: "Draft a documentation task",
    hint: "Medium priority · docs",
    prompt:
      "Create a Medium priority documentation task titled Update API reference for the auth endpoints.",
  },
  {
    icon: BarChart3,
    label: "Chart my open tasks by status",
    hint: "Grouped bar chart",
    prompt: "Generate a bar chart of my open tasks by status.",
  },
];

export function AssistantChatEmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <ConversationEmptyState className="p-0">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12 text-left">
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center border border-brand/30 bg-brand/10 text-brand">
            <Sparkles className="size-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 space-y-1.5">
            <span className="label-mono block">Assistant · ready</span>
            <h3 className="text-2xl font-semibold tracking-[-0.01em]">
              What should we ship next?
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Ask in plain language — I can create tasks, group your backlog,
              and chart workspace activity.
            </p>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="label-mono">Suggested prompts</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {String(suggestedPrompts.length).padStart(2, "0")}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {suggestedPrompts.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onPromptClick(item.prompt)}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <Icon
                      className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
                      strokeWidth={1.75}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.hint}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="size-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                      strokeWidth={1.75}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </ConversationEmptyState>
  );
}
