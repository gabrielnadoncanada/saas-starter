import Stripe from "stripe";

import { db as defaultDb } from "@/shared/lib/db/prisma";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

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
    return;
  }

  if (status === "active" || status === "trialing") {
    const plan = subscription.items.data[0]?.plan;
    const productId = plan?.product as string;

    let planName: string | null = null;
    if (productId) {
      const product = await deps.stripe.products.retrieve(productId);
      planName = product.name;
    }

    await deps.db.team.update({
      where: { id: team.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName,
        subscriptionStatus: status,
      },
    });

    return;
  }

  if (status === "canceled" || status === "unpaid") {
    await deps.db.team.update({
      where: { id: team.id },
      data: {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: status,
      },
    });
  }
}
