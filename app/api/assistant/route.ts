import { randomUUID } from "node:crypto";

import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import {
  AssistantModelSelectionError,
  resolveOrganizationAssistantModelSelection,
} from "@/features/assistant/server/assistant-model-selection";
import { assertOrganizationAiAccess } from "@/features/assistant/server/organization-ai-settings";
import { assistantTools } from "@/features/assistant/server/tools";
import {
  InsufficientCreditsError,
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";
import {
  calculateCreditCharge,
  getCreditReserve,
} from "@/features/billing/server/credit-charge";
import {
  reserveCredits,
  settleReservedCredits,
} from "@/features/billing/server/credits";
import { billingConfig } from "@/shared/config/billing.config";
import { getAiModelInstance } from "@/shared/lib/ai/get-model-instance";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function POST(req: Request) {
  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Check plan gating and minimum credit reserve
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
    if (error instanceof InsufficientCreditsError) {
      return Response.json(
        {
          error: error.message,
          code: "INSUFFICIENT_CREDITS",
          availableCredits: error.availableCredits,
          requiredCredits: error.requiredCredits,
        },
        { status: 402 },
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
    const conversation = await getAssistantConversation(conversationId);
    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }
  }

  const modelMessages = await convertToModelMessages(messages);
  let assistantModel;

  try {
    const selection = await resolveOrganizationAssistantModelSelection(
      entitlements.organizationId,
      modelId,
    );
    assistantModel = getAiModelInstance(selection.model.id);

    const strategy = billingConfig.ai.assistantRequest;
    const reservedCredits = getCreditReserve(strategy);
    const creditReferenceId = randomUUID();

    await reserveCredits({
      organizationId: entitlements.organizationId,
      credits: reservedCredits,
      referenceId: creditReferenceId,
    });

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
      onAbort: () => {
        void settleReservedCredits({
          organizationId: entitlements.organizationId,
          reservedCredits,
          finalCredits: 0,
          referenceId: creditReferenceId,
        });
      },
      onError: () => {
        void settleReservedCredits({
          organizationId: entitlements.organizationId,
          reservedCredits,
          finalCredits: 0,
          referenceId: creditReferenceId,
        });
      },
      onFinish: async ({ usage }) => {
        await settleReservedCredits({
          organizationId: entitlements.organizationId,
          reservedCredits,
          finalCredits: calculateCreditCharge({
            strategy,
            modelId: selection.model.id,
            usage,
          }),
          referenceId: creditReferenceId,
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof AssistantModelSelectionError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    if (error instanceof InsufficientCreditsError) {
      return Response.json(
        {
          error: error.message,
          code: "INSUFFICIENT_CREDITS",
          availableCredits: error.availableCredits,
          requiredCredits: error.requiredCredits,
        },
        { status: 402 },
      );
    }

    throw error;
  }
}
