"use server";

import { redirect } from "next/navigation";

import { subscriptionCheckoutSchema } from "@/features/billing/schemas/checkout.schema";
import { updateOrganizationSubscriptionConfiguration } from "@/features/billing/server/stripe/stripe-subscriptions";
import {
  getCurrentOrganization,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

export const updateSubscriptionConfigurationAction =
  validatedAuthenticatedAction<typeof subscriptionCheckoutSchema>(
    subscriptionCheckoutSchema,
    async ({ billingInterval, planId, seatQuantity }) => {
      await requireActiveOrganizationRole(["owner"], {
        redirectTo: routes.settings.members,
      });

      const organization = await getCurrentOrganization();
      if (!organization) {
        throw new Error("Organization not found");
      }

      await updateOrganizationSubscriptionConfiguration({
        billingInterval,
        organizationId: organization.id,
        planId,
        seatQuantity: seatQuantity ?? organization.members.length,
      });

      redirect(routes.settings.billing);
    },
    {
      onUnauthenticated: () => {
        redirect(routes.auth.login);
      },
    },
  );
