import { getRequestConfig } from "next-intl/server";

import { defaultLocale } from "@/shared/i18n/locales";
import { getMessagesForLocale } from "@/shared/i18n/messages";

export default getRequestConfig(async () => {
  return {
    locale: defaultLocale,
    messages: getMessagesForLocale(defaultLocale),
  };
});
