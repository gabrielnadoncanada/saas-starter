import "server-only";

import { assertCapability } from "@/features/billing/entitlements";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";

export async function assertOrganizationAiAccess() {
  const entitlements = await getCurrentEntitlements();

  if (!entitlements) {
    throw new Error("Organization not found");
  }

  assertCapability(entitlements, "ai.assistant");
  return entitlements;
}
