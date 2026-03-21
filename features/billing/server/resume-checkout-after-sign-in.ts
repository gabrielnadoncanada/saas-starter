import { createOrganizationCheckoutSession } from "@/features/billing/server/better-auth-stripe";
import { isConfiguredStripePriceId } from "@/features/billing/plans";
import { auth } from "@/shared/lib/auth";

type ResumeCheckoutAfterSignInParams = {
  organizationId: string;
  priceId: string;
  reqHeaders: Headers;
};

export async function resumeCheckoutAfterSignIn({
  organizationId,
  priceId,
  reqHeaders,
}: ResumeCheckoutAfterSignInParams) {
  if (!isConfiguredStripePriceId(priceId)) {
    return null;
  }

  const organization = await auth.api.getFullOrganization({
    query: { organizationId },
    headers: reqHeaders,
  });

  if (!organization) {
    throw new Error("Organization not found after sign-in provisioning.");
  }

  const currentMember = organization.members.find(
    (m: { userId: string; role: string }) => m.role === "owner",
  );

  if (!currentMember) {
    return null;
  }

  return createOrganizationCheckoutSession({
    organizationId: organization.id,
    priceId,
    reqHeaders,
    seatQuantity: organization.members.length,
  });
}
