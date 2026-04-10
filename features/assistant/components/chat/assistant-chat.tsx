"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

import {
  createAssistantConversationRequest,
  replaceAssistantConversationRequest,
} from "@/features/assistant/client/assistant-conversations-api";
import { AssistantChatComposer } from "@/features/assistant/components/chat/assistant-chat-composer";
import { AssistantChatErrorState } from "@/features/assistant/components/chat/assistant-chat-error-state";
import { AssistantChatMessageList } from "@/features/assistant/components/chat/assistant-chat-message-list";
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

type AssistantChatState = {
  conversationId: string | null;
  modelId: AiModelId;
  onConversationCreated: (conversation: AssistantConversation) => void;
  onConversationUpdated: (conversation: AssistantConversation) => void;
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
    modelOptions.find((model) => model.id === modelId)?.id ??
    modelOptions[0]?.id;

  if (!selectedModelId) {
    throw new Error("AssistantChat requires at least one AI model option.");
  }

  const chatStateRef = useRef<AssistantChatState>({
    conversationId,
    modelId: selectedModelId,
    onConversationCreated,
    onConversationUpdated,
  });
  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);

  const syncConversation = async (messages: UIMessage[]) => {
    const currentState = chatStateRef.current;

    if (currentState.conversationId) {
      const conversation = await replaceAssistantConversationRequest(
        currentState.conversationId,
        messages,
      );
      currentState.onConversationUpdated(conversation);

      return conversation.id;
    }

    const conversation = await createAssistantConversationRequest(messages);
    chatStateRef.current.conversationId = conversation.id;
    currentState.onConversationCreated(conversation);

    return conversation.id;
  };

  if (!transportRef.current) {
    transportRef.current = new DefaultChatTransport({
      api: "/api/assistant",
      prepareSendMessagesRequest: async ({ messages, body }) => {
        const nextConversationId = await syncConversation(messages);

        return {
          body: {
            ...body,
            messages,
            conversationId: nextConversationId,
            modelId: chatStateRef.current.modelId,
          },
        };
      },
    });
  }
  const {
    clearError,
    error,
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
  } = useChat({
    messages: initialMessages,
    onFinish: ({ isAbort, isDisconnect, isError, messages: nextMessages }) => {
      const currentConversationId = chatStateRef.current.conversationId;

      if (isAbort || isDisconnect || isError || !currentConversationId) {
        return;
      }

      void replaceAssistantConversationRequest(
        currentConversationId,
        nextMessages,
      ).then((conversation) => {
        chatStateRef.current.onConversationUpdated(conversation);
      });
    },
    transport: transportRef.current,
  });

  useEffect(() => {
    if (!modelOptions.some((model) => model.id === modelId)) {
      setModelId(defaultModelId);
    }
  }, [defaultModelId, modelId, modelOptions]);

  useEffect(() => {
    chatStateRef.current = {
      conversationId,
      modelId: selectedModelId,
      onConversationCreated,
      onConversationUpdated,
    };
  }, [
    conversationId,
    onConversationCreated,
    onConversationUpdated,
    selectedModelId,
  ]);

  useEffect(() => {
    if (resetKey === 0) {
      return;
    }

    stop();
    clearError();
    setMessages(initialMessages);
  }, [clearError, initialMessages, resetKey, setMessages, stop]);

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
    <div className="flex flex-1 flex-col">
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

      <div className="mx-auto w-full max-w-3xl px-4 pb-4 sticky bottom-0 bg-background">
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
