import "server-only";

import {
  applyEntitlementDeltas,
  getDefaultEntitlements,
  getPlan,
  isPlanId,
} from "@/features/billing/catalog/resolver";
import { hasPlanAccess } from "@/features/billing/plans/subscription-status";
import { getCreditBalance } from "@/features/billing/server/credits";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import type {
  OrganizationEntitlements,
  PlanId,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

async function getLatestSubscription(organizationId: string) {
  return db.subscription.findFirst({
    where: { referenceId: organizationId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function resolveOrganizationEntitlements(
  organizationId: string,
): Promise<OrganizationEntitlements> {
  const [subscription, purchases, creditBalance] = await Promise.all([
    getLatestSubscription(organizationId),
    db.purchase.findMany({
      where: {
        organizationId,
        purchaseType: "one_time_product",
        status: "completed",
      },
      select: { itemKey: true },
    }),
    getCreditBalance(organizationId),
  ]);

  const base = getDefaultEntitlements({
    organizationId,
    creditBalance: creditBalance.total,
    creditBalancePurchased: creditBalance.purchased,
    creditBalanceSubscription: creditBalance.subscription,
  });

  if (!subscription || !hasPlanAccess(subscription.status) || !isPlanId(subscription.plan)) {
    return applyEntitlementDeltas(base, {
      activeAddonIds: [],
      oneTimeProductIds: purchases.map((purchase) => purchase.itemKey),
    });
  }

  const subscriptionItems = await db.subscriptionItem.findMany({
    where: {
      subscriptionId: subscription.id,
      status: "active",
    },
    select: {
      itemKey: true,
      itemType: true,
      quantity: true,
    },
  });

  const plan = getPlan(subscription.plan);
  const activeAddonIds = subscriptionItems
    .filter((item) => item.itemType === "addon")
    .map((item) => item.itemKey);
  const seats =
    subscription.seats ??
    subscriptionItems.find((item) => item.itemType === "plan")?.quantity ??
    null;

  return applyEntitlementDeltas(
    {
      ...base,
      billingInterval:
        subscription.billingInterval === "month" ||
        subscription.billingInterval === "year"
          ? subscription.billingInterval
          : null,
      capabilities: [...plan.capabilities],
      includedMonthlyCredits: plan.includedMonthlyCredits,
      limits: { ...plan.limits },
      planId: plan.id as PlanId,
      planName: plan.name,
      pricingModel: plan.pricingModel,
      seats,
      stripeCustomerId: subscription.stripeCustomerId ?? null,
      stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
      subscriptionStatus: subscription.status ?? null,
    },
    {
      activeAddonIds,
      oneTimeProductIds: purchases.map((purchase) => purchase.itemKey),
    },
  );
}

export async function getCurrentOrganizationEntitlements() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return null;
  }

  return resolveOrganizationEntitlements(organization.id);
}
