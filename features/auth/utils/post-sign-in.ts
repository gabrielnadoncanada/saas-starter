import { routes } from "@/shared/constants/routes";
import { buildAuthHref, type AuthRedirect } from "@/features/auth/utils/auth-flow";

type PostSignInParams = {
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function getPostSignInCallbackUrl({
  redirect,
  priceId,
  pricingModel,
  inviteId,
}: PostSignInParams): string {
  return buildAuthHref(routes.auth.postSignIn, {
    redirect,
    priceId,
    pricingModel,
    inviteId,
  });
}
