"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createOrganizationBillingPortalSession } from "@/features/billing/server/better-auth-stripe";
import { routes } from "@/shared/constants/routes";
import {
  getRequiredOrganizationMembership,
  OrganizationMembershipError,
} from "@/features/organizations/server/get-required-organization-membership";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.auth.login);

  try {
    await getRequiredOrganizationMembership(user.id, ["owner"]);
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

  const url = await createOrganizationBillingPortalSession({
    organizationId: organization.id,
    reqHeaders: await headers(),
  });

  redirect(url);
}


