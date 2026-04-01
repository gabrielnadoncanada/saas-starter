import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
import { auth } from "@/shared/lib/auth/auth-config";
import { hasOrgRole } from "@/shared/lib/db/enums";

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

function isActiveSubscription(status: string | null | undefined) {
  return (
    !!status &&
    ACTIVE_SUBSCRIPTION_STATUSES.includes(
      status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number],
    )
  );
}

function formatSubscriptionEndDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function isSubscriptionEndingLater(subscription: {
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
}) {
  return subscription.cancelAtPeriodEnd || Boolean(subscription.cancelAt);
}

export async function getAccountDeletionBlocker(userId: string) {
  const requestHeaders = await headers();

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  for (const organization of organizations ?? []) {
    const fullOrganization = await auth.api.getFullOrganization({
      query: { organizationId: organization.id },
      headers: requestHeaders,
    });

    if (!fullOrganization) {
      continue;
    }

    const members = fullOrganization.members ?? [];
    const currentUserMembership = members.find(
      (member: { userId: string }) => member.userId === userId,
    );

    if (!hasOrgRole(currentUserMembership?.role, "owner")) {
      continue;
    }

    const otherOwnerCount = members.filter(
      (member: { userId: string; role: string }) =>
        hasOrgRole(member.role, "owner") && member.userId !== userId,
    ).length;

    if (otherOwnerCount === 0 && members.length > 1) {
      return `You are the sole owner of "${fullOrganization.name}". Transfer ownership before deleting your account.`;
    }

    const subscription = await getOrganizationSubscriptionSnapshot(
      fullOrganization.id,
    );

    if (
      otherOwnerCount === 0 &&
      isActiveSubscription(subscription.subscriptionStatus)
    ) {
      if (isSubscriptionEndingLater(subscription)) {
        const subscriptionEndDate = formatSubscriptionEndDate(
          subscription.periodEnd,
        );

        return subscriptionEndDate
          ? `The subscription for "${fullOrganization.name}" is already canceled and will end on ${subscriptionEndDate}. Wait until it ends before deleting your account.`
          : `The subscription for "${fullOrganization.name}" is already canceled but still active until the current billing period ends. Wait until it ends before deleting your account.`;
      }

      return `Cancel the subscription for "${fullOrganization.name}" before deleting your account.`;
    }
  }

  return null;
}