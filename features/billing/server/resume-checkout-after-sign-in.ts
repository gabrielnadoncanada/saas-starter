import {
  type BillingInterval,
  getPlanPrice,
  type PaidPlanId,
} from "@/features/billing/plans";
import { createOrganizationCheckoutSession } from "@/features/billing/server/stripe/stripe-checkout";
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
  if (!getPlanPrice(planId, billingInterval)) {
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

  return createOrganizationCheckoutSession({
    billingInterval,
    organizationId: organization.id,
    planId,
    seatQuantity: organization.members.length,
  });
}
