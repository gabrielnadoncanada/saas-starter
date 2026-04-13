"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import type { AiModelDefinition, AiModelId } from "@/lib/ai/models";

type AssistantChatComposerProps = {
  isLoading: boolean;
  modelId: AiModelId;
  modelOptions: AiModelDefinition[];
  onModelChange: (modelId: AiModelId) => void;
  onSubmit: (message: PromptInputMessage) => void;
  status: "error" | "ready" | "streaming" | "submitted";
  stop: () => void;
};

export function AssistantChatComposer({
  isLoading,
  modelId,
  modelOptions,
  onModelChange,
  onSubmit,
  status,
  stop,
}: AssistantChatComposerProps) {
  return (
    <PromptInput className="w-full" onSubmit={onSubmit}>
      <PromptInputBody>
        <PromptInputTextarea
          disabled={isLoading}
          placeholder={"Ask me to create a task or summarize what you need..."}
        />
      </PromptInputBody>

      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputSelect
            onValueChange={(value) => onModelChange(value as AiModelId)}
            value={modelId}
          >
            <PromptInputSelectTrigger className="max-w-[15rem]">
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>
              {modelOptions.map((model) => (
                <PromptInputSelectItem key={model.id} value={model.id}>
                  {`${model.name} · ${model.providerLabel}`}
                </PromptInputSelectItem>
              ))}
            </PromptInputSelectContent>
          </PromptInputSelect>
        </PromptInputTools>

        <PromptInputSubmit onStop={stop} status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}
