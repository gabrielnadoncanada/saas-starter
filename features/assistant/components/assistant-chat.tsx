"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { GlobeIcon, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  createAssistantConversationRequest,
  replaceAssistantConversationRequest,
} from "@/features/assistant/client/conversations";
import { AssistantChatErrorState } from "@/features/assistant/components/assistant-chat-error-state";
import { AssistantChatMessageList } from "@/features/assistant/components/assistant-chat-message-list";
import { AssistantModelSelector } from "@/features/assistant/components/assistant-model-selector";
import type { AssistantConversation } from "@/features/assistant/types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/shared/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/shared/components/ai-elements/prompt-input";
import type { AiModelId, AiModelOption } from "@/shared/lib/ai/models";

type AssistantChatProps = {
  conversationId: string | null;
  defaultModelId: AiModelId;
  initialMessages: UIMessage[];
  modelOptions: AiModelOption[];
  onConversationCreated: (conversation: AssistantConversation) => void;
  onConversationUpdated: (conversation: AssistantConversation) => void;
  resetKey: number;
};

export function AssistantChat({
  conversationId,
  defaultModelId,
  initialMessages,
  modelOptions,
  onConversationCreated,
  onConversationUpdated,
  resetKey,
}: AssistantChatProps) {
  const [modelId, setModelId] = useState<AiModelId>(defaultModelId);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const selectedModel =
    modelOptions.find((model) => model.id === modelId) ?? modelOptions[0];

  if (!selectedModel) {
    throw new Error("AssistantChat requires at least one AI model option.");
  }

  const stateRef = useRef({
    conversationId,
    initialMessages,
    modelId: selectedModel.id,
    onConversationCreated,
    onConversationUpdated,
  });

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const {
            conversationId: currentConversationId,
            modelId: nextModelId,
          } = stateRef.current;

          if (currentConversationId) {
            const conversation = await replaceAssistantConversationRequest(
              currentConversationId,
              messages,
            );
            stateRef.current.onConversationUpdated(conversation);

            return {
              body: {
                ...body,
                messages,
                conversationId: currentConversationId,
                modelId: nextModelId,
              },
            };
          }

          const conversation =
            await createAssistantConversationRequest(messages);
          stateRef.current.conversationId = conversation.id;
          stateRef.current.onConversationCreated(conversation);

          return {
            body: {
              ...body,
              messages,
              conversationId: conversation.id,
              modelId: nextModelId,
            },
          };
        },
      }),
  );
  const {
    clearError,
    error,
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
  } = useChat({
    onFinish: ({ isAbort, isDisconnect, isError, messages: nextMessages }) => {
      if (
        isAbort ||
        isDisconnect ||
        isError ||
        !stateRef.current.conversationId
      ) {
        return;
      }

      void replaceAssistantConversationRequest(
        stateRef.current.conversationId,
        nextMessages,
      ).then((conversation) => {
        stateRef.current.onConversationUpdated(conversation);
      });
    },
    transport,
  });

  useEffect(() => {
    if (!modelOptions.some((model) => model.id === modelId)) {
      setModelId(defaultModelId);
    }
  }, [defaultModelId, modelId, modelOptions]);

  useEffect(() => {
    stateRef.current.conversationId = conversationId;
    stateRef.current.initialMessages = initialMessages;
    stateRef.current.modelId = selectedModel.id;
    stateRef.current.onConversationCreated = onConversationCreated;
    stateRef.current.onConversationUpdated = onConversationUpdated;
  }, [
    conversationId,
    initialMessages,
    onConversationCreated,
    onConversationUpdated,
    selectedModel.id,
  ]);

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

  const isLoading = status === "streaming" || status === "submitted";

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
      <div className="flex flex-1 flex-col overflow-hidden">
        <Conversation>
          <ConversationContent className="mx-auto w-full max-w-3xl gap-4 px-4 py-6">
            <AssistantChatMessageList
              error={error}
              isLoading={isLoading}
              messages={messages}
              onPromptClick={(text) =>
                sendAssistantMessage({ files: [], text })
              }
            />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error ? (
          <AssistantChatErrorState error={error} onDismiss={clearError} />
        ) : null}

        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <PromptInput className="w-full" onSubmit={sendAssistantMessage}>
            <PromptInputBody>
              <PromptInputTextarea
                disabled={isLoading}
                placeholder={
                  "Ask me to review the demo inbox, create a task, or draft an invoice..."
                }
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
                  modelOptions={modelOptions}
                  onOpenChange={setModelSelectorOpen}
                  onSelect={setModelId}
                  open={modelSelectorOpen}
                />
              </PromptInputTools>
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </PromptInputProvider>
  );
}
