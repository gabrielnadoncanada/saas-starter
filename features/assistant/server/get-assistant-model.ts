import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

import {
  assistantModels,
  findAssistantModel,
} from "@/features/assistant/models";
import type { AssistantProvider } from "@/features/assistant/types";

function readRequiredEnv(
  name: "GOOGLE_GENERATIVE_AI_API_KEY" | "GROQ_API_KEY",
) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export function getAssistantProvider(): AssistantProvider {
  const provider = process.env.AI_PROVIDER?.trim() || "google";

  if (provider === "google" || provider === "groq") {
    return provider;
  }

  throw new Error('AI_PROVIDER must be "google" or "groq"');
}

export function getAssistantModel(selection?: {
  modelId?: string;
  provider?: string;
}) {
  const fallbackProvider = getAssistantProvider();
  const selectedModel =
    findAssistantModel(selection?.modelId, selection?.provider) ||
    assistantModels.find((model) => model.provider === fallbackProvider);

  if (!selectedModel) {
    throw new Error(
      "No assistant model is configured for the selected provider",
    );
  }

  if (selectedModel.provider === "groq") {
    readRequiredEnv("GROQ_API_KEY");
    return {
      provider: selectedModel.provider,
      modelId: selectedModel.id,
      model: groq(selectedModel.id),
    };
  }

  readRequiredEnv("GOOGLE_GENERATIVE_AI_API_KEY");

  return {
    provider: selectedModel.provider,
    modelId: selectedModel.id,
    model: google(selectedModel.id),
  };
}
