import "server-only";

import {
  getDefaultEntitlements,
  getOneTimeProduct,
  getPlan,
  isPlanId,
} from "@/features/billing/catalog";
import { hasPlanAccess } from "@/features/billing/plan-guards";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import type {
  LimitKey,
  OrganizationEntitlements,
  PlanId,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

export function applyOneTimePurchaseLimits(
  limits: Record<LimitKey, number>,
  purchasedItemKeys: string[],
): Record<LimitKey, number> {
  let result = limits;

  for (const itemKey of purchasedItemKeys) {
    const product = getOneTimeProduct(itemKey);
    if (!product?.limitEffect) continue;

    result = result === limits ? { ...limits } : result;
    for (const [key, value] of Object.entries(product.limitEffect)) {
      result[key as LimitKey] += value;
    }
  }

  return result;
}

export async function resolveOrganizationEntitlements(
  organizationId: string,
): Promise<OrganizationEntitlements> {
  const [subscription, purchases] = await Promise.all([
    db.subscription.findFirst({
      where: { referenceId: organizationId },
      orderBy: { updatedAt: "desc" },
    }),
    db.purchase.findMany({
      where: {
        organizationId,
        purchaseType: "one_time_product",
        status: "completed",
      },
      select: { itemKey: true },
    }),
  ]);

  const oneTimeProductIds = purchases.map((p) => p.itemKey);
  const base = getDefaultEntitlements({ organizationId });

  if (
    !subscription ||
    !hasPlanAccess(subscription.status) ||
    !isPlanId(subscription.plan)
  ) {
    return {
      ...base,
      limits: applyOneTimePurchaseLimits(base.limits, oneTimeProductIds),
      oneTimeProductIds,
    };
  }

  const subscriptionItems = await db.subscriptionItem.findMany({
    where: { subscriptionId: subscription.id, status: "active" },
    select: { itemKey: true, itemType: true, quantity: true },
  });

  const plan = getPlan(subscription.plan);
  const seats =
    subscription.seats ??
    subscriptionItems.find((item) => item.itemType === "plan")?.quantity ??
    null;

  return {
    billingInterval:
      subscription.billingInterval === "month" ||
      subscription.billingInterval === "year"
        ? subscription.billingInterval
        : null,
    capabilities: [...plan.capabilities],
    limits: applyOneTimePurchaseLimits({ ...plan.limits }, oneTimeProductIds),
    oneTimeProductIds,
    organizationId,
    planId: plan.id as PlanId,
    planName: plan.name,
    pricingModel: plan.pricingModel,
    seats,
    stripeCustomerId: subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    subscriptionStatus: subscription.status ?? null,
  };
}

export async function getCurrentOrganizationEntitlements() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return null;
  }

  return resolveOrganizationEntitlements(organization.id);
}
