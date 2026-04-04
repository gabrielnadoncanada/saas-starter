import { redirect } from "next/navigation";

import {
  type AppLocale,
  defaultLocale,
  isAppLocale,
  locales,
} from "@/shared/i18n/locales";

function isAbsoluteHref(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

export function resolveLocale(locale?: string | null): AppLocale {
  return locale && isAppLocale(locale) ? locale : defaultLocale;
}

export function stripLocalePrefix(href: string) {
  if (!href.startsWith("/")) {
    return {
      locale: null,
      pathname: href,
    };
  }

  const segments = href.split("/");
  const candidate = segments[1];

  if (!candidate || !isAppLocale(candidate)) {
    return {
      locale: null,
      pathname: href,
    };
  }

  const pathname = href.slice(candidate.length + 1) || "/";

  return {
    locale: candidate,
    pathname,
  };
}

export function getLocalizedHref(locale: string | null | undefined, href: string) {
  if (!href.startsWith("/") || isAbsoluteHref(href)) {
    return href;
  }

  const normalizedLocale = resolveLocale(locale);
  const current = stripLocalePrefix(href);

  if (current.locale && locales.includes(current.locale)) {
    return href;
  }

  if (normalizedLocale === defaultLocale) {
    return href;
  }

  return href === "/" ? `/${normalizedLocale}` : `/${normalizedLocale}${href}`;
}

export function redirectToLocale(
  locale: string | null | undefined,
  href: string,
): never {
  redirect(getLocalizedHref(locale, href));
}
