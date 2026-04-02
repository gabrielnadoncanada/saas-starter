"use client";

import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/shared/components/ai-elements/model-selector";
import { PromptInputButton } from "@/shared/components/ai-elements/prompt-input";
import type { AiModelId, AiModelOption } from "@/shared/lib/ai/models";

type AssistantModelSelectorProps = {
  modelId: AiModelId;
  modelOptions: AiModelOption[];
  onOpenChange: (open: boolean) => void;
  onSelect: (modelId: AiModelId) => void;
  open: boolean;
};

export function AssistantModelSelector({
  modelId,
  modelOptions,
  onOpenChange,
  onSelect,
  open,
}: AssistantModelSelectorProps) {
  const t = useTranslations("assistant");
  const selectedModel =
    modelOptions.find((model) => model.id === modelId) ?? modelOptions[0];

  return (
    <ModelSelector onOpenChange={onOpenChange} open={open}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton className="max-w-[15rem]" size="sm">
          <ModelSelectorLogo provider={selectedModel.provider} />
          <ModelSelectorName>{selectedModel.name}</ModelSelectorName>
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder={t("modelSelector.searchPlaceholder")} />
        <ModelSelectorList>
          <ModelSelectorEmpty>{t("modelSelector.noModels")}</ModelSelectorEmpty>
          {["Google", "Groq"].map((providerLabel) => (
            <ModelSelectorGroup heading={providerLabel} key={providerLabel}>
              {modelOptions
                .filter((model) => model.providerLabel === providerLabel)
                .map((model) => (
                  <ModelSelectorItem
                    key={model.id}
                    onSelect={() => {
                      onSelect(model.id);
                      onOpenChange(false);
                    }}
                    value={model.id}
                  >
                    <ModelSelectorLogo provider={model.provider} />
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                    {model.id === modelId ? (
                      <CheckIcon className="ml-auto size-4" />
                    ) : (
                      <span className="ml-auto size-4" />
                    )}
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
