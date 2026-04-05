import { getPlanDisplayPrice } from "@/features/billing/catalog";
import { createOrganizationSubscriptionCheckoutSession } from "@/features/billing/server/stripe/stripe-checkout";
import {
  type BillingInterval,
  type PaidPlanId,
} from "@/shared/config/billing.config";
import { auth } from "@/shared/lib/auth/auth-config";
import { hasOrgRole } from "@/shared/lib/db/enums";

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

  return createOrganizationSubscriptionCheckoutSession({
    billingInterval,
    organizationId: organization.id,
    planId,
    seatQuantity: organization.members.length,
  });
}
