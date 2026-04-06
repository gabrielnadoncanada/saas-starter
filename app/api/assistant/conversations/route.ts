import {
  assertAssistantAccess,
  getScopeErrorResponse,
} from "@/features/assistant/server/assistant-api-errors";
import {
  createAssistantConversation,
  listAssistantConversations,
  resolveAssistantConversationScope,
} from "@/features/assistant/server/assistant-conversations";
import { parseAssistantMessagesBody } from "@/features/assistant/server/parse-assistant-messages-body";

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
    return Response.json({ error: "Unable to create conversation" }, { status: 500 });
  }

  return Response.json(conversation, { status: 201 });
}
