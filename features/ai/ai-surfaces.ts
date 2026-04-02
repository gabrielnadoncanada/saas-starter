import type { AiConversationSurface } from "@/features/ai/types/ai.types";

// Keep shared conversation surfaces here while there is only one assistant UI.
// Add a second entry only when a new chat surface needs its own conversation history.
export const aiConversationSurfaces = {
  assistant: "assistant",
} as const satisfies Record<string, AiConversationSurface>;
