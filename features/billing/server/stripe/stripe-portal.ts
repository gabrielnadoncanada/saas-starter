import { routes } from "@/shared/constants/routes";
import { db } from "@/shared/lib/db/prisma";
import { stripe } from "@/shared/lib/stripe/client";

export async function createOrganizationBillingPortalSession(organizationId: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: { stripeCustomerId: true },
  });

  if (!organization?.stripeCustomerId) {
    throw new Error("No Stripe customer exists for this organization.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: `${process.env.BASE_URL}${routes.settings.billing}`,
  });

  return session.url;
}
