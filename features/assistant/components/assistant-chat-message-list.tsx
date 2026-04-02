"use client";

import type { UIMessage } from "ai";
import { useTranslations } from "next-intl";

import { AssistantToolResult } from "@/features/assistant/components/assistant-tool-result";
import { AssistantChatEmptyState } from "@/features/assistant/components/assistant-chat-empty-state";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/shared/components/ai-elements/message";
import { Spinner } from "@/shared/components/ui/spinner";

export function AssistantChatMessageList({
  error,
  isLoading,
  messages,
  onPromptClick,
}: {
  error: Error | undefined;
  isLoading: boolean;
  messages: UIMessage[];
  onPromptClick: (text: string) => void;
}) {
  const t = useTranslations("assistant");

  if (messages.length === 0 && !error) {
    return <AssistantChatEmptyState onPromptClick={onPromptClick} />;
  }

  return (
    <>
      {messages.map((message) => (
        <Message from={message.role} key={message.id}>
          <MessageContent>
            {message.parts.map((part, index) => {
              if (part.type === "text" && part.text) {
                return (
                  <MessageResponse key={`${message.id}-${index}`}>
                    {part.text}
                  </MessageResponse>
                );
              }

              if (part.type.startsWith("tool-")) {
                const toolPart = part as {
                  output?: unknown;
                  state?: string;
                  type: string;
                };

                return (
                  <AssistantToolResult
                    done={
                      toolPart.state === "output-available" ||
                      toolPart.state === "output-error"
                    }
                    key={`${message.id}-${index}`}
                    output={toolPart.output}
                    toolName={toolPart.type.replace("tool-", "")}
                  />
                );
              }

              return null;
            })}
          </MessageContent>
        </Message>
      ))}

      {isLoading && messages[messages.length - 1]?.role !== "assistant" ? (
        <Message from="assistant">
          <MessageContent className="rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              <span>{t("chat.working")}</span>
            </div>
          </MessageContent>
        </Message>
      ) : null}
    </>
  );
}
