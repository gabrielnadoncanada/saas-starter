import type { resolveAssistantConversationScope } from "@/features/assistant/server/assistant-conversations";
import { assertOrganizationAiAccess } from "@/features/assistant/server/organization-ai-access";
import { UpgradeRequiredError } from "@/features/billing/billing-errors";

export function getScopeErrorResponse(
  scope: Awaited<ReturnType<typeof resolveAssistantConversationScope>>,
) {
  if (scope.kind === "unauthorized") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ error: "Organization not found" }, { status: 403 });
}

export async function assertAssistantAccess() {
  try {
    await assertOrganizationAiAccess();
  } catch (error) {
    if (error instanceof UpgradeRequiredError) {
      return Response.json(
        { error: error.message, code: "UPGRADE_REQUIRED" },
        { status: 403 },
      );
    }
    throw error;
  }

  return null;
}
