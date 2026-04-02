import "server-only";

import { AiModelSelectionError } from "@/features/ai/server/model-selection-error";
import { getOrganizationAiSettings } from "@/features/ai/server/organization-ai-settings";
import {
  getAiModelDefinition,
  getAiModelOptions,
  isAiModelId,
} from "@/shared/lib/ai/models";

export async function resolveOrganizationModelSelection(
  organizationId: string,
  requestedModelId?: string,
) {
  const settings = await getOrganizationAiSettings(organizationId);
  const modelId = requestedModelId ?? settings.defaultModelId;

  if (!isAiModelId(modelId)) {
    throw new AiModelSelectionError(
      "UNKNOWN_MODEL",
      `Unknown AI model: ${modelId}`,
    );
  }

  if (!settings.allowedModelIds.includes(modelId)) {
    throw new AiModelSelectionError(
      "MODEL_NOT_ALLOWED",
      "This AI model is not allowed for the current organization.",
    );
  }

  return {
    model: getAiModelDefinition(modelId),
    defaultModelId: settings.defaultModelId,
    allowedModels: getAiModelOptions(settings.allowedModelIds),
  };
}
