import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "@/shared/i18n/locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
