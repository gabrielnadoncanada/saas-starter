"use server";

import { redirect } from "next/navigation";

import {
  getPlanDisplayPrice,
  isBillingInterval,
  isPlanId,
} from "@/features/billing/catalog";
import { requireBillingOwner } from "@/features/billing/require-billing-owner";
import { updateOrganizationSubscriptionConfiguration } from "@/features/billing/server/stripe/stripe-subscription-items";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function updateSubscriptionConfigurationAction(
  formData: FormData,
) {
  const user = await getCurrentUser();
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const rawSeatQuantity = formData.get("seatQuantity");
  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;
  const seatQuantity =
    typeof rawSeatQuantity === "string" ? Number(rawSeatQuantity) : NaN;

  if (!user) {
    redirect(routes.auth.login);
  }

  await requireBillingOwner();

  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error("Organization not found");
  }

  if (
    !planId ||
    !isPlanId(planId) ||
    planId === "free" ||
    !billingInterval ||
    !isBillingInterval(billingInterval) ||
    !getPlanDisplayPrice(planId, billingInterval)
  ) {
    throw new Error("Invalid billing selection.");
  }

  await updateOrganizationSubscriptionConfiguration({
    billingInterval,
    organizationId: organization.id,
    planId,
    seatQuantity: Number.isFinite(seatQuantity)
      ? Math.max(1, seatQuantity)
      : organization.members.length,
  });

  redirect(routes.settings.billing);
}
