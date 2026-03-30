import type { BillingInterval, PaidPlanId } from "@/features/billing/plans";
import { routes } from "@/shared/constants/routes";
import { getCallbackURL } from "@/shared/lib/auth/callback-url";

type PostSignInCallbackParams = {
  billingInterval?: BillingInterval | null;
  callbackUrl?: string | null;
  planId?: PaidPlanId | null;
  redirect?: "checkout" | null;
};

export function buildPostSignInCallbackURL(input: PostSignInCallbackParams = {}) {
  const searchParams = new URLSearchParams();

  if (input.redirect === "checkout" && input.planId && input.billingInterval) {
    searchParams.set("redirect", "checkout");
    searchParams.set("planId", input.planId);
    searchParams.set("billingInterval", input.billingInterval);
  }

  if (input.callbackUrl) {
    const callbackUrl = getCallbackURL(input.callbackUrl);

    if (callbackUrl !== routes.auth.postSignIn) {
      searchParams.set("callbackUrl", callbackUrl);
    }
  }

  return searchParams.size
    ? `${routes.auth.postSignIn}?${searchParams.toString()}`
    : routes.auth.postSignIn;
}
