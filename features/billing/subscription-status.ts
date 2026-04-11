const ACTIVE_BILLING_STATUSES = new Set(["active", "trialing"]);

export const CURRENT_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
  "unpaid",
  "paused",
] as const;

export function hasPlanAccess(subscriptionStatus: string | null | undefined) {
  if (!subscriptionStatus) {
    return false;
  }

  return ACTIVE_BILLING_STATUSES.has(subscriptionStatus);
}

export function hasCurrentStripeSubscription(
  subscriptionStatus: string | null | undefined,
) {
  if (!subscriptionStatus) {
    return false;
  }

  return CURRENT_SUBSCRIPTION_STATUSES.includes(
    subscriptionStatus as (typeof CURRENT_SUBSCRIPTION_STATUSES)[number],
  );
}

export function isTrialingSubscription(
  subscriptionStatus: string | null | undefined,
) {
  return subscriptionStatus === "trialing";
}
