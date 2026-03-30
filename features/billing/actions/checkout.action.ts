"use server";

import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { createOrganizationCheckoutSession } from "@/features/billing/server/stripe/stripe-checkout";
import {
  getPlanPrice,
  isBillingInterval,
  isPlanId,
} from "@/features/billing/plans";
import {
  getRequiredOrganizationMembership,
  OrganizationMembershipError,
} from "@/features/organizations/server/get-required-organization-membership";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { routes } from "@/shared/constants/routes";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;

  if (!user) {
    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          billingInterval:
            billingInterval && isBillingInterval(billingInterval)
              ? billingInterval
              : null,
          planId: planId && isPlanId(planId) && planId !== "free" ? planId : null,
          redirect: "checkout",
        }),
      ),
    );
  }

  try {
    await getRequiredOrganizationMembership(user.id, ["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirect(routes.settings.members);
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

  redirect(url);
}


