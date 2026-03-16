import { routes } from "@/shared/constants/routes";

import type { AuthMode } from "@/features/auth/types/auth.types";

type NullableString = string | null;
type QueryValue = string | string[] | undefined;
type AuthFlowQueryParams = Record<string, QueryValue>;
type SearchParamsReader = Pick<URLSearchParams, "get">;
export type AuthRedirect = "checkout";
export type AuthFlowParams = {
  redirect: AuthRedirect | null;
  priceId: NullableString;
  inviteId: NullableString;
  error: NullableString;
};
type AuthFlowHrefParams = {
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  inviteId?: string | null;
};

const AUTH_REDIRECTS = new Set<AuthRedirect>(["checkout"]);

type BuildAlternateAuthHrefParams = {
  mode: AuthMode;
  redirect: AuthRedirect | null;
  priceId: NullableString;
  inviteId: NullableString;
};

function parseAuthRedirect(value: string | null): AuthRedirect | null {
  if (!value) {
    return null;
  }

  return AUTH_REDIRECTS.has(value as AuthRedirect) ? (value as AuthRedirect) : null;
}

function normalizeOptionalValue(value: string | null | undefined): NullableString {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function isSearchParamsReader(
  searchParams: SearchParamsReader | AuthFlowQueryParams,
): searchParams is SearchParamsReader {
  return typeof (searchParams as SearchParamsReader).get === "function";
}

function readQueryValue(
  searchParams: SearchParamsReader | AuthFlowQueryParams,
  key: string,
): NullableString {
  if (isSearchParamsReader(searchParams)) {
    return normalizeOptionalValue(searchParams.get(key));
  }

  const value = searchParams[key];

  return normalizeOptionalValue(Array.isArray(value) ? value[0] : value);
}

export function getAuthFlowParams(
  searchParams: SearchParamsReader | AuthFlowQueryParams,
): AuthFlowParams {
  return {
    redirect: parseAuthRedirect(readQueryValue(searchParams, "redirect")),
    priceId: readQueryValue(searchParams, "priceId"),
    inviteId: readQueryValue(searchParams, "inviteId"),
    error: readQueryValue(searchParams, "error"),
  };
}

export function buildAuthHref(
  pathname: string,
  { redirect, priceId, inviteId }: AuthFlowHrefParams,
): string {
  const query = new URLSearchParams();
  const normalizedPriceId = normalizeOptionalValue(priceId);
  const normalizedInviteId = normalizeOptionalValue(inviteId);

  if (redirect === "checkout" && normalizedPriceId) {
    query.set("redirect", "checkout");
    query.set("priceId", normalizedPriceId);
  }

  if (normalizedInviteId) {
    query.set("inviteId", normalizedInviteId);
  }

  const queryString = query.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function buildAlternateAuthHref({
  mode,
  redirect,
  priceId,
  inviteId,
}: BuildAlternateAuthHrefParams): string {
  const pathname = mode === "signin" ? routes.auth.signup : routes.auth.login;

  return buildAuthHref(pathname, { redirect, priceId, inviteId });
}

export function getAuthSubtitle(params: {
  allowMagicLink: boolean;
  hasOAuthProviders: boolean;
}): string {
  const { allowMagicLink, hasOAuthProviders } = params;

  if (allowMagicLink && hasOAuthProviders) {
    return "Use a magic link or one of your social providers to continue.";
  }

  if (allowMagicLink) {
    return "Use a magic link to continue.";
  }

  if (hasOAuthProviders) {
    return "Use one of your social providers to continue.";
  }

  return "Choose an available sign-in method to continue.";
}
