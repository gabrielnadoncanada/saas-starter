export type AiProviderId = "google" | "groq";

export type AiModelId = "gemini-2.5-flash" | "llama-3.1-8b-instant";

export type AiModelDefinition = {
  id: AiModelId;
  name: string;
  provider: AiProviderId;
  providerLabel: string;
};

export const aiModels = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    providerLabel: "Google",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    provider: "groq",
    providerLabel: "Groq",
  },
] as const satisfies ReadonlyArray<AiModelDefinition>;

export const defaultAiModelId: AiModelId = aiModels[0].id;

const aiModelsById = Object.fromEntries(
  aiModels.map((model) => [model.id, model]),
) as Record<AiModelId, AiModelDefinition>;

export function isAiModelId(value: string): value is AiModelId {
  return Object.hasOwn(aiModelsById, value);
}

export function getAiModelDefinition(modelId: AiModelId): AiModelDefinition {
  return aiModelsById[modelId];
}

