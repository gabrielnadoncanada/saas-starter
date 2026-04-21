"use server";

import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { subscriptionCheckoutSchema } from "@/features/billing/checkout.schema";
import {
  isBillingInterval,
  isPlanId,
} from "@/features/billing/plans";
import { applyDemoSubscriptionChange } from "@/features/billing/server/demo-subscription";
import { createSubscriptionCheckout } from "@/features/billing/server/stripe/stripe-checkout";
import {
  getCurrentOrganization,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { buildCallbackURL } from "@/lib/auth/callback-url";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isDemoMode } from "@/lib/demo";
import { enforceActionRateLimit } from "@/lib/rate-limit";

function readPaidPlanId(raw: FormDataEntryValue | null) {
  return typeof raw === "string" && isPlanId(raw) && raw !== "free"
    ? raw
    : null;
}

function readBillingInterval(raw: FormDataEntryValue | null) {
  return typeof raw === "string" && isBillingInterval(raw) ? raw : null;
}

export async function startSubscriptionCheckoutAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          billingInterval: readBillingInterval(formData.get("billingInterval")),
          planId: readPaidPlanId(formData.get("planId")),
          redirect: "checkout",
        }),
      ),
    );
  }

  await requireActiveOrganizationRole(["owner"], {
    redirectTo: routes.settings.members,
  });

  const limited = await enforceActionRateLimit("checkout");
  if (limited) {
    throw new Error(limited.error);
  }

  const { billingInterval, planId } = subscriptionCheckoutSchema.parse(
    Object.fromEntries(formData),
  );
  const organization = await getCurrentOrganization();

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (isDemoMode()) {
    await applyDemoSubscriptionChange({
      billingInterval,
      organizationId: organization.id,
      planId,
    });
    redirect(`${routes.settings.billing}?checkout=success`);
  }

  const url = await createSubscriptionCheckout({
    billingInterval,
    organizationId: organization.id,
    planId,
  });

  redirect(url);
}
