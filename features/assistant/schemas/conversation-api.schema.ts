import type { UIMessage } from "ai";
import { z } from "zod";

export const assistantConversationListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  preview: z.string().nullable(),
  lastMessageAt: z.string(),
});

export type AssistantConversationListItem = z.infer<
  typeof assistantConversationListItemSchema
>;

export const assistantConversationListSchema = z.array(
  assistantConversationListItemSchema,
);

// Only validates the conversation envelope. Messages are validated separately
// with `safeValidateUIMessages` from the AI SDK (see
// `features/assistant/client/assistant-conversations-api.ts` and
// `features/assistant/server/handle-assistant-request.ts`).
export const assistantConversationEnvelopeSchema =
  assistantConversationListItemSchema;

export type AssistantConversation = AssistantConversationListItem & {
  messages: UIMessage[];
};
