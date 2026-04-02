import account from "./account.json";
import admin from "./admin.json";
import apiKeys from "./api-keys.json";
import assistant from "./assistant.json";
import auth from "./auth.json";
import billing from "./billing.json";
import common from "./common.json";
import dashboard from "./dashboard.json";
import errors from "./errors.json";
import goodbye from "./goodbye.json";
import marketing from "./marketing.json";
import notifications from "./notifications.json";
import organizations from "./organizations.json";
import settings from "./settings.json";
import tasks from "./tasks.json";

export const messages = {
  ...account,
  ...admin,
  ...apiKeys,
  ...assistant,
  ...auth,
  ...billing,
  ...common,
  ...dashboard,
  ...errors,
  ...goodbye,
  ...marketing,
  ...notifications,
  ...organizations,
  ...settings,
  ...tasks,
} as const;
