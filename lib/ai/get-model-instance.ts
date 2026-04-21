import "server-only";

import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

import { getAiModelDefinition, type AiModelId } from "@/lib/ai/models";

export function getAiModelInstance(modelId: AiModelId) {
  const definition = getAiModelDefinition(modelId);
  const model = definition.provider === "groq" ? groq(modelId) : google(modelId);
  return { definition, model };
}
