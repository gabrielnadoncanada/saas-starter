import type Stripe from "stripe";

import {
  buildRecurringSelectionItems,
  findCatalogRecurringPriceByPriceId,
} from "@/features/billing/catalog";
import type { BillingInterval, PlanId } from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";
import { stripe } from "@/shared/lib/stripe/client";

function buildRecurringItemKey(input: {
  componentKey: string;
  itemKey: string;
  itemType: "plan";
}) {
  return `${input.itemType}:${input.itemKey}:${input.componentKey}`;
}

export async function syncSubscriptionItems(
  subscriptionId: string,
  subscription: Stripe.Subscription,
) {
  const syncedStripeItemIds: string[] = [];

  for (const item of subscription.items.data) {
    const priceId = item.price.id;
    const catalogItem = findCatalogRecurringPriceByPriceId(priceId);

    if (!catalogItem) {
      continue;
    }

    syncedStripeItemIds.push(item.id);

    await db.subscriptionItem.upsert({
      where: { stripeSubscriptionItemId: item.id },
      update: {
        billingInterval: catalogItem.billingInterval,
        componentKey: catalogItem.componentKey,
        itemKey: catalogItem.itemKey,
        itemType: catalogItem.itemType,
        quantity: item.quantity ?? 1,
        status: "active",
        stripePriceId: priceId,
      },
      create: {
        subscriptionId,
        billingInterval: catalogItem.billingInterval,
        componentKey: catalogItem.componentKey,
        itemKey: catalogItem.itemKey,
        itemType: catalogItem.itemType,
        quantity: item.quantity ?? 1,
        status: "active",
        stripePriceId: priceId,
        stripeSubscriptionItemId: item.id,
      },
    });
  }

  await db.subscriptionItem.updateMany({
    where: {
      subscriptionId,
      ...(syncedStripeItemIds.length > 0
        ? { stripeSubscriptionItemId: { notIn: syncedStripeItemIds } }
        : {}),
    },
    data: { status: "canceled" },
  });
}

export async function updateOrganizationSubscriptionConfiguration(params: {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PlanId;
  seatQuantity: number;
}) {
  const subscriptionRecord = await db.subscription.findFirst({
    where: { referenceId: params.organizationId },
    orderBy: { updatedAt: "desc" },
    select: { stripeSubscriptionId: true },
  });

  if (!subscriptionRecord?.stripeSubscriptionId) {
    throw new Error(
      "No synced Stripe subscription was found for this workspace.",
    );
  }

  const currentSubscription = await stripe.subscriptions.retrieve(
    subscriptionRecord.stripeSubscriptionId,
    { expand: ["items.data.price"] },
  );
  const existingByKey = new Map<
    string,
    { priceId: string; quantity: number; stripeItemId: string }
  >();

  for (const item of currentSubscription.items.data) {
    const catalogItem = findCatalogRecurringPriceByPriceId(item.price.id);

    if (!catalogItem) {
      continue;
    }

    existingByKey.set(buildRecurringItemKey(catalogItem), {
      priceId: item.price.id,
      quantity: item.quantity ?? 1,
      stripeItemId: item.id,
    });
  }

  const desiredItems = buildRecurringSelectionItems(params);
  const desiredKeys = new Set(
    desiredItems.map((item) => buildRecurringItemKey(item)),
  );
  const stripeItems: Stripe.SubscriptionUpdateParams.Item[] = desiredItems.map(
    (item) => {
      const existing = existingByKey.get(buildRecurringItemKey(item));

      return existing
        ? {
            id: existing.stripeItemId,
            price: item.priceId,
            quantity: item.quantity,
          }
        : {
            price: item.priceId,
            quantity: item.quantity,
          };
    },
  );

  for (const [key, item] of existingByKey.entries()) {
    if (!desiredKeys.has(key)) {
      stripeItems.push({ deleted: true, id: item.stripeItemId });
    }
  }

  return stripe.subscriptions.update(currentSubscription.id, {
    items: stripeItems,
    metadata: {
      billingInterval: params.billingInterval,
      checkoutType: "subscription",
      organizationId: params.organizationId,
      planId: params.planId,
    },
    proration_behavior: "create_prorations",
  });
}
