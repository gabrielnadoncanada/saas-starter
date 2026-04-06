import {
  createAssistantConversation,
  listAssistantConversations,
  resolveAssistantConversationScope,
} from "@/features/assistant/server/assistant-conversations";
import { parseAssistantMessagesBody } from "@/features/assistant/server/parse-assistant-messages-body";
import { assertOrganizationAiAccess } from "@/features/assistant/server/organization-ai-access";
import { UpgradeRequiredError } from "@/features/billing/billing-errors";

function getScopeErrorResponse(
  scope: Awaited<ReturnType<typeof resolveAssistantConversationScope>>,
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

  const body = await req.json();
  const parsed = await parseAssistantMessagesBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const conversation = await createAssistantConversation(parsed.messages);
  if (!conversation) {
    return new Response("Unable to create conversation", { status: 500 });
  }

  return Response.json(conversation, { status: 201 });
}
