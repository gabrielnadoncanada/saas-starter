import { LocalePreferencesCard } from "@/features/account/components/settings/locale-preferences-card";
import { ThemePreferencesCard } from "@/features/account/components/settings/theme-preferences-card";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { Page } from "@/shared/components/layout/page-layout";

export default async function PreferencesPage() {
  const user = await getCurrentUser();

  return (
    <Page fixed className="ml-0 space-y-6">
      <LocalePreferencesCard preferredLocale={user?.preferredLocale === "fr" ? "fr" : "en"} />
      <ThemePreferencesCard />
    </Page>
  );
}
