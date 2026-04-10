"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createOrganizationBillingPortalSession } from "@/features/billing/server/stripe/stripe-customers";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { requireActiveOrganizationRole } from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

const customerPortalSchema = z.object({});

export const customerPortalAction = validatedAuthenticatedAction<
  typeof customerPortalSchema
>(
  customerPortalSchema,
  async () => {
    await requireActiveOrganizationRole(["owner"], {
      redirectTo: routes.settings.members,
    });

    const organization = await getCurrentOrganization();
    if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
      redirect(routes.marketing.pricing);
    }

    const url = await createOrganizationBillingPortalSession(organization.id);

    redirect(url);
  },
  {
    onUnauthenticated: () => {
      redirect(routes.auth.login);
    },
  },
);
