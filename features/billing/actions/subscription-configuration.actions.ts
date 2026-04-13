"use server";

import { redirect } from "next/navigation";

import { subscriptionCheckoutSchema } from "@/features/billing/checkout.schema";
import { changeSubscription } from "@/features/billing/server/stripe/stripe-subscriptions";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { routes } from "@/shared/constants/routes";
import { validatedOrganizationOwnerAction } from "@/shared/lib/auth/authenticated-action";

export const changePlanAction =
  validatedOrganizationOwnerAction(
    subscriptionCheckoutSchema,
    async ({ billingInterval, planId }) => {
      const organization = await getCurrentOrganization();
      if (!organization) {
        throw new Error("Organization not found");
      }

      await changeSubscription({
        billingInterval,
        organizationId: organization.id,
        planId,
      });

      redirect(routes.settings.billing);
    },
    {
      redirectTo: routes.settings.members,
      onUnauthenticated: () => {
        redirect(routes.auth.login);
      },
    },
  );
