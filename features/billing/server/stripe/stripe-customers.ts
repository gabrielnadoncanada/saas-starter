import { routes } from "@/constants/routes";
import { db } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";

export async function ensureStripeCustomer(organizationId: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      stripeCustomerId: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  if (organization.stripeCustomerId) {
    return organization.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    name: organization.name,
    metadata: {
      organizationId: organization.id,
      organizationName: organization.name,
    },
  });

  await db.organization.update({
    where: { id: organization.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function syncStripeCustomer(params: {
  customerId: string;
  organizationId: string;
}) {
  await db.organization.updateMany({
    where: { id: params.organizationId },
    data: { stripeCustomerId: params.customerId },
  });
}

export async function findOrganizationByCustomer(customerId: string) {
  const organization = await db.organization.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  return organization?.id ?? null;
}

export async function clearBillingState(customerId: string) {
  const [organizationResult, subscriptionResult] = await Promise.all([
    db.organization.updateMany({
      where: { stripeCustomerId: customerId },
      data: { stripeCustomerId: null },
    }),
    db.subscription.deleteMany({
      where: { stripeCustomerId: customerId },
    }),
  ]);

  return {
    clearedOrganizations: organizationResult.count,
    deletedSubscriptions: subscriptionResult.count,
  };
}

export async function createBillingPortalSession(
  organizationId: string,
) {
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
    organization?.stripeCustomerId ??
    latestSubscription?.stripeCustomerId ??
    null;

  if (!stripeCustomerId) {
    throw new Error("No Stripe customer exists for this organization.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: new URL(routes.settings.billing, process.env.BASE_URL).toString(),
  });

  return session.url;
}
