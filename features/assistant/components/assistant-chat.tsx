"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

import {
  createAssistantConversationRequest,
  replaceAssistantConversationRequest,
} from "@/features/assistant/client/assistant-conversations-api";
import { AssistantChatComposer } from "@/features/assistant/components/assistant-chat-composer";
import { AssistantChatErrorState } from "@/features/assistant/components/assistant-chat-error-state";
import { AssistantChatMessageList } from "@/features/assistant/components/assistant-chat-message-list";
import type { AssistantConversation } from "@/features/assistant/schemas/conversation-api.schema";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/shared/components/ai-elements/conversation";
import { type PromptInputMessage } from "@/shared/components/ai-elements/prompt-input";
import type { AiModelDefinition, AiModelId } from "@/shared/lib/ai/models";

type AssistantChatProps = {
  conversationId: string | null;
  defaultModelId: AiModelId;
  initialMessages: UIMessage[];
  modelOptions: AiModelDefinition[];
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
  const selectedModelId =
    modelOptions.find((model) => model.id === modelId)?.id ?? modelOptions[0]?.id;

  if (!selectedModelId) {
    throw new Error("AssistantChat requires at least one AI model option.");
  }

  const stateRef = useRef({
    conversationId,
    initialMessages,
    modelId: selectedModelId,
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
    stateRef.current.modelId = selectedModelId;
    stateRef.current.onConversationCreated = onConversationCreated;
    stateRef.current.onConversationUpdated = onConversationUpdated;
  }, [
    conversationId,
    initialMessages,
    onConversationCreated,
    onConversationUpdated,
    selectedModelId,
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl gap-4 px-4 py-6">
          <AssistantChatMessageList
            error={error}
            isLoading={isLoading}
            messages={messages}
            onPromptClick={(text) => sendAssistantMessage({ files: [], text })}
          />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {error ? (
        <AssistantChatErrorState error={error} onDismiss={clearError} />
      ) : null}

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <AssistantChatComposer
          isLoading={isLoading}
          modelId={modelId}
          modelOptions={modelOptions}
          onModelChange={setModelId}
          onSubmit={sendAssistantMessage}
          status={status}
          stop={stop}
        />
      </div>
    </div>
  );
}
