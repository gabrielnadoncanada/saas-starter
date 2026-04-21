import { headers } from "next/headers";

import { getSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
import { auth } from "@/lib/auth/auth-config";
import { formatShortDate } from "@/lib/date/format-date";
import { hasOrgRole } from "@/lib/db/enums";

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

function isActiveSubscription(status: string | null | undefined) {
  return (
    !!status &&
    ACTIVE_SUBSCRIPTION_STATUSES.includes(
      status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number],
    )
  );
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

  const fullOrganizations = await Promise.all(
    (organizations ?? []).map((organization) =>
      auth.api.getFullOrganization({
        query: { organizationId: organization.id },
        headers: requestHeaders,
      }),
    ),
  );

  const ownedOrganizations = fullOrganizations.flatMap((fullOrganization) => {
    if (!fullOrganization) return [];

    const members = fullOrganization.members ?? [];
    const currentUserMembership = members.find(
      (member) => member.userId === userId,
    );

    if (!hasOrgRole(currentUserMembership?.role, "owner")) return [];

    const otherOwnerCount = members.filter(
      (member) => hasOrgRole(member.role, "owner") && member.userId !== userId,
    ).length;

    return [{ fullOrganization, members, otherOwnerCount }];
  });

  for (const { fullOrganization, members, otherOwnerCount } of ownedOrganizations) {
    if (otherOwnerCount === 0 && members.length > 1) {
      return `You are the sole owner of "${fullOrganization.name}". Transfer ownership before deleting your account.`;
    }
  }

  const orgsWithActiveSubscription = ownedOrganizations.filter(
    ({ otherOwnerCount }) => otherOwnerCount === 0,
  );

  const subscriptions = await Promise.all(
    orgsWithActiveSubscription.map(({ fullOrganization }) =>
      getSubscriptionSnapshot(fullOrganization.id),
    ),
  );

  for (const [index, { fullOrganization }] of orgsWithActiveSubscription.entries()) {
    const subscription = subscriptions[index];

    if (!isActiveSubscription(subscription.subscriptionStatus)) {
      continue;
    }

    if (isSubscriptionEndingLater(subscription)) {
      const subscriptionEndDate = formatShortDate(subscription.periodEnd);

      return subscriptionEndDate
        ? `The subscription for "${fullOrganization.name}" is already canceled and will end on ${subscriptionEndDate}. Wait until it ends before deleting your account.`
        : `The subscription for "${fullOrganization.name}" is already canceled but still active until the current billing period ends. Wait until it ends before deleting your account.`;
    }

    return `Cancel the subscription for "${fullOrganization.name}" before deleting your account.`;
  }

  return null;
}
