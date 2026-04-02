import "server-only";

import { hasCapability } from "@/features/billing/guards/plan-guards";
import { resolveOrganizationPlan } from "@/features/billing/plans/resolve-organization-plan";
import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
import { authenticateApiKey } from "@/features/api-keys/server/api-key-service";
import type { Capability, PlanId } from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

type ApiRequestContext = {
  apiKey: Awaited<ReturnType<typeof authenticateApiKey>>;
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
  planId: PlanId;
};

export async function requireApiKey(
  request: Request,
  requiredCapability?: Capability,
): Promise<ApiRequestContext | null> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const secret = authorization.slice("Bearer ".length).trim();
  const apiKey = await authenticateApiKey(secret);

  if (!apiKey) {
    return null;
  }

  const [organization, subscription] = await Promise.all([
    db.organization.findUnique({
      where: { id: apiKey.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    getOrganizationSubscriptionSnapshot(apiKey.organizationId),
  ]);

  if (!organization) {
    return null;
  }

  const planId = resolveOrganizationPlan(subscription);

  if (requiredCapability) {
    if (!apiKey.capabilities.includes(requiredCapability)) {
      return null;
    }

    if (!hasCapability(planId, requiredCapability)) {
      return null;
    }
  }

  return {
    apiKey,
    organization,
    planId,
  };
}
