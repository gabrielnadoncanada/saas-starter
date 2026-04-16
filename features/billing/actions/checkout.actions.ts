"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { subscriptionCheckoutSchema } from "@/features/billing/checkout.schema";
import { isBillingInterval, isPlanId } from "@/features/billing/plans";
import { createSubscriptionCheckout } from "@/features/billing/server/stripe/stripe-checkout";
import {
  getCurrentOrganization,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { buildCallbackURL } from "@/lib/auth/callback-url";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { enforceActionRateLimit } from "@/lib/rate-limit";

export async function startSubscriptionCheckoutAction(formData: FormData) {
  const rawValues = Object.fromEntries(formData);
  const user = await getCurrentUser();

  if (!user) {
    const planId =
      typeof rawValues.planId === "string" &&
      isPlanId(rawValues.planId) &&
      rawValues.planId !== "free"
        ? rawValues.planId
        : null;
    const billingInterval =
      typeof rawValues.billingInterval === "string" &&
      isBillingInterval(rawValues.billingInterval)
        ? rawValues.billingInterval
        : null;

    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          billingInterval,
          planId,
          redirect: "checkout",
        }),
      ),
    );
  }

  await requireActiveOrganizationRole(["owner"], {
    redirectTo: routes.settings.members,
  });

  const limited = await enforceActionRateLimit("checkout");
  if (limited) {
    throw new Error(limited.error);
  }

  const { billingInterval, planId } =
    subscriptionCheckoutSchema.parse(rawValues);
  const organization = await getCurrentOrganization();

  if (!organization) {
    throw new Error("Organization not found");
  }

  const url = await createSubscriptionCheckout({
    billingInterval,
    organizationId: organization.id,
    planId,
  });

  redirect(url);
}
