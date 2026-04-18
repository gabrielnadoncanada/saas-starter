import {
  corsHeaders,
  resolveAllowedOrigin,
} from "@/features/agents/server/cors";
import {
  resolvePublicAgent,
  toAgentPublicView,
} from "@/features/agents/server/agents-registry";

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

  const agent = await resolvePublicAgent(orgSlug, agentSlug);
  if (!agent) {
    return new Response(JSON.stringify({ error: "Agent not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  return new Response(
    JSON.stringify({
      agent: toAgentPublicView(agent),
      toolsEnabled: agent.toolsEnabled,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        ...cors,
      },
    },
  );
}
