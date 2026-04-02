import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { aiConversationSurfaces } from "@/features/ai/ai-surfaces";
import { getAiConversation } from "@/features/ai/server/ai-conversations";
import { AiModelSelectionError } from "@/features/ai/server/model-selection-error";
import { assertOrganizationAiAccess } from "@/features/ai/server/organization-ai-settings";
import { resolveOrganizationModelSelection } from "@/features/ai/server/resolve-model-selection";
import { assistantTools } from "@/features/assistant/server/tools";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";
import { consumeMonthlyUsage } from "@/features/billing/usage/usage-service";
import { getAiModelInstance } from "@/shared/lib/ai/get-model-instance";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function POST(req: Request) {
  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Check plan gating and usage limits
  let organizationPlan: Awaited<ReturnType<typeof assertOrganizationAiAccess>>;

  try {
    organizationPlan = await assertOrganizationAiAccess();
    await consumeMonthlyUsage(
      organizationPlan.organizationId,
      "aiRequestsPerMonth",
      organizationPlan.planId,
    );
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

  // 3. Parse the request and validate payload size
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
    const conversation = await getAiConversation(
      conversationId,
      aiConversationSurfaces.assistant,
    );
    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }
  }

  const modelMessages = await convertToModelMessages(messages);
  let assistantModel;

  try {
    const selection = await resolveOrganizationModelSelection(
      organizationPlan.organizationId,
      modelId,
    );
    assistantModel = getAiModelInstance(selection.model.id);
  } catch (error) {
    if (error instanceof AiModelSelectionError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }

    throw error;
  }

  // 4. Stream the AI response with tools
  const result = streamText({
    model: assistantModel.model,
    system: `You are a helpful business assistant integrated into a SaaS application.
You can help users with two main workflows:

1. **Email → Tasks**: Review the user's inbox and suggest or create tasks based on emails that need action.
2. **Invoice Creation**: Create invoice drafts from natural language descriptions.

Guidelines:
- Be concise and action-oriented.
- When reviewing emails, identify actionable items and offer to create tasks for them.
- When creating invoices, extract structured data (client, items, amounts) from the user's description.
- When creating tasks, use appropriate priority levels based on urgency cues.
- Always confirm what you've done after taking an action.
- Format currency amounts properly (e.g., $1,200.00).`,
    messages: modelMessages,
    tools: assistantTools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
