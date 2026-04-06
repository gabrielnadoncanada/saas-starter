import "server-only";

import { safeValidateUIMessages, type UIMessage } from "ai";
import { z } from "zod";

const bodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
});

export async function parseAssistantMessagesBody(
  body: unknown,
): Promise<
  { ok: true; messages: UIMessage[] } | { ok: false; error: string }
> {
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Conversation messages are required." };
  }

  const validated = await safeValidateUIMessages({
    messages: parsed.data.messages,
  });

  if (!validated.success) {
    return { ok: false, error: "Invalid conversation messages." };
  }

  return { ok: true, messages: validated.data };
}
