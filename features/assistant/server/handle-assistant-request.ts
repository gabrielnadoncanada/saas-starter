import "server-only";

import {
  convertToModelMessages,
  isTextUIPart,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import {
  AssistantModelSelectionError,
  selectAssistantModel,
} from "@/features/assistant/server/assistant-model-selection";
import { assertOrganizationAiAccess } from "@/features/assistant/server/organization-ai-access";
import { assistantTools } from "@/features/assistant/server/tools";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/entitlements";
import { consumeMonthlyUsage } from "@/features/billing/server/usage-service";
import { getAiModelInstance } from "@/shared/lib/ai/get-model-instance";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 10_000;

const messagesBodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
});

export async function parseAssistantMessagesBody(
  body: unknown,
): Promise<
  { ok: true; messages: UIMessage[] } | { ok: false; error: string }
> {
  const parsed = messagesBodySchema.safeParse(body);
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

function optionalStringField(raw: unknown, key: string): string | undefined {
  if (raw === null || typeof raw !== "object" || !(key in raw)) {
    return undefined;
  }
  const v = (raw as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}

const SYSTEM_PROMPT = `You are a helpful business assistant integrated into a SaaS application.
You are operating inside an ongoing chat thread. The messages you receive already include the current conversation history for this thread, so use prior user and assistant messages as context when they are relevant.
You have access to workspace tools and should use them when the user asks for information or actions that the tools can provide.

Guidelines:
- Be concise and action-oriented.
- Do not claim that each interaction is independent or that you cannot access earlier messages in this thread unless the history is actually missing.
- When the user refers to an earlier message in the current thread, answer from the provided conversation history.
- When creating tasks, use appropriate priority levels based on urgency cues.
- When the user asks for a chart or summary based on workspace task data, fetch the task data with tools first and then generate the chart from that data instead of asking the user to supply data you can retrieve.
- Always confirm what you've done after taking an action.`;

export async function handleAssistantRequest(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let entitlements: Awaited<ReturnType<typeof assertOrganizationAiAccess>>;

  try {
    entitlements = await assertOrganizationAiAccess();
  } catch (error) {
    if (error instanceof UpgradeRequiredError) {
      return Response.json(
        { error: error.message, code: "UPGRADE_REQUIRED" },
        { status: 403 },
      );
    }
    if (error instanceof LimitReachedError) {
      return Response.json(
        {
          error: error.message,
          code: "LIMIT_REACHED",
          limit: error.limit,
          currentUsage: error.currentUsage,
        },
        { status: 429 },
      );
    }
    throw error;
  }

  const raw = await req.json();
  const parsedBody = await parseAssistantMessagesBody(raw);
  if (!parsedBody.ok) {
    return Response.json({ error: parsedBody.error }, { status: 400 });
  }

  const messages = parsedBody.messages;
  const modelId = optionalStringField(raw, "modelId");
  const conversationId = optionalStringField(raw, "conversationId");

  if (messages.length > MAX_MESSAGES) {
    return Response.json(
      { error: `Too many messages (max ${MAX_MESSAGES}).` },
      { status: 400 },
    );
  }

  for (const msg of messages) {
    const text =
      msg?.parts?.filter(isTextUIPart).map((p) => p.text).join("") ?? "";
    if (text.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` },
        { status: 400 },
      );
    }
  }

  if (conversationId) {
    const conversation = await getAssistantConversation(conversationId);
    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }
  }

  try {
    await consumeMonthlyUsage({
      organizationId: entitlements.organizationId,
      limitKey: "aiCredits",
      entitlements,
    });
  } catch (error) {
    if (error instanceof LimitReachedError) {
      return Response.json(
        {
          error: error.message,
          code: "LIMIT_REACHED",
          limit: error.limit,
          currentUsage: error.currentUsage,
        },
        { status: 429 },
      );
    }

    throw error;
  }

  const modelMessages = await convertToModelMessages(messages);

  try {
    const selection = await selectAssistantModel(
      entitlements.organizationId,
      modelId,
    );
    const assistantModel = getAiModelInstance(selection.model.id);

    const result = streamText({
      model: assistantModel.model,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: assistantTools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof AssistantModelSelectionError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }

    throw error;
  }
}
