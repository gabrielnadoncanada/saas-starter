import { routes } from "@/shared/constants/routes";
import { getCallbackURL } from "@/shared/lib/auth/callback-url";

type PostSignInCallbackParams = {
  callbackUrl?: string | null;
  redirect?: "checkout" | null;
  priceId?: string | null;
};

export function buildPostSignInCallbackURL(input: PostSignInCallbackParams = {}) {
  const searchParams = new URLSearchParams();

  if (input.redirect === "checkout" && input.priceId) {
    searchParams.set("redirect", "checkout");
    searchParams.set("priceId", input.priceId);
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
