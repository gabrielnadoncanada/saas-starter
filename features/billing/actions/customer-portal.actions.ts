"use server";

import { createOrganizationBillingPortalSession } from "@/features/billing/server/stripe/stripe-portal";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { getRequestLocale } from "@/shared/i18n/server-locale";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function customerPortalAction() {
  const user = await getCurrentUser();
  const locale = user?.preferredLocale ?? (await getRequestLocale());

  if (!user) {
    redirectToLocale(locale, routes.auth.login);
  }

  try {
    await requireActiveOrganizationRole(["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirectToLocale(locale, routes.settings.members);
    }

    throw error;
  }

  const organization = await getCurrentOrganization();
  if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
    redirectToLocale(locale, routes.marketing.pricing);
  }

  const url = await createOrganizationBillingPortalSession(organization.id);

  redirectToLocale(locale, url);
}

