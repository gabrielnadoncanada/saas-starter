import { ThemePreferencesCard } from "@/features/account/components/settings/theme-preferences-card";
import { Page } from "@/shared/components/layout/page-layout";

export default async function PreferencesPage() {
  return (
    <Page>
      <ThemePreferencesCard />
    </Page>
  );
}
