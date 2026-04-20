import type { UIMessage } from "ai";

import { resolvePublicAgent } from "@/features/agents/server/agents-registry";
import {
  corsHeaders,
  resolveAllowedOrigin,
} from "@/features/agents/server/cors";
import { getPublicConversationForVisitor } from "@/features/agents/server/public-conversations";
import { readVisitorIdFromCookieHeader } from "@/features/agents/server/visitor";

type RouteContext = {
  params: Promise<{ orgSlug: string; agentSlug: string }>;
};

export async function OPTIONS(req: Request) {
  const allowed = resolveAllowedOrigin(req.headers.get("origin"));
  return new Response(null, { status: 204, headers: corsHeaders(allowed) });
}

export async function GET(req: Request, context: RouteContext) {
  const allowed = resolveAllowedOrigin(req.headers.get("origin"));
  const cors = corsHeaders(allowed);
  const { orgSlug, agentSlug } = await context.params;

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  const sinceParam = url.searchParams.get("since");
  const since = Math.max(0, Number.parseInt(sinceParam ?? "0", 10) || 0);

  if (!conversationId) {
    return new Response(
      JSON.stringify({ error: "conversationId required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...cors } },
    );
  }

  const agent = await resolvePublicAgent(orgSlug, agentSlug);
  if (!agent) {
    return new Response(JSON.stringify({ error: "Agent not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  const visitorId = readVisitorIdFromCookieHeader(req.headers.get("cookie"));
  if (!visitorId) {
    return new Response(JSON.stringify({ error: "No visitor session" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  const convo = await getPublicConversationForVisitor(conversationId, visitorId);
  if (!convo || convo.agentId !== agent.id) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  const all = Array.isArray(convo.messagesJson)
    ? (convo.messagesJson as unknown as UIMessage[])
    : [];

  const newMessages = since < all.length ? all.slice(since) : [];

  return new Response(
    JSON.stringify({
      status: convo.status,
      totalCount: all.length,
      messages: newMessages,
      lastMessageAt: convo.lastMessageAt.toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...cors,
      },
    },
  );
}
