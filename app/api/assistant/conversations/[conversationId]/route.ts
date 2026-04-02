import type { UIMessage } from "ai";

import { aiConversationSurfaces } from "@/features/ai/ai-surfaces";
import {
  deleteAiConversation,
  getAiConversation,
  replaceAiConversation,
  resolveAiConversationScope,
} from "@/features/ai/server/ai-conversations";
import { assertOrganizationAiAccess } from "@/features/ai/server/organization-ai-settings";
import { UpgradeRequiredError } from "@/features/billing/errors/billing-errors";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

function getScopeErrorResponse(
  scope: Awaited<ReturnType<typeof resolveAiConversationScope>>,
) {
  if (scope.kind === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response("Organization not found", { status: 403 });
}

async function assertAssistantAccess() {
  try {
    await assertOrganizationAiAccess();
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
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const { conversationId } = await context.params;
  const conversation = await getAiConversation(
    conversationId,
    aiConversationSurfaces.assistant,
  );

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  return Response.json(conversation);
}

export async function PATCH(req: Request, context: RouteContext) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const body = (await req.json()) as { messages?: UIMessage[] };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "Conversation messages are required." },
      { status: 400 },
    );
  }

  const { conversationId } = await context.params;
  const conversation = await replaceAiConversation(
    conversationId,
    aiConversationSurfaces.assistant,
    body.messages,
  );

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  return Response.json(conversation);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const { conversationId } = await context.params;
  const deleted = await deleteAiConversation(
    conversationId,
    aiConversationSurfaces.assistant,
  );

  if (!deleted) {
    return new Response("Conversation not found", { status: 404 });
  }

  return new Response(null, { status: 204 });
}
