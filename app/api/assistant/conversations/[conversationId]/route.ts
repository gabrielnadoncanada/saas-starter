import type { UIMessage } from "ai";

import {
  deleteAssistantConversation,
  getAssistantConversation,
  replaceAssistantConversation,
  resolveAssistantConversationScope,
} from "@/features/assistant/server/conversations";
import { assertCapability } from "@/features/billing/guards";
import { getTeamPlan } from "@/features/billing/guards/get-team-plan";
import { UpgradeRequiredError } from "@/features/billing/errors";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

function getScopeErrorResponse(scope: Awaited<ReturnType<typeof resolveAssistantConversationScope>>) {
  if (scope.kind === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response("Team not found", { status: 403 });
}

async function assertAssistantAccess() {
  const teamPlan = await getTeamPlan();
  if (!teamPlan) {
    return new Response("Team not found", { status: 403 });
  }

  try {
    assertCapability(teamPlan.planId, "ai.assistant");
  } catch (error) {
    if (error instanceof UpgradeRequiredError) {
      return Response.json(
        { error: error.message, code: "UPGRADE_REQUIRED" },
        { status: 403 },
      );
    }
    throw error;
  }

  return null;
}

export async function GET(_req: Request, context: RouteContext) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const { conversationId } = await context.params;
  const conversation = await getAssistantConversation(conversationId);

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  return Response.json(conversation);
}

export async function PATCH(req: Request, context: RouteContext) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const body = (await req.json()) as { messages?: UIMessage[] };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "Conversation messages are required." },
      { status: 400 }
    );
  }

  const { conversationId } = await context.params;
  const conversation = await replaceAssistantConversation(
    conversationId,
    body.messages
  );

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  return Response.json(conversation);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const { conversationId } = await context.params;
  const deleted = await deleteAssistantConversation(conversationId);

  if (!deleted) {
    return new Response("Conversation not found", { status: 404 });
  }

  return new Response(null, { status: 204 });
}
