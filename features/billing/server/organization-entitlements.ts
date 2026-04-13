import "server-only";

import { getDefaultEntitlements } from "@/features/billing/entitlements";
import {
  getPlan,
  hasPlanAccess,
  isPlanId,
} from "@/features/billing/plans";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import type {
  OrganizationEntitlements,
  PlanId,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

export async function resolveEntitlements(
  organizationId: string,
): Promise<OrganizationEntitlements> {
  const subscription = await db.subscription.findFirst({
    where: { referenceId: organizationId },
    orderBy: { updatedAt: "desc" },
  });

  if (
    !subscription ||
    !hasPlanAccess(subscription.status) ||
    !isPlanId(subscription.plan)
  ) {
    return getDefaultEntitlements({ organizationId });
  }

  const plan = getPlan(subscription.plan);

  return {
    billingInterval:
      subscription.billingInterval === "month" ||
      subscription.billingInterval === "year"
        ? subscription.billingInterval
        : null,
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    organizationId,
    planId: plan.id as PlanId,
    planName: plan.name,
    stripeCustomerId: subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    subscriptionStatus: subscription.status ?? null,
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
