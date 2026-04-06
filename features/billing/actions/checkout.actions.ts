"use server";

import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { isBillingInterval } from "@/features/billing/billing-intervals";
import { getOneTimeProduct, isPlanId } from "@/features/billing/catalog";
import { parseSubscriptionForm } from "@/features/billing/server/parse-subscription-form";
import {
  createOrganizationOneTimeCheckoutSession,
  createOrganizationSubscriptionCheckoutSession,
} from "@/features/billing/server/stripe/stripe-checkout";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { requireActiveOrganizationRole } from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function startSubscriptionCheckoutAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    const rawPlanId = formData.get("planId");
    const rawInterval = formData.get("billingInterval");
    const planId =
      typeof rawPlanId === "string" && isPlanId(rawPlanId) && rawPlanId !== "free"
        ? rawPlanId
        : null;
    const billingInterval =
      typeof rawInterval === "string" && isBillingInterval(rawInterval)
        ? rawInterval
        : null;

    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({ billingInterval, planId, redirect: "checkout" }),
      ),
    );
  }

  await requireActiveOrganizationRole(["owner"], {
    redirectTo: routes.settings.members,
  });

  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error("Organization not found");
  }

  const selection = parseSubscriptionForm(formData);

  const url = await createOrganizationSubscriptionCheckoutSession({
    billingInterval: selection.billingInterval,
    organizationId: organization.id,
    planId: selection.planId,
    seatQuantity: selection.seatQuantity ?? organization.members.length,
  });

  redirect(url);
}

export async function startOneTimeCheckoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const itemKey = formData.get("itemKey");
  const itemType = formData.get("itemType");

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

  if (typeof itemKey !== "string" || itemType !== "one_time_product") {
    throw new Error("Invalid one-time purchase selection.");
  }

  const item = getOneTimeProduct(itemKey);

  if (!item?.price) {
    throw new Error("The selected purchase is not configured.");
  }

  const url = await createOrganizationOneTimeCheckoutSession({
    itemKey,
    organizationId: organization.id,
  });

  redirect(url);
}
