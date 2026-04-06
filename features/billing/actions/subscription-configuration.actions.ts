"use server";

import { redirect } from "next/navigation";

import { parseSubscriptionForm } from "@/features/billing/catalog";
import { updateOrganizationSubscriptionConfiguration } from "@/features/billing/server/stripe/stripe-subscription-items";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { requireActiveOrganizationRole } from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function updateSubscriptionConfigurationAction(
  formData: FormData,
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  await requireActiveOrganizationRole(["owner"], {
    redirectTo: routes.settings.members,
  });

  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error("Organization not found");
  }

  const selection = parseSubscriptionForm(formData);

  await updateOrganizationSubscriptionConfiguration({
    billingInterval: selection.billingInterval,
    organizationId: organization.id,
    planId: selection.planId,
    seatQuantity: selection.seatQuantity ?? organization.members.length,
  });

  redirect(routes.settings.billing);
}
