import "server-only";

import type { AiModelId } from "@/lib/ai/models";
import { getAiModelDefinition } from "@/lib/ai/models";

import { getGoogleModel } from "./providers/google";
import { getGroqModel } from "./providers/groq";

export function getAiModelInstance(modelId: AiModelId) {
  const definition = getAiModelDefinition(modelId);

  if (definition.provider === "groq") {
    return {
      definition,
      model: getGroqModel(modelId),
    };
  }

  return {
    definition,
    model: getGoogleModel(modelId),
  };
}
