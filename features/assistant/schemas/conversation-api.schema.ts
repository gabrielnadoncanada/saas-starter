import { z } from "zod";

export const assistantConversationListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  preview: z.string().nullable(),
  lastMessageAt: z.string(),
});

export const assistantConversationListSchema = z.array(
  assistantConversationListItemSchema,
);

export const assistantConversationSchema = assistantConversationListItemSchema.extend(
  {
    messages: z.array(z.unknown()),
  },
);
