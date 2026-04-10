import { routes } from "@/shared/constants/routes";

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

  if (allowedCallbackSet.has(callbackUrl)) {
    return callbackUrl;
  }

  if (
    allowedCallbackPrefixes.some((prefix) => callbackUrl.startsWith(prefix))
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

export function buildCheckEmailHref(
  email: string,
  callbackUrl: string | null | undefined,
) {
  const baseHref = buildCallbackURL(routes.auth.checkEmail, callbackUrl);
  const separator = baseHref.includes("?") ? "&" : "?";
  const query = new URLSearchParams({
    email: email.trim().toLowerCase(),
  });

  return `${baseHref}${separator}${query.toString()}`;
}
