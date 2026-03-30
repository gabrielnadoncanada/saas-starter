import { routes } from "@/shared/constants/routes";
import { db } from "@/shared/lib/db/prisma";
import { stripe } from "@/shared/lib/stripe/client";

export async function createOrganizationBillingPortalSession(organizationId: string) {
  const [organization, latestSubscription] = await Promise.all([
    db.organization.findUnique({
      where: { id: organizationId },
      select: { stripeCustomerId: true },
    }),
    db.subscription.findFirst({
      where: { referenceId: organizationId },
      orderBy: { updatedAt: "desc" },
      select: { stripeCustomerId: true },
    }),
  ]);

  const stripeCustomerId =
    organization?.stripeCustomerId ?? latestSubscription?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    throw new Error("No Stripe customer exists for this organization.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.BASE_URL}${routes.settings.billing}`,
  });

  return session.url;
}
