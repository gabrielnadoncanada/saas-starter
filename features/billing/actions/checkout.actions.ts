"use server";

import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { isBillingInterval, isPlanId } from "@/features/billing/plans";
import { subscriptionCheckoutSchema } from "@/features/billing/checkout.schema";
import { createSubscriptionCheckout } from "@/features/billing/server/stripe/stripe-checkout";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { routes } from "@/shared/constants/routes";
import { validatedOrganizationOwnerAction } from "@/shared/lib/auth/authenticated-action";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";

export const startSubscriptionCheckoutAction = validatedOrganizationOwnerAction(
  subscriptionCheckoutSchema,
  async ({ billingInterval, planId }) => {
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
  },
  {
    redirectTo: routes.settings.members,
    onUnauthenticated: (_, rawValues) => {
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
    },
  },
);
