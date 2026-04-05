"use server";

import { redirect } from "next/navigation";

import { requireBillingOwner } from "@/features/billing/require-billing-owner";
import { createOrganizationBillingPortalSession } from "@/features/billing/server/stripe/stripe-portal";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function customerPortalAction() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  await requireBillingOwner();

  const organization = await getCurrentOrganization();
  if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
    redirect(routes.marketing.pricing);
  }

  const url = await createOrganizationBillingPortalSession(organization.id);

  redirect(url);
}
