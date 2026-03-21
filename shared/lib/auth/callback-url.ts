const DEFAULT_CALLBACK_URL = "/post-sign-in";
const allowedCallbackSet = new Set(["/dashboard", "/post-sign-in"]);
const allowedCallbackPrefixes = ["/accept-invitation/"];

export function getCallbackURL(callbackUrl: string | null | undefined): string {
  if (callbackUrl && allowedCallbackSet.has(callbackUrl)) {
    return callbackUrl;
  }

  if (callbackUrl && allowedCallbackPrefixes.some((prefix) => callbackUrl.startsWith(prefix))) {
    return callbackUrl;
  }

  return DEFAULT_CALLBACK_URL;
}

export function buildCallbackURL(pathname: string, callbackUrl: string | null | undefined) {
  const nextCallbackUrl = getCallbackURL(callbackUrl);

  if (nextCallbackUrl === DEFAULT_CALLBACK_URL) {
    return pathname;
  }

  return `${pathname}?${new URLSearchParams({ callbackUrl: nextCallbackUrl }).toString()}`;
}
