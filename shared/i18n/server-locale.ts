import { cookies } from "next/headers";

import { defaultLocale, isAppLocale } from "@/shared/i18n/locales";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;

  return locale && isAppLocale(locale) ? locale : defaultLocale;
}
