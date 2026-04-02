"use server";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { createOrganizationCheckoutSession } from "@/features/billing/server/stripe/stripe-checkout";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import {
  getPlanPrice,
  isBillingInterval,
  isPlanId,
} from "@/shared/config/billing.config";
import { redirectToLocale } from "@/shared/i18n/href";
import { getRequestLocale } from "@/shared/i18n/server-locale";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const locale = user?.preferredLocale ?? (await getRequestLocale());
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;

  if (!user) {
    redirectToLocale(
      locale,
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          billingInterval:
            billingInterval && isBillingInterval(billingInterval)
              ? billingInterval
              : null,
          planId:
            planId && isPlanId(planId) && planId !== "free" ? planId : null,
          redirect: "checkout",
        }),
      ),
    );
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
  if (!organization) throw new Error("Organization not found");

  if (
    !planId ||
    !isPlanId(planId) ||
    planId === "free" ||
    !billingInterval ||
    !isBillingInterval(billingInterval) ||
    !getPlanPrice(planId, billingInterval)
  ) {
    throw new Error("Invalid billing selection.");
  }

  const url = await createOrganizationCheckoutSession({
    billingInterval,
    organizationId: organization.id,
    planId,
    seatQuantity: organization.members.length,
  });

  redirectToLocale(locale, url);
}

