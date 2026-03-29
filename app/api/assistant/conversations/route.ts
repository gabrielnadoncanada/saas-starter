import type { UIMessage } from "ai";

import {
  createAssistantConversation,
  listAssistantConversations,
  resolveAssistantConversationScope,
} from "@/features/assistant/server/conversations";
import { assertCapability } from "@/features/billing/guards";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
import { UpgradeRequiredError } from "@/features/billing/errors";

function getScopeErrorResponse(scope: Awaited<ReturnType<typeof resolveAssistantConversationScope>>) {
  if (scope.kind === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response("Organization not found", { status: 403 });
}

async function assertAssistantAccess() {
  const organizationPlan = await getOrganizationPlan();
  if (!organizationPlan) {
    return new Response("Organization not found", { status: 403 });
  }

  try {
    assertCapability(organizationPlan.planId, "ai.assistant");
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
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const planError = await assertAssistantAccess();
  if (planError) return planError;

  const conversations = await listAssistantConversations();
  return Response.json(conversations);
}

export async function POST(req: Request) {
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

  const conversation = await createAssistantConversation(body.messages);
  if (!conversation) {
    return new Response("Unable to create conversation", { status: 500 });
  }

  return Response.json(conversation, { status: 201 });
}

