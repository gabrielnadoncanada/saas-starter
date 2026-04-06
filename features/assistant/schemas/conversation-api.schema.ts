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

export const assistantConversationSchema =
  assistantConversationListItemSchema.extend({
    messages: z.array(z.unknown()),
  });

export type AssistantConversation = Omit<
  z.infer<typeof assistantConversationSchema>,
  "messages"
> & {
  messages: import("ai").UIMessage[];
};
