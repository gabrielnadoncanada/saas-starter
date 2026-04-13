import {
  type BillingInterval,
  type PaidPlanId,
} from "@/config/billing.config";
import { getPlanDisplayPrice } from "@/features/billing/plans";
import { createSubscriptionCheckout } from "@/features/billing/server/stripe/stripe-checkout";
import { auth } from "@/lib/auth/auth-config";
import { hasOrgRole } from "@/lib/db/enums";

type ResumeCheckoutAfterSignInParams = {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PaidPlanId;
  reqHeaders: Headers;
};

export async function resumeCheckoutAfterSignIn({
  billingInterval,
  organizationId,
  planId,
  reqHeaders,
}: ResumeCheckoutAfterSignInParams) {
  if (!getPlanDisplayPrice(planId, billingInterval)) {
    return null;
  }

  const organization = await auth.api.getFullOrganization({
    query: { organizationId },
    headers: reqHeaders,
  });

  if (!organization) {
    throw new Error("Organization not found after sign-in provisioning.");
  }

  const currentMember = organization.members.find((m: { role: string }) =>
    hasOrgRole(m.role, "owner"),
  );

  if (!currentMember) {
    return null;
  }

  return createSubscriptionCheckout({
    billingInterval,
    organizationId: organization.id,
    planId,
  });
}
