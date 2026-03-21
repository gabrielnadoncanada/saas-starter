"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { GlobeIcon, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/shared/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/shared/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/shared/components/ai-elements/prompt-input";
import {
  createAssistantConversationRequest,
  replaceAssistantConversationRequest,
} from "@/features/assistant/client/conversations";
import { AssistantEmptyState } from "@/features/assistant/components/assistant-empty-state";
import { AssistantErrorState } from "@/features/assistant/components/assistant-error-state";
import { AssistantModelSelector } from "@/features/assistant/components/assistant-model-selector";
import { AssistantToolResult } from "@/features/assistant/components/assistant-tool-result";
import { assistantModels } from "@/features/assistant/models";
import type { AssistantConversation } from "@/features/assistant/types";
import { Spinner } from "@/shared/components/ui/spinner";

type AssistantChatProps = {
  conversationId: string | null;
  initialMessages: UIMessage[];
  onConversationCreated: (conversation: AssistantConversation) => void;
  onConversationUpdated: (conversation: AssistantConversation) => void;
  resetKey: number;
};

export function AssistantChat({
  conversationId,
  initialMessages,
  onConversationCreated,
  onConversationUpdated,
  resetKey,
}: AssistantChatProps) {
  const [modelId, setModelId] = useState<string>(assistantModels[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const stateRef = useRef({
    conversationId,
    initialMessages,
    onConversationCreated,
    onConversationUpdated,
    selectedModel: assistantModels[0] as (typeof assistantModels)[number],
  });

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const { selectedModel, conversationId: currentConversationId } = stateRef.current;

          if (currentConversationId) {
            const conversation = await replaceAssistantConversationRequest(
              currentConversationId,
              messages
            );
            stateRef.current.onConversationUpdated(conversation);

            return {
              body: {
                ...body,
                messages,
                conversationId: currentConversationId,
                modelId: selectedModel.id,
                provider: selectedModel.provider,
              },
            };
          }

          const conversation = await createAssistantConversationRequest(messages);
          stateRef.current.conversationId = conversation.id;
          stateRef.current.onConversationCreated(conversation);

          return {
            body: {
              ...body,
              messages,
              conversationId: conversation.id,
              modelId: selectedModel.id,
              provider: selectedModel.provider,
            },
          };
        },
      })
  );
  const { clearError, error, messages, sendMessage, setMessages, status, stop } =
    useChat({
      onFinish: ({ isAbort, isDisconnect, isError, messages: nextMessages }) => {
        if (isAbort || isDisconnect || isError || !stateRef.current.conversationId) {
          return;
        }

        void replaceAssistantConversationRequest(
          stateRef.current.conversationId,
          nextMessages
        ).then((conversation) => {
          stateRef.current.onConversationUpdated(conversation);
        });
      },
      transport,
    });

  const isLoading = status === "streaming" || status === "submitted";
  const selectedModel =
    assistantModels.find((model) => model.id === modelId) ?? assistantModels[0];

  useEffect(() => {
    stateRef.current.conversationId = conversationId;
    stateRef.current.initialMessages = initialMessages;
    stateRef.current.onConversationCreated = onConversationCreated;
    stateRef.current.onConversationUpdated = onConversationUpdated;
    stateRef.current.selectedModel = selectedModel;
  });

  useEffect(() => {
    clearError();
    setMessages(stateRef.current.initialMessages);
  }, [clearError, setMessages]);

  useEffect(() => {
    if (resetKey === 0) {
      return;
    }

    stop();
    clearError();
    setMessages(stateRef.current.initialMessages);
  }, [clearError, resetKey, setMessages, stop]);

  const sendAssistantMessage = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if ((!text && message.files.length === 0) || isLoading) {
      return;
    }

    clearError();
    sendMessage({
      files: message.files,
      text: text || "Sent with attachments",
    });
  };

  return (
    <PromptInputProvider>
      <div className="flex h-[calc(100vh-10rem)] min-h-[36rem] flex-col gap-3">
        <Conversation className="rounded-lg border bg-background">
          <ConversationContent className="gap-4 p-4">
            {messages.length === 0 && !error ? (
              <AssistantEmptyState
                onPromptClick={(text) => sendAssistantMessage({ files: [], text })}
              />
            ) : (
              messages.map((message) => (
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
              ))
            )}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" ? (
              <Message from="assistant">
                <MessageContent className="rounded-lg border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    <span>Working...</span>
                  </div>
                </MessageContent>
              </Message>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error ? <AssistantErrorState error={error} onDismiss={clearError} /> : null}

        <PromptInput className="w-full" onSubmit={sendAssistantMessage}>
          <PromptInputBody>
            <PromptInputTextarea
              disabled={isLoading}
              placeholder="Ask me to review the demo inbox, create a task, or draft an invoice..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                Billing copilot
              </div>
              <div className="hidden items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground sm:flex">
                <GlobeIcon className="h-3.5 w-3.5" />
                Web off
              </div>
              <AssistantModelSelector
                modelId={modelId}
                onOpenChange={setModelSelectorOpen}
                onSelect={setModelId}
                open={modelSelectorOpen}
              />
            </PromptInputTools>
            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </PromptInputProvider>
  );
}
