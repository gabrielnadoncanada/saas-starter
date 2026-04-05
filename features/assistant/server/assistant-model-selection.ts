import "server-only";

import {
  defaultAiModelId,
  getAiModelDefinition,
  getAiModelOptions,
  isAiModelId,
} from "@/shared/lib/ai/models";

export class AssistantModelSelectionError extends Error {
  code: "UNKNOWN_MODEL";

  constructor(message: string) {
    super(message);
    this.code = "UNKNOWN_MODEL";
  }
}

export async function resolveOrganizationAssistantModelSelection(
  _organizationId: string,
  requestedModelId?: string,
) {
  const modelId = requestedModelId ?? defaultAiModelId;

  if (!isAiModelId(modelId)) {
    throw new AssistantModelSelectionError(`Unknown AI model: ${modelId}`);
  }

  return {
    model: getAiModelDefinition(modelId),
    defaultModelId: defaultAiModelId,
    allowedModels: getAiModelOptions(),
  };
}
