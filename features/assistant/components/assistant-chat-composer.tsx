"use client";

import { GlobeIcon, Sparkles } from "lucide-react";

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/shared/components/ai-elements/attachments";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/shared/components/ai-elements/prompt-input";
import type { AiModelDefinition, AiModelId } from "@/shared/lib/ai/models";

type AssistantChatComposerProps = {
  isLoading: boolean;
  modelId: AiModelId;
  modelOptions: AiModelDefinition[];
  onModelChange: (modelId: AiModelId) => void;
  onSubmit: (message: PromptInputMessage) => void;
  status: "error" | "ready" | "streaming" | "submitted";
  stop: () => void;
};

function AssistantPromptAttachments() {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment
          data={file}
          key={file.id}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

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
      <PromptInputHeader>
        <AssistantPromptAttachments />
      </PromptInputHeader>

      <PromptInputBody>
        <PromptInputTextarea
          disabled={isLoading}
          placeholder={"Ask me to create a task or summarize what you need..."}
        />
      </PromptInputBody>

      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
              <PromptInputActionAddScreenshot />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>

          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Billing copilot
          </div>

          <div className="hidden items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground sm:flex">
            <GlobeIcon className="h-3.5 w-3.5" />
            Web off
          </div>

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
