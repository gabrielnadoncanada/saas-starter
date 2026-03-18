import type { UIMessage } from "ai";

import {
  createAssistantConversation,
  listAssistantConversations,
  resolveAssistantConversationScope,
} from "@/features/assistant/server/conversations";

function getScopeErrorResponse(scope: Awaited<ReturnType<typeof resolveAssistantConversationScope>>) {
  if (scope.kind === "unauthorized") {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response("Team not found", { status: 403 });
}

export async function GET() {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

  const conversations = await listAssistantConversations();
  return Response.json(conversations);
}

export async function POST(req: Request) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return getScopeErrorResponse(scope);
  }

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
