import {
  corsHeaders,
  resolveAllowedOrigin,
} from "@/features/agents/server/cors";
import { resolvePublicAgent } from "@/features/agents/server/agents-registry";
import { getPublicConversationForVisitor } from "@/features/agents/server/public-conversations";
import { readVisitorIdFromCookieHeader } from "@/features/agents/server/visitor";
import { messageFeedbackSchema } from "@/features/agents/schemas/public-chat.schema";
import { db } from "@/lib/db/prisma";
import { runInTenantScope } from "@/lib/db/tenant-scope";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

type RouteContext = {
  params: Promise<{ orgSlug: string; agentSlug: string }>;
};

export async function OPTIONS(req: Request) {
  const allowed = resolveAllowedOrigin(req.headers.get("origin"));
  return new Response(null, { status: 204, headers: corsHeaders(allowed) });
}

export async function POST(req: Request, context: RouteContext) {
  const allowed = resolveAllowedOrigin(req.headers.get("origin"));
  const cors = corsHeaders(allowed);

  const { orgSlug, agentSlug } = await context.params;

  const ip = (await getClientIp()) ?? "unknown";
  const rl = await rateLimit("public", `public-feedback:${ip}`);
  if (!rl.success) {
    return new Response(
      JSON.stringify({
        error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.`,
        code: "RATE_LIMITED",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...cors,
          ...rateLimitHeaders(rl),
        },
      },
    );
  }

  const agent = await resolvePublicAgent(orgSlug, agentSlug);
  if (!agent) {
    return new Response(JSON.stringify({ error: "Agent not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  const parsed = messageFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid feedback body" }), {
      status: 400,
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

  const convo = await getPublicConversationForVisitor(
    parsed.data.conversationId,
    visitorId,
  );
  if (!convo || convo.agentId !== agent.id) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  await runInTenantScope(agent.organizationId, () =>
    db.messageFeedback.upsert({
      where: {
        conversationId_messageId: {
          conversationId: parsed.data.conversationId,
          messageId: parsed.data.messageId,
        },
      },
      create: {
        conversationId: parsed.data.conversationId,
        messageId: parsed.data.messageId,
        rating: parsed.data.rating,
        reason: parsed.data.reason ?? null,
      },
      update: {
        rating: parsed.data.rating,
        reason: parsed.data.reason ?? null,
      },
    }),
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
