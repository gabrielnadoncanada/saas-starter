import { groq } from "@ai-sdk/groq";

import type { AiModelId } from "@/shared/lib/ai/models";

function readGroqApiKey() {
  const value = process.env.GROQ_API_KEY?.trim();

  if (!value) {
    throw new Error("GROQ_API_KEY is not set");
  }

  return value;
}

export function getGroqModel(modelId: AiModelId) {
  readGroqApiKey();
  return groq(modelId);
}
