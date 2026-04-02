import type { UIMessage } from "ai";

import { aiConversationSurfaces } from "@/features/ai/ai-surfaces";
import {
  createAiConversation,
  listAiConversations,
  resolveAiConversationScope,
} from "@/features/ai/server/ai-conversations";
import { assertOrganizationAiAccess } from "@/features/ai/server/organization-ai-settings";
import { UpgradeRequiredError } from "@/features/billing/errors/billing-errors";

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

export async function GET() {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const conversations = await listAiConversations(
    aiConversationSurfaces.assistant,
  );
  return Response.json(conversations);
}

export async function POST(req: Request) {
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

  const conversation = await createAiConversation(
    aiConversationSurfaces.assistant,
    body.messages,
  );
  if (!conversation) {
    return new Response("Unable to create conversation", { status: 500 });
  }

  return Response.json(conversation, { status: 201 });
}
