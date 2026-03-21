const ACTIVE_BILLING_STATUSES = new Set(["active", "trialing"]);
const TERMINAL_STRIPE_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "incomplete_expired",
]);

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

export function isTerminalStripeSubscriptionStatus(
  subscriptionStatus: string | null | undefined,
) {
  if (!subscriptionStatus) {
    return false;
  }

  return TERMINAL_STRIPE_SUBSCRIPTION_STATUSES.has(subscriptionStatus);
}
