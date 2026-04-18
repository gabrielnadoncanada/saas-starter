import { openai } from "@ai-sdk/openai";

function readOpenAiApiKey() {
  const value = process.env.OPENAI_API_KEY?.trim();

  if (!value) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return value;
}

export function hasOpenAi(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAiChatModel(modelId: string) {
  readOpenAiApiKey();
  return openai(modelId);
}

export function getOpenAiEmbeddingModel(
  modelId: "text-embedding-3-small" | "text-embedding-3-large" = "text-embedding-3-small",
) {
  readOpenAiApiKey();
  return openai.textEmbeddingModel(modelId);
}
