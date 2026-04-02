"use server";

import { redirect } from "next/navigation";

import { createOrganizationBillingPortalSession } from "@/features/billing/server/stripe/stripe-portal";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.auth.login);

  try {
    await requireActiveOrganizationRole(["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirect(routes.settings.members);
    }

    throw error;
  }

  const organization = await getCurrentOrganization();
  if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
    redirect(routes.marketing.pricing);
  }

  const url = await createOrganizationBillingPortalSession(organization.id);

  redirect(url);
}
