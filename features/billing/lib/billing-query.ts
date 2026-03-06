import { db } from '@/lib/db/prisma';

export async function getTeamByStripeCustomerId(customerId: string) {
  return db.team.findFirst({
    where: { stripeCustomerId: customerId }
  });
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db.team.update({
    where: { id: teamId },
    data: subscriptionData
  });
}
