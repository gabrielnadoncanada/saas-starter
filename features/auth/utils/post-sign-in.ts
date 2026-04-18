import type {
  BillingInterval,
  PaidPlanId,
} from "@/config/billing.config";
import { routes } from "@/constants/routes";
import { getCallbackURL } from "@/lib/auth/callback-url";

type PostSignInCallbackParams = {
  billingInterval?: BillingInterval | null;
  callbackUrl?: string | null;
  planId?: PaidPlanId | null;
  redirect?: "checkout" | null;
};

export function buildPostSignInCallbackURL(
  input: PostSignInCallbackParams = {},
) {
  // Preserve checkout intent across auth so post-sign-in can finish organization
  // provisioning first, then resume Stripe with the same plan selection.
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
