"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { createBillingPortalSession } from "@/features/billing/server/stripe/stripe-customers";
import {
  getCurrentOrganization,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function openBillingPortalAction() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  await requireActiveOrganizationRole(["owner"], {
    redirectTo: routes.settings.members,
  });

  const organization = await getCurrentOrganization();
  if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
    redirect(routes.marketing.pricing);
  }

  const url = await createBillingPortalSession(organization.id);

  redirect(url);
}
