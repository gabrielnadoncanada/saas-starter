"use server";

import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import {
  getCreditPack,
  getOneTimeProduct,
  getPlanDisplayPrice,
  isBillingInterval,
  isPlanId,
  listRecurringAddons,
} from "@/features/billing/catalog/resolver";
import {
  createOrganizationOneTimeCheckoutSession,
  createOrganizationSubscriptionCheckoutSession,
} from "@/features/billing/server/stripe/stripe-checkout";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

async function requireBillingOwner() {
  try {
    await requireActiveOrganizationRole(["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirect(routes.settings.members);
    }

    throw error;
  }
}

export async function startSubscriptionCheckoutAction(formData: FormData) {
  const user = await getCurrentUser();
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
    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          billingInterval:
            billingInterval && isBillingInterval(billingInterval)
              ? billingInterval
              : null,
          planId: planId && isPlanId(planId) && planId !== "free" ? planId : null,
          redirect: "checkout",
        }),
      ),
    );
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

  const url = await createOrganizationSubscriptionCheckoutSession({
    addonIds,
    billingInterval,
    organizationId: organization.id,
    planId,
    seatQuantity: Number.isFinite(seatQuantity)
      ? Math.max(1, seatQuantity)
      : organization.members.length,
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

  await requireBillingOwner();

  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error("Organization not found");
  }

  if (
    typeof itemKey !== "string" ||
    (itemType !== "one_time_product" && itemType !== "credit_pack")
  ) {
    throw new Error("Invalid one-time purchase selection.");
  }

  const item =
    itemType === "credit_pack" ? getCreditPack(itemKey) : getOneTimeProduct(itemKey);

  if (!item?.price) {
    throw new Error("The selected purchase is not configured.");
  }

  const url = await createOrganizationOneTimeCheckoutSession({
    itemKey,
    itemType,
    organizationId: organization.id,
  });

  redirect(url);
}

export async function buyCreditPackAction(formData: FormData) {
  const creditPackId = formData.get("itemKey");

  if (typeof creditPackId !== "string" || !getCreditPack(creditPackId)) {
    throw new Error("Invalid credit pack selection.");
  }

  formData.set("itemType", "credit_pack");
  return startOneTimeCheckoutAction(formData);
}
