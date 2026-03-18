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
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  createAssistantConversationRequest,
  replaceAssistantConversationRequest,
} from "@/features/assistant/client/conversations";
import { AssistantEmptyState } from "@/features/assistant/components/AssistantEmptyState";
import { AssistantErrorState } from "@/features/assistant/components/AssistantErrorState";
import { AssistantModelSelector } from "@/features/assistant/components/AssistantModelSelector";
import { AssistantToolResult } from "@/features/assistant/components/AssistantToolResult";
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
  const conversationIdRef = useRef<string | null>(conversationId);
  const onConversationCreatedRef = useRef(onConversationCreated);
  const onConversationUpdatedRef = useRef(onConversationUpdated);
  const selectedModelRef = useRef<(typeof assistantModels)[number]>(
    assistantModels[0]
  );
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const selectedModel = selectedModelRef.current;
          const currentConversationId = conversationIdRef.current;

          if (currentConversationId) {
            const conversation = await replaceAssistantConversationRequest(
              currentConversationId,
              messages
            );
            onConversationUpdatedRef.current(conversation);

            return {
              body: {
                ...body,
                conversationId: currentConversationId,
                modelId: selectedModel.id,
                provider: selectedModel.provider,
              },
            };
          }

          const conversation = await createAssistantConversationRequest(messages);
          conversationIdRef.current = conversation.id;
          onConversationCreatedRef.current(conversation);

          return {
            body: {
              ...body,
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
        if (isAbort || isDisconnect || isError || !conversationIdRef.current) {
          return;
        }

        void replaceAssistantConversationRequest(
          conversationIdRef.current,
          nextMessages
        ).then((conversation) => {
          onConversationUpdatedRef.current(conversation);
        });
      },
      transport,
    });

  const isLoading = status === "streaming" || status === "submitted";
  const selectedModel =
    assistantModels.find((model) => model.id === modelId) ?? assistantModels[0];

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    onConversationCreatedRef.current = onConversationCreated;
  }, [onConversationCreated]);

  useEffect(() => {
    onConversationUpdatedRef.current = onConversationUpdated;
  }, [onConversationUpdated]);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  useEffect(() => {
    stop();
    clearError();
    setMessages(initialMessages);
  }, [clearError, initialMessages, resetKey, setMessages, stop]);

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
