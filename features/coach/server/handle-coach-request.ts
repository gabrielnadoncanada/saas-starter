import "server-only";

import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { getAgentById } from "@/features/agents/server/agent-queries";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";

import { buildCoachSystemPrompt } from "./coach-system-prompt";
import { buildCoachTools } from "./coach-tools";

const requestSchema = z.object({
  messages: z.array(z.any()).min(1),
});

function resolveCoachModel(): LanguageModel {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    return google("gemini-2.5-flash");
  }
  if (process.env.GROQ_API_KEY?.trim()) {
    return groq("llama-3.3-70b-versatile");
  }
  throw new Error(
    "No coach model available — set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY",
  );
}

export async function handleCoachRequest(
  req: Request,
  { agentId }: { agentId: string },
) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
  const messages = parsed.data.messages as UIMessage[];

  const agent = await getAgentById(agentId);
  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }
  if (agent.organizationId !== membership.organizationId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const activeVersion = agent.versions.find((v) => v.active) ?? null;

  const system = buildCoachSystemPrompt({
    agentName: agent.name,
    agentSlug: agent.slug,
    activePromptVersion: activeVersion?.version ?? null,
    activePromptText: activeVersion?.systemPrompt ?? null,
    locale: agent.locale,
  });

  const tools = buildCoachTools({
    organizationId: membership.organizationId,
    agentId: agent.id,
    userId: user.id,
  });

  // Each tool's execute either calls runInTenantScope itself or goes through
  // functions that require an active org session — both work without an outer
  // scope because tools always run in the same request where the session is
  // available.
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: resolveCoachModel(),
    system,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
