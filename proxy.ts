import createMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

import { defaultLocale, isAppLocale } from "@/shared/i18n/locales";
import { routing } from "@/shared/i18n/routing";
import { routes } from "@/shared/constants/routes";

const handleI18nRouting = createMiddleware(routing);
const protectedPrefixes = ["/dashboard", "/settings", "/admin"];

function getLocaleFromPath(pathname: string) {
  const segments = pathname.split("/");
  const candidate = segments[1];

  if (candidate && isAppLocale(candidate)) {
    return candidate;
  }

  return defaultLocale;
}

function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPath(pathname);

  if (locale === defaultLocale && !pathname.startsWith(`/${locale}/`)) {
    return pathname;
  }

  const prefix = `/${locale}`;
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length) || "/" : pathname;
}

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  const i18nResponse = handleI18nRouting(request);

  if (i18nResponse && i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return i18nResponse;
  }

  const locale = getLocaleFromPath(request.nextUrl.pathname);
  const pathname = stripLocalePrefix(request.nextUrl.pathname);

  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const redirectUrl = new URL(`/${locale}${routes.auth.login}`, request.url);
      redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
