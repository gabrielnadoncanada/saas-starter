"use server";

import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { isBillingInterval, isPlanId } from "@/features/billing/plans";
import {
  oneTimeCheckoutSchema,
  subscriptionCheckoutSchema,
} from "@/features/billing/checkout.schema";
import {
  createOrganizationOneTimeCheckoutSession,
  createOrganizationSubscriptionCheckoutSession,
} from "@/features/billing/server/stripe/stripe-checkout";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { routes } from "@/shared/constants/routes";
import { validatedOrganizationOwnerAction } from "@/shared/lib/auth/authenticated-action";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";

export const startSubscriptionCheckoutAction = validatedOrganizationOwnerAction(
  subscriptionCheckoutSchema,
  async ({ billingInterval, planId, seatQuantity }) => {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    const url = await createOrganizationSubscriptionCheckoutSession({
      billingInterval,
      organizationId: organization.id,
      planId,
      seatQuantity: seatQuantity ?? organization.members.length,
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

export const startOneTimeCheckoutAction = validatedOrganizationOwnerAction(
  oneTimeCheckoutSchema,
  async ({ itemKey }) => {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    const url = await createOrganizationOneTimeCheckoutSession({
      itemKey,
      organizationId: organization.id,
    });

    redirect(url);
  },
  {
    redirectTo: routes.settings.members,
    onUnauthenticated: () => {
      redirect(routes.auth.login);
    },
  },
);
