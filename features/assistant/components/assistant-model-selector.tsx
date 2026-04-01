"use client";

import { CheckIcon } from "lucide-react";

import { assistantModels } from "@/features/assistant/models";
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

type AssistantModelSelectorProps = {
  modelId: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (modelId: string) => void;
  open: boolean;
};

export function AssistantModelSelector({
  modelId,
  onOpenChange,
  onSelect,
  open,
}: AssistantModelSelectorProps) {
  const selectedModel =
    assistantModels.find((model) => model.id === modelId) ?? assistantModels[0];

  return (
    <ModelSelector onOpenChange={onOpenChange} open={open}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton className="max-w-[15rem]" size="sm">
          <ModelSelectorLogo provider={selectedModel.provider} />
          <ModelSelectorName>{selectedModel.name}</ModelSelectorName>
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {["Google", "Groq"].map((providerLabel) => (
            <ModelSelectorGroup heading={providerLabel} key={providerLabel}>
              {assistantModels
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
