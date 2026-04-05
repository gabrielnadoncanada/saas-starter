import { handleAssistantRequest } from "@/features/assistant/server/handle-assistant-request";

export async function POST(req: Request) {
  return handleAssistantRequest(req);
}
