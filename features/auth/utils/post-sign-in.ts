import { routes } from "@/shared/constants/routes";
import { buildAuthHref, type AuthRedirect } from "@/features/auth/utils/auth-flow";

type PostSignInParams = {
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  inviteId?: string | null;
};

export function getPostSignInCallbackUrl({
  redirect,
  priceId,
  inviteId,
}: PostSignInParams): string {
  return buildAuthHref(routes.auth.postSignIn, {
    redirect,
    priceId,
    inviteId,
  });
}
