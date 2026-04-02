import { routes } from "@/shared/constants/routes";
import { stripLocalePrefix } from "@/shared/i18n/href";

const DEFAULT_CALLBACK_URL = routes.auth.postSignIn;
const allowedCallbackSet = new Set<string>([
  routes.app.dashboard,
  routes.auth.postSignIn,
]);
const allowedCallbackPrefixes = ["/accept-invitation/"];

export function getCallbackURL(callbackUrl: string | null | undefined): string {
  if (!callbackUrl) {
    return DEFAULT_CALLBACK_URL;
  }

  const { pathname } = stripLocalePrefix(callbackUrl);

  if (allowedCallbackSet.has(pathname)) {
    return callbackUrl;
  }

  if (
    allowedCallbackPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return callbackUrl;
  }

  return DEFAULT_CALLBACK_URL;
}

export function buildCallbackURL(
  pathname: string,
  callbackUrl: string | null | undefined,
) {
  const nextCallbackUrl = getCallbackURL(callbackUrl);

  if (nextCallbackUrl === DEFAULT_CALLBACK_URL) {
    return pathname;
  }

  return `${pathname}?${new URLSearchParams({ callbackUrl: nextCallbackUrl }).toString()}`;
}
