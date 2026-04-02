import type { AiConversationSurface } from "@/features/ai/types/ai.types";

export const aiConversationSurfaces = {
  assistant: "assistant",
} as const satisfies Record<string, AiConversationSurface>;
