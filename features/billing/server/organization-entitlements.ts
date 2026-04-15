import "server-only";

import type {
  OrganizationEntitlements,
  PlanId,
} from "@/config/billing.config";
import { getDefaultEntitlements } from "@/features/billing/entitlements";
import {
  getPlan,
  hasPlanAccess,
  isPlanId,
  normalizeBillingInterval,
} from "@/features/billing/plans";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

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
    billingInterval: normalizeBillingInterval(subscription.billingInterval),
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
