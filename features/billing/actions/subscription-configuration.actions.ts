"use server";

import {
  getPlanDisplayPrice,
  isBillingInterval,
  isPlanId,
  listRecurringAddons,
} from "@/features/billing/catalog/resolver";
import { updateOrganizationSubscriptionConfiguration } from "@/features/billing/server/stripe/stripe-subscription-items";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { getRequestLocale } from "@/shared/i18n/server-locale";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function updateSubscriptionConfigurationAction(formData: FormData) {
  const user = await getCurrentUser();
  const locale = user?.preferredLocale ?? (await getRequestLocale());
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const rawSeatQuantity = formData.get("seatQuantity");
  const addonIds = formData
    .getAll("addonIds")
    .filter((value): value is string => typeof value === "string")
    .filter((addonId) => listRecurringAddons().some((addon) => addon.id === addonId));
  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;
  const seatQuantity =
    typeof rawSeatQuantity === "string" ? Number(rawSeatQuantity) : NaN;

  if (!user) {
    redirectToLocale(locale, routes.auth.login);
  }

  try {
    await requireActiveOrganizationRole(["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirectToLocale(locale, routes.settings.members);
    }

    throw error;
  }

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
    addonIds,
    billingInterval,
    organizationId: organization.id,
    planId,
    seatQuantity: Number.isFinite(seatQuantity)
      ? Math.max(1, seatQuantity)
      : organization.members.length,
  });

  redirectToLocale(locale, routes.settings.billing);
}
