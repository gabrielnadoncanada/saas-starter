import { handleAssistantRequest } from "@/features/assistant/server/handle-assistant-request";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";

export async function POST(req: Request) {
  if (!hasAnyAiProvider()) {
    return Response.json(
      { error: "AI assistant is not configured on this deployment." },
      { status: 503 },
    );
  }

  return handleAssistantRequest(req);
}
