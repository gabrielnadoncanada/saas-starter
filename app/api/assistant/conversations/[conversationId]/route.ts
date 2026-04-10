import {
  assertAssistantAccess,
  getScopeErrorResponse,
} from "@/features/assistant/server/assistant-api-errors";
import {
  deleteAssistantConversation,
  getAssistantConversation,
  replaceAssistantConversation,
  resolveAssistantConversationScope,
} from "@/features/assistant/server/assistant-conversations";
import { parseAssistantMessagesBody } from "@/features/assistant/server/handle-assistant-request";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

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
    return Response.json({ error: "Conversation not found" }, { status: 404 });
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

  const body = await req.json();
  const parsed = await parseAssistantMessagesBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { conversationId } = await context.params;
  const conversation = await replaceAssistantConversation(
    conversationId,
    parsed.messages,
  );

  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
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
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
