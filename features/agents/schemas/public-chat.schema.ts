import { z } from "zod";

export const publicChatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1),
  conversationId: z.string().min(1).max(64).optional(),
  visitorId: z.string().min(1).max(120).optional(),
  pageUrl: z.string().url().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  locale: z.string().max(16).optional(),
});

export const messageFeedbackSchema = z.object({
  conversationId: z.string().min(1).max(64),
  messageId: z.string().min(1).max(120),
  rating: z.union([z.literal(-1), z.literal(1)]),
  reason: z.string().trim().max(500).optional(),
});

export const takeOverConversationSchema = z.object({
  conversationId: z.string().min(1),
});

export const sendHumanReplySchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().trim().min(1).max(10_000),
});

export const createCorrectionSchema = z.object({
  conversationId: z.string().min(1),
  messageId: z.string().min(1).max(120),
  correctedMessage: z.string().trim().min(1).max(10_000),
  useAsExample: z.boolean().default(true),
});
