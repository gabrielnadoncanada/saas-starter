import Stripe from 'stripe';

import { db as defaultDb } from '@/lib/db/prisma';

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  deps = { db: defaultDb }
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await deps.db.team.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;

    await deps.db.team.update({
      where: { id: team.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        stripeProductId: plan?.product as string,
        planName: (plan?.product as Stripe.Product).name,
        subscriptionStatus: status
      }
    });

    return;
  }

  if (status === 'canceled' || status === 'unpaid') {
    await deps.db.team.update({
      where: { id: team.id },
      data: {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: status
      }
    });
  }
}
