"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { SendIcon, SparklesIcon, StopCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AgentCoachPanelProps = {
  agentId: string;
};

type ToolPart = Extract<
  UIMessage["parts"][number],
  { type: `tool-${string}` } | { type: "dynamic-tool" }
>;

const SUGGESTIONS = [
  {
    title: "Analyze this week's conversations",
    prompt:
      "Analyze the 15 most recent conversations. Identify patterns: repeated questions, refusals, hallucinations, and places where the bot could have done better. Give me 3 concrete actions I could take (correction, prompt update, new knowledge doc).",
  },
  {
    title: "Cluster my corrections",
    prompt:
      "List all my corrections, group them by theme (pricing, dimensions, delivery, warranty, etc.), and tell me which clusters are big enough that I should bake the rule into the system prompt instead of relying on few-shot examples.",
  },
  {
    title: "Propose a prompt update",
    prompt:
      "Based on my active corrections and the last 10 conversations, propose an improved system prompt. Show me the diff and explain what you changed. Create it as a draft (not active).",
  },
  {
    title: "Why did the bot answer that?",
    prompt:
      "Pick the most recent conversation where the bot seemed to hallucinate or refuse incorrectly, and use explainMessage to walk me through what happened — which prompt version, which preceding messages influenced the answer.",
  },
  {
    title: "Promote corrections to eval cases",
    prompt:
      "List my 5 most valuable active corrections, then create an eval case for each one so I have regression tests when I update the prompt.",
  },
];

function isToolPart(
  part: UIMessage["parts"][number],
): part is ToolPart {
  return (
    (typeof part.type === "string" && part.type.startsWith("tool-")) ||
    part.type === "dynamic-tool"
  );
}

function getToolName(part: ToolPart): string {
  if (part.type === "dynamic-tool") {
    return "toolName" in part && typeof part.toolName === "string"
      ? part.toolName
      : "tool";
  }
  return part.type.replace(/^tool-/, "");
}

export function AgentCoachPanel({ agentId }: AgentCoachPanelProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);
  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport({
      api: `/api/coach/${agentId}`,
    });
  }

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    transport: transportRef.current,
    onFinish: () => {
      // After every turn, refresh so other tabs (Corrections, Versions, Evals)
      // show any data written by coach tools.
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Coach request failed");
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  return (
    <div className="mt-4 flex h-[75vh] flex-col rounded-md border">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <span className="text-sm font-semibold">Agent Coach</span>
          <span className="text-muted-foreground text-xs">
            reads your data, proposes corrections and prompt updates
          </span>
        </div>
        {messages.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            disabled={isStreaming}
          >
            New chat
          </Button>
        ) : null}
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<SparklesIcon className="size-8" />}
              title="What do you want to improve today?"
              description="Ask in plain language. The coach can read conversations, corrections, evals, and knowledge, and propose concrete changes."
            >
              <div className="mt-4 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => submit(s.prompt)}
                    className="rounded-md border p-3 text-left text-sm transition hover:bg-muted"
                  >
                    <div className="font-medium">{s.title}</div>
                    <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {s.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      );
                    }
                    if (isToolPart(part)) {
                      const name = getToolName(part);
                      const input =
                        "input" in part ? part.input : undefined;
                      const output =
                        "output" in part ? part.output : undefined;
                      const errorText =
                        "errorText" in part && part.errorText
                          ? String(part.errorText)
                          : undefined;
                      return (
                        <Tool key={i}>
                          {part.type === "dynamic-tool" ? (
                            <ToolHeader
                              type="dynamic-tool"
                              state={part.state}
                              toolName={name}
                            />
                          ) : (
                            <ToolHeader
                              type={part.type}
                              state={part.state}
                            />
                          )}
                          <ToolContent>
                            {input !== undefined ? (
                              <ToolInput input={input} />
                            ) : null}
                            {output !== undefined || errorText ? (
                              <ToolOutput
                                output={
                                  output !== undefined ? (
                                    <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap">
                                      {typeof output === "string"
                                        ? output
                                        : JSON.stringify(output, null, 2)}
                                    </pre>
                                  ) : null
                                }
                                errorText={errorText}
                              />
                            ) : null}
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {error ? (
            <div className="mx-auto max-w-2xl rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {error.message}
            </div>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form onSubmit={onSubmit} className="border-t p-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the coach to analyze, suggest corrections, propose a prompt update…"
            disabled={isStreaming}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            className="resize-none"
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => stop()}
            >
              <StopCircleIcon className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isStreaming}
            >
              <SendIcon className="size-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mt-2 text-center text-[10px]">
          Coach can write to your corrections, evals, and prompt drafts.
          Destructive actions are gated by confirmation.
        </p>
      </form>
    </div>
  );
}
