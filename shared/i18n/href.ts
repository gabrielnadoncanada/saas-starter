import { redirect } from "next/navigation";

function isAbsoluteHref(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

export function stripLocalePrefix(href: string) {
  return {
    locale: null,
    pathname: href,
  };
}

export function getLocalizedHref(
  _locale: string | null | undefined,
  href: string,
) {
  if (!href.startsWith("/") || isAbsoluteHref(href)) {
    return href;
  }

  return href;
}

export function redirectToLocale(
  locale: string | null | undefined,
  href: string,
): never {
  redirect(getLocalizedHref(locale, href));
}
