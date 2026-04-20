import { handleCoachRequest } from "@/features/coach/server/handle-coach-request";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  if (!hasAnyAiProvider()) {
    return Response.json(
      { error: "AI is not configured on this deployment." },
      { status: 503 },
    );
  }
  const { agentId } = await context.params;
  return handleCoachRequest(req, { agentId });
}
