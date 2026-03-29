import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/better-auth-stripe";
import { auth } from "@/shared/lib/auth";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

function hasActiveSubscription(status: string | null | undefined) {
  return (
    !!status &&
    ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number])
  );
}

export async function getAccountDeletionBlocker(userId: string) {
  const reqHeaders = await headers();

  const orgs = await auth.api.listOrganizations({ headers: reqHeaders });

  for (const org of orgs ?? []) {
    const fullOrg = await auth.api.getFullOrganization({
      query: { organizationId: org.id },
      headers: reqHeaders,
    });

    if (!fullOrg) continue;

    const members = fullOrg.members ?? [];
    const userMember = members.find(
      (m: { userId: string }) => m.userId === userId,
    );

    if (userMember?.role !== "owner") continue;

    const otherOwnerCount = members.filter(
      (m: { userId: string; role: string }) =>
        m.role === "owner" && m.userId !== userId,
    ).length;

    if (otherOwnerCount === 0 && members.length > 1) {
      return `You are the sole owner of "${fullOrg.name}". Transfer ownership before deleting your account.`;
    }

    const subscription = await getOrganizationSubscriptionSnapshot(fullOrg.id, await headers());

    if (
      otherOwnerCount === 0 &&
      hasActiveSubscription(subscription.subscriptionStatus)
    ) {
      return `Cancel the subscription for "${fullOrg.name}" before deleting your account.`;
    }
  }

  return null;
}
