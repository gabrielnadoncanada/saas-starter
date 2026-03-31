import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
import { auth } from "@/shared/lib/auth/auth-config";
import { hasOrgRole } from "@/shared/lib/db/enums";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

function hasActiveSubscription(status: string | null | undefined) {
  return (
    !!status &&
    ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number])
  );
}

function formatPeriodEnd(periodEnd: Date | null) {
  if (!periodEnd) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(periodEnd);
}

function hasScheduledCancellation(subscription: {
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
}) {
  return subscription.cancelAtPeriodEnd || Boolean(subscription.cancelAt);
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

    if (!hasOrgRole(userMember?.role, "owner")) continue;

    const otherOwnerCount = members.filter(
      (m: { userId: string; role: string }) =>
        hasOrgRole(m.role, "owner") && m.userId !== userId,
    ).length;

    if (otherOwnerCount === 0 && members.length > 1) {
      return `You are the sole owner of "${fullOrg.name}". Transfer ownership before deleting your account.`;
    }

    const subscription = await getOrganizationSubscriptionSnapshot(fullOrg.id);

    if (
      otherOwnerCount === 0 &&
      hasActiveSubscription(subscription.subscriptionStatus)
    ) {
      if (hasScheduledCancellation(subscription)) {
        const periodEnd = formatPeriodEnd(subscription.periodEnd);

        return periodEnd
          ? `The subscription for "${fullOrg.name}" is already canceled and will end on ${periodEnd}. Wait until it ends before deleting your account.`
          : `The subscription for "${fullOrg.name}" is already canceled but still active until the current billing period ends. Wait until it ends before deleting your account.`;
      }

      return `Cancel the subscription for "${fullOrg.name}" before deleting your account.`;
    }
  }

  return null;
}
