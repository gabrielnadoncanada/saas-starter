import Stripe from "stripe";

import {
  isTerminalStripeSubscriptionStatus,
  resolvePlanFromStripeProduct,
  resolvePricingModel,
} from "@/features/billing/plans";
import { db as defaultDb } from "@/shared/lib/db/prisma";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

function shouldClearBillingState(subscription: Stripe.Subscription) {
  if (!isTerminalStripeSubscriptionStatus(subscription.status)) {
    return false;
  }

  if (!subscription.cancel_at_period_end) {
    return true;
  }

  const currentPeriodEnd = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;

  if (!currentPeriodEnd) {
    return false;
  }

  return currentPeriodEnd * 1000 <= Date.now();
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  deps = { db: defaultDb, stripe: defaultStripe },
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await deps.db.team.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!team) {
    console.error("Team not found for Stripe customer:", customerId);
    return;
  }

  if (team.pricingModel === "one_time") {
    console.info("Ignoring subscription webhook for one-time team", {
      customerId,
      subscriptionId,
    });
    return;
  }

  const price = subscription.items.data[0]?.price;
  const productId =
    typeof price?.product === "string" ? price.product : price?.product?.id;

  let planName = team.planName;
  let planId = team.planId;
  let pricingModel = team.pricingModel;

  if (productId) {
    const product = await deps.stripe.products.retrieve(productId);
    planName = product.name;
    planId = resolvePlanFromStripeProduct(product);
    pricingModel = resolvePricingModel(product.metadata);
  }

  const shouldClear = shouldClearBillingState(subscription);

  await deps.db.team.update({
    where: { id: team.id },
    data: {
      planId: shouldClear ? null : planId,
      stripeSubscriptionId: shouldClear ? null : subscriptionId,
      stripeProductId: shouldClear ? null : (productId ?? team.stripeProductId),
      planName: shouldClear ? null : planName,
      subscriptionStatus: status,
      pricingModel: shouldClear ? null : pricingModel,
    },
  });
}
