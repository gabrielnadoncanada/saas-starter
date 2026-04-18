import {
  handlePublicChatOptions,
  handlePublicChatRequest,
} from "@/features/agents/server/handle-public-chat-request";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";

type RouteContext = {
  params: Promise<{ orgSlug: string; agentSlug: string }>;
};

export async function OPTIONS(req: Request) {
  return handlePublicChatOptions(req);
}

export async function POST(req: Request, context: RouteContext) {
  if (!hasAnyAiProvider()) {
    return Response.json(
      { error: "AI public chat is not configured on this deployment." },
      { status: 503 },
    );
  }
  const params = await context.params;
  return handlePublicChatRequest(req, params);
}
