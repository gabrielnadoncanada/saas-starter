import { google } from "@ai-sdk/google";

import type { AiModelId } from "@/lib/ai/models";

function readGoogleApiKey() {
  const value = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

  if (!value) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  return value;
}

export function getGoogleModel(modelId: AiModelId) {
  readGoogleApiKey();
  return google(modelId);
}
