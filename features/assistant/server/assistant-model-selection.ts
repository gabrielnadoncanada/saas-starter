import "server-only";

import { getOrganizationAiSettings } from "@/features/assistant/server/organization-ai-settings";
import {
  getAiModelDefinition,
  getAiModelOptions,
  isAiModelId,
} from "@/shared/lib/ai/models";

export class AssistantModelSelectionError extends Error {
  code: "MODEL_NOT_ALLOWED" | "UNKNOWN_MODEL";

  constructor(code: "MODEL_NOT_ALLOWED" | "UNKNOWN_MODEL", message: string) {
    super(message);
    this.code = code;
  }
}

export async function resolveOrganizationAssistantModelSelection(
  organizationId: string,
  requestedModelId?: string,
) {
  const settings = await getOrganizationAiSettings(organizationId);
  const modelId = requestedModelId ?? settings.defaultModelId;

  if (!isAiModelId(modelId)) {
    throw new AssistantModelSelectionError(
      "UNKNOWN_MODEL",
      `Unknown AI model: ${modelId}`,
    );
  }

  if (!settings.allowedModelIds.includes(modelId)) {
    throw new AssistantModelSelectionError(
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
