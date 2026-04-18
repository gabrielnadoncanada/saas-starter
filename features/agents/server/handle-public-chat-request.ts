import "server-only";

import {
  convertToModelMessages,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import {
  resolvePublicAgent,
  type ResolvedAgent,
} from "@/features/agents/server/agents-registry";
import { corsHeaders, resolveAllowedOrigin } from "@/features/agents/server/cors";
import {
  appendPublicConversationMessages,
  createPublicConversation,
  getPublicConversationForVisitor,
} from "@/features/agents/server/public-conversations";
import { buildPublicChatTools } from "@/features/agents/server/tools";
import {
  buildVisitorCookieHeader,
  generateVisitorId,
  readVisitorIdFromCookieHeader,
  VISITOR_COOKIE_NAME,
} from "@/features/agents/server/visitor";
import { publicChatRequestSchema } from "@/features/agents/schemas/public-chat.schema";
import { retrieveSimilarCorrections } from "@/features/knowledge/server/retrieve";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { hasOpenAi } from "@/lib/ai/providers/openai";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const MAX_MESSAGES = 60;
const MAX_MESSAGE_LENGTH = 8_000;

type HandlePublicChatParams = {
  orgSlug: string;
  agentSlug: string;
};

export async function handlePublicChatOptions(req: Request): Promise<Response> {
  const originHeader = req.headers.get("origin");
  const allowed = resolveAllowedOrigin(originHeader);
  return new Response(null, {
    status: 204,
    headers: corsHeaders(allowed),
  });
}

function mergeHeaders(...sources: HeadersInit[]): Headers {
  const h = new Headers();
  for (const src of sources) {
    new Headers(src).forEach((value, key) => h.set(key, value));
  }
  return h;
}

function getAgentModel(modelId: string) {
  if (modelId.startsWith("llama") || modelId.startsWith("gpt-oss") || modelId.includes("groq")) {
    if (!process.env.GROQ_API_KEY?.trim()) throw new Error("GROQ_API_KEY is not set");
    return groq(modelId);
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
  return google(modelId);
}

function getLatestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const text = m.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join(" ")
      .trim();
    if (text) return text;
  }
  return "";
}

async function buildSystemPrompt(
  agent: ResolvedAgent,
  latestUserText: string,
): Promise<string> {
  const base =
    agent.activeVersion?.systemPrompt ??
    `You are ${agent.name}, a helpful assistant answering questions on behalf of the organization. Use the tools available to you (knowledge lookup, lead capture, human handoff) rather than guessing.`;

  if (!latestUserText || !hasOpenAi()) return base;

  const corrections = await retrieveSimilarCorrections({
    organizationId: agent.organizationId,
    agentId: agent.id,
    query: latestUserText,
    topK: 3,
  });

  if (corrections.length === 0) return base;

  const examples = corrections
    .map(
      (c, i) =>
        `Example ${i + 1}:\nUser: ${c.userMessage}\nPreferred answer: ${c.correctedMessage}`,
    )
    .join("\n\n");

  return `${base}\n\nStyle/content references from prior corrections — match tone and factual approach when relevant:\n\n${examples}`;
}

export async function handlePublicChatRequest(
  req: Request,
  params: HandlePublicChatParams,
): Promise<Response> {
  const originHeader = req.headers.get("origin");
  const allowedOrigin = resolveAllowedOrigin(originHeader);
  const cors = corsHeaders(allowedOrigin);

  const respond = (body: BodyInit | null, init: ResponseInit = {}) =>
    new Response(body, {
      ...init,
      headers: mergeHeaders(cors, init.headers ?? {}),
    });

  const ip = (await getClientIp()) ?? "unknown";
  const rl = await rateLimit("public", `public-chat:${ip}`);
  if (!rl.success) {
    return respond(
      JSON.stringify({
        error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.`,
        code: "RATE_LIMITED",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...rateLimitHeaders(rl),
        },
      },
    );
  }

  const agent = await resolvePublicAgent(params.orgSlug, params.agentSlug);
  if (!agent) {
    return respond(JSON.stringify({ error: "Agent not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return respond(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsedBody = publicChatRequestSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return respond(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validated = await safeValidateUIMessages({
    messages: parsedBody.data.messages,
  });
  if (!validated.success) {
    return respond(JSON.stringify({ error: "Invalid messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = validated.data;
  if (messages.length > MAX_MESSAGES) {
    return respond(
      JSON.stringify({ error: `Too many messages (max ${MAX_MESSAGES}).` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  for (const m of messages) {
    const text =
      m.parts
        ?.filter((p) => p.type === "text")
        .map((p) => ("text" in p ? p.text : ""))
        .join("") ?? "";
    if (text.length > MAX_MESSAGE_LENGTH) {
      return respond(
        JSON.stringify({
          error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const cookieHeader = req.headers.get("cookie");
  const existingVisitorId =
    readVisitorIdFromCookieHeader(cookieHeader) ?? parsedBody.data.visitorId ?? null;
  const visitorId = existingVisitorId ?? generateVisitorId();
  const shouldSetCookie = !readVisitorIdFromCookieHeader(cookieHeader);

  let conversationId = parsedBody.data.conversationId ?? null;
  if (conversationId) {
    const convo = await getPublicConversationForVisitor(conversationId, visitorId);
    if (!convo || convo.agentId !== agent.id) {
      conversationId = null;
    } else if (convo.status === "HUMAN") {
      return respond(
        JSON.stringify({
          error: "A human has taken over this conversation.",
          code: "HUMAN_TAKEOVER",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const context = {
    pageUrl: parsedBody.data.pageUrl,
    referrer: parsedBody.data.referrer,
    locale: parsedBody.data.locale,
    visitorIp: ip,
    visitorUserAgent: req.headers.get("user-agent") ?? undefined,
  };

  if (!conversationId) {
    const created = await createPublicConversation({
      organizationId: agent.organizationId,
      agentId: agent.id,
      agentVersionId: agent.activeVersion?.id ?? null,
      visitorId,
      messages,
      context,
    });
    conversationId = created.id;
  } else {
    await appendPublicConversationMessages({
      organizationId: agent.organizationId,
      conversationId,
      messages,
    });
  }

  const latestUserText = getLatestUserText(messages);
  const systemPrompt = await buildSystemPrompt(agent, latestUserText);
  const model = getAgentModel(agent.modelId);
  const tools = buildPublicChatTools(
    {
      organizationId: agent.organizationId,
      agentId: agent.id,
      conversationId,
    },
    agent.toolsEnabled,
  );

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
  });

  const extraHeaders: Record<string, string> = {
    "x-conversation-id": conversationId,
    "x-visitor-id": visitorId,
  };
  if (shouldSetCookie) {
    extraHeaders["Set-Cookie"] = buildVisitorCookieHeader(visitorId);
  }

  const capturedConversationId = conversationId;
  const capturedOrgId = agent.organizationId;

  return result.toUIMessageStreamResponse({
    headers: mergeHeaders(cors, extraHeaders),
    onFinish: async ({ messages: finalMessages }) => {
      try {
        await appendPublicConversationMessages({
          organizationId: capturedOrgId,
          conversationId: capturedConversationId,
          messages: [...messages, ...finalMessages] as UIMessage[],
        });
      } catch (error) {
        console.error("[public-chat] failed to persist final messages", error);
      }
    },
  });
}

export { VISITOR_COOKIE_NAME };
