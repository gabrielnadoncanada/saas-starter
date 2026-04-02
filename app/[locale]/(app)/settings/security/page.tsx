import { getTranslations } from "next-intl/server";
import { TwoFactorSettingsCard } from "@/features/account/components/settings/two-factor-settings-card";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export default async function SecuritySettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, user] = await Promise.all([params, getCurrentUser()]);
  const t = await getTranslations("settings.security");

  if (!user) {
    redirectToLocale(locale, routes.auth.login);
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("title")}</PageTitle>
        <PageDescription>{t("description")}</PageDescription>
      </PageHeader>

      <TwoFactorSettingsCard enabled={user.twoFactorEnabled} />
    </Page>
  );
}
