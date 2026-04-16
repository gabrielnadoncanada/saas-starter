"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { subscriptionCheckoutSchema } from "@/features/billing/checkout.schema";
import { changeSubscription } from "@/features/billing/server/stripe/stripe-subscriptions";
import {
  getCurrentOrganization,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { throwIfDemo } from "@/lib/demo";

export async function changePlanAction(formData: FormData) {
  throwIfDemo("Plan changes are disabled in demo mode.");
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  await requireActiveOrganizationRole(["owner"], {
    redirectTo: routes.settings.members,
  });

  const { billingInterval, planId } = subscriptionCheckoutSchema.parse(
    Object.fromEntries(formData),
  );

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
}
