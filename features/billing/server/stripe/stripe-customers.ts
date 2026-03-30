import { db } from "@/shared/lib/db/prisma";
import { stripe } from "@/shared/lib/stripe/client";

export async function ensureOrganizationStripeCustomer(organizationId: string) {
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

export async function syncOrganizationStripeCustomer(params: {
  customerId: string;
  organizationId: string;
}) {
  await db.organization.updateMany({
    where: { id: params.organizationId },
    data: { stripeCustomerId: params.customerId },
  });
}

export async function findOrganizationIdByStripeCustomerId(customerId: string) {
  const organization = await db.organization.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  return organization?.id ?? null;
}

export async function clearStripeCustomerBillingState(customerId: string) {
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
