import { db as defaultDb } from "@/shared/lib/db/prisma";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

export async function syncSeatQuantity(
  teamId: number,
  deps = { db: defaultDb, stripe: defaultStripe },
) {
  try {
    const team = await deps.db.team.findUnique({
      where: { id: teamId },
      select: {
        pricingModel: true,
        stripeSubscriptionId: true,
        _count: { select: { teamMembers: true } },
      },
    });

    if (!team || team.pricingModel !== "per_seat" || !team.stripeSubscriptionId) {
      return;
    }

    const subscription = await deps.stripe.subscriptions.retrieve(
      team.stripeSubscriptionId,
    );

    const itemId = subscription.items.data[0]?.id;
    if (!itemId) return;

    await deps.stripe.subscriptionItems.update(itemId, {
      quantity: team._count.teamMembers,
    });
  } catch (error) {
    console.error("Failed to sync seat quantity for team", teamId, error);
  }
}
