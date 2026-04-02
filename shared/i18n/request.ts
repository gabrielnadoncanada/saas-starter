import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isAppLocale } from "@/shared/i18n/locales";
import { getMessagesForLocale } from "@/shared/i18n/messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const candidate = await requestLocale;
  const locale = candidate && isAppLocale(candidate) ? candidate : defaultLocale;

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
