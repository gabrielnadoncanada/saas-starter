import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/better-auth-stripe";
import { auth } from "@/shared/lib/auth";
import { getAuthSession } from "@/shared/lib/auth/get-session";

export async function getCurrentOrganization() {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  const reqHeaders = await headers();
  const orgId = session.session.activeOrganizationId ?? null;

  if (!orgId) {
    return null;
  }

  const [organization, subscription] = await Promise.all([
    auth.api.getFullOrganization({
      query: { organizationId: orgId },
      headers: reqHeaders,
    }),
    getOrganizationSubscriptionSnapshot(orgId, reqHeaders),
  ]);

  if (!organization) {
    return null;
  }

  return {
    ...organization,
    stripeCustomerId: (organization as any).stripeCustomerId ?? null,
    ...subscription,
  };
}
