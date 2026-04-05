import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import {
  AssistantModelSelectionError,
  resolveOrganizationAssistantModelSelection,
} from "@/features/assistant/server/assistant-model-selection";
import { assertOrganizationAiAccess } from "@/features/assistant/server/organization-ai-access";
import { assistantTools } from "@/features/assistant/server/tools";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";
import { getAiModelInstance } from "@/shared/lib/ai/get-model-instance";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function POST(req: Request) {
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

  const MAX_MESSAGES = 100;
  const MAX_MESSAGE_LENGTH = 10_000;

  const { messages, modelId, conversationId } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "Conversation messages are required." },
      { status: 400 },
    );
  }

  if (messages.length > MAX_MESSAGES) {
    return Response.json(
      { error: `Too many messages (max ${MAX_MESSAGES}).` },
      { status: 400 },
    );
  }

  for (const msg of messages) {
    const text =
      msg?.parts
        ?.filter((p: { type: string }) => p.type === "text")
        ?.map((p: { text: string }) => p.text)
        ?.join("") ?? "";
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

  const modelMessages = await convertToModelMessages(messages);

  try {
    const selection = await resolveOrganizationAssistantModelSelection(
      entitlements.organizationId,
      modelId,
    );
    const assistantModel = getAiModelInstance(selection.model.id);

    const result = streamText({
      model: assistantModel.model,
      system: `You are a helpful business assistant integrated into a SaaS application.
You can create tasks in the workspace task tracker when the user asks.

Guidelines:
- Be concise and action-oriented.
- When creating tasks, use appropriate priority levels based on urgency cues.
- Always confirm what you've done after taking an action.`,
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
