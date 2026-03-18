import { streamText, convertToModelMessages, stepCountIs } from "ai";

import { getAssistantModel } from "@/features/assistant/server/get-assistant-model";
import { getAssistantConversation } from "@/features/assistant/server/conversations";
import { getTeamPlan, assertCapability } from "@/features/billing/guards";
import { consumeMonthlyUsage } from "@/features/billing/usage";
import { UpgradeRequiredError, LimitReachedError } from "@/features/billing/errors";
import { assistantTools } from "@/features/assistant/server/tools";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function POST(req: Request) {
  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Check plan gating and usage limits
  const teamPlan = await getTeamPlan();
  if (!teamPlan) {
    return new Response("Team not found", { status: 403 });
  }

  try {
    assertCapability(teamPlan.planId, "ai.assistant");
    await consumeMonthlyUsage(
      teamPlan.teamId,
      "aiRequestsPerMonth",
      teamPlan.planId,
    );
  } catch (error) {
    if (error instanceof UpgradeRequiredError) {
      return Response.json({ error: error.message, code: "UPGRADE_REQUIRED" }, { status: 403 });
    }
    if (error instanceof LimitReachedError) {
      return Response.json({
        error: error.message,
        code: "LIMIT_REACHED",
        limit: error.limit,
        currentUsage: error.currentUsage,
      }, { status: 429 });
    }
    throw error;
  }

  // 3. Parse the request and convert UI messages to model messages
  const { messages, modelId, provider, conversationId } = await req.json();
  if (conversationId) {
    const conversation = await getAssistantConversation(conversationId);
    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  // 4. Stream the AI response with tools
  const assistantModel = getAssistantModel({ modelId, provider });
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
