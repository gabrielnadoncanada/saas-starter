import type { AssistantProvider } from "@/features/assistant/types";

export const assistantModels = [
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
] as const satisfies ReadonlyArray<{
  id: string;
  name: string;
  provider: AssistantProvider;
  providerLabel: string;
}>;

export function findAssistantModel(modelId?: string, provider?: string) {
  return assistantModels.find(
    (model) =>
      model.id === modelId &&
      (!provider || model.provider === provider)
  );
}
