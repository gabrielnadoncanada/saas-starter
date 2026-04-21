import "server-only";

import type { OrganizationEntitlements } from "@/config/billing.config";
import { getDefaultEntitlements } from "@/features/billing/entitlements";
import {
  getPlan,
  isPlanId,
  normalizeBillingInterval,
  PLAN_ACCESS_STATUSES,
} from "@/features/billing/plans";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

export async function resolveEntitlements(
  organizationId: string,
): Promise<OrganizationEntitlements> {
  const subscription = await db.subscription.findFirst({
    where: {
      referenceId: organizationId,
      status: { in: [...PLAN_ACCESS_STATUSES] },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!subscription || !isPlanId(subscription.plan)) {
    return getDefaultEntitlements({ organizationId });
  }

  const plan = getPlan(subscription.plan);

  return {
    billingInterval: normalizeBillingInterval(subscription.billingInterval),
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    organizationId,
    planId: subscription.plan,
    planName: plan.name,
    stripeCustomerId: subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    subscriptionStatus: subscription.status,
    trialEnd: subscription.trialEnd ?? null,
  };
}

export async function getCurrentEntitlements() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return null;
  }

  return resolveEntitlements(organization.id);
}
