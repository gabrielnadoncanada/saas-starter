import type { AppLocale } from "@/shared/i18n/locales";

import { messages as enMessages } from "./messages/en";
import { messages as frMessages } from "./messages/fr";

export function getMessagesForLocale(locale: AppLocale) {
  return locale === "fr" ? frMessages : enMessages;
}
