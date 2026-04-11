"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createOrganizationBillingPortalSession } from "@/features/billing/server/stripe/stripe-customers";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { routes } from "@/shared/constants/routes";
import { validatedOrganizationOwnerAction } from "@/shared/lib/auth/authenticated-action";

const customerPortalSchema = z.object({});

export const customerPortalAction = validatedOrganizationOwnerAction(
  customerPortalSchema,
  async () => {
    const organization = await getCurrentOrganization();
    if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
      redirect(routes.marketing.pricing);
    }

    const url = await createOrganizationBillingPortalSession(organization.id);

    redirect(url);
  },
  {
    redirectTo: routes.settings.members,
    onUnauthenticated: () => {
      redirect(routes.auth.login);
    },
  },
);
