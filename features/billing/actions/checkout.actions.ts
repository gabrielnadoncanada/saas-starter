"use server";

import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { isBillingInterval, isPlanId } from "@/features/billing/catalog";
import {
  oneTimeCheckoutSchema,
  subscriptionCheckoutSchema,
} from "@/features/billing/schemas/checkout.schema";
import {
  createOrganizationOneTimeCheckoutSession,
  createOrganizationSubscriptionCheckoutSession,
} from "@/features/billing/server/stripe/stripe-checkout";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { requireActiveOrganizationRole } from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";

export const startSubscriptionCheckoutAction = validatedAuthenticatedAction<
  typeof subscriptionCheckoutSchema
>(
  subscriptionCheckoutSchema,
  async ({ billingInterval, planId, seatQuantity }) => {
    await requireActiveOrganizationRole(["owner"], {
      redirectTo: routes.settings.members,
    });

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

export const startOneTimeCheckoutAction = validatedAuthenticatedAction<
  typeof oneTimeCheckoutSchema
>(
  oneTimeCheckoutSchema,
  async ({ itemKey }) => {
    await requireActiveOrganizationRole(["owner"], {
      redirectTo: routes.settings.members,
    });

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
    onUnauthenticated: () => {
      redirect(routes.auth.login);
    },
  },
);
