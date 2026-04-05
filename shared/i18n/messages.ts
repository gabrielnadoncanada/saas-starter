import type { AppLocale } from "@/shared/i18n/locales";

import { messages as enMessages } from "./messages/en";

export function getMessagesForLocale(_locale: AppLocale) {
  return enMessages;
}
