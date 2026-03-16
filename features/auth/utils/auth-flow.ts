type NullableString = string | null;
type QueryValue = string | string[] | undefined;
type AuthFlowQueryParams = Record<string, QueryValue>;
type SearchParamsReader = Pick<URLSearchParams, "get">;
export type AuthRedirect = "checkout";
export type AuthFlowParams = {
  redirect: AuthRedirect | null;
  priceId: NullableString;
  pricingModel: NullableString;
  inviteId: NullableString;
  error: NullableString;
};
type AuthFlowHrefParams = {
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};
type CheckEmailHrefParams = AuthFlowHrefParams & {
  email?: string | null;
};

const AUTH_REDIRECTS = new Set<AuthRedirect>(["checkout"]);

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
    pricingModel: readQueryValue(searchParams, "pricingModel"),
    inviteId: readQueryValue(searchParams, "inviteId"),
    error: readQueryValue(searchParams, "error"),
  };
}

export function buildAuthHref(
  pathname: string,
  { redirect, priceId, pricingModel, inviteId }: AuthFlowHrefParams,
): string {
  const query = new URLSearchParams();
  const normalizedPriceId = normalizeOptionalValue(priceId);
  const normalizedInviteId = normalizeOptionalValue(inviteId);

  if (redirect === "checkout" && normalizedPriceId) {
    query.set("redirect", "checkout");
    query.set("priceId", normalizedPriceId);
    const normalizedPricingModel = normalizeOptionalValue(pricingModel);
    if (normalizedPricingModel) {
      query.set("pricingModel", normalizedPricingModel);
    }
  }

  if (normalizedInviteId) {
    query.set("inviteId", normalizedInviteId);
  }

  const queryString = query.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function buildCheckEmailHref(
  pathname: string,
  { email, redirect, priceId, pricingModel, inviteId }: CheckEmailHrefParams,
): string {
  const query = new URLSearchParams();
  const normalizedEmail = normalizeOptionalValue(email);
  const baseHref = buildAuthHref(pathname, { redirect, priceId, pricingModel, inviteId });

  if (normalizedEmail) {
    query.set("email", normalizedEmail);
  }

  if (!query.size) {
    return baseHref;
  }

  const separator = baseHref.includes("?") ? "&" : "?";

  return `${baseHref}${separator}${query.toString()}`;
}
