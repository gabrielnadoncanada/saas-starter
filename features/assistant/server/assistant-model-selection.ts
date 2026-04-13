import "server-only";

import {
  aiModels,
  defaultAiModelId,
  getAiModelDefinition,
  isAiModelId,
} from "@/shared/lib/ai/models";

export class AssistantModelSelectionError extends Error {
  code: "UNKNOWN_MODEL";

  constructor(message: string) {
    super(message);
    this.code = "UNKNOWN_MODEL";
  }
}

export async function selectAssistantModel(
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
    allowedModels: [...aiModels],
  };
}
