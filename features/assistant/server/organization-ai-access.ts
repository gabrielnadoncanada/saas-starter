import "server-only";

import { assertCapability } from "@/features/billing/guards/plan-guards";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";

export async function assertOrganizationAiAccess() {
  const entitlements = await getCurrentOrganizationEntitlements();

  if (!entitlements) {
    throw new Error("Organization not found");
  }

  assertCapability(entitlements, "ai.assistant");
  return entitlements;
}
