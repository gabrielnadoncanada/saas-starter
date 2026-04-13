import { Page } from "@/components/layout/page-layout";
import { ThemePreferencesCard } from "@/features/account/components/settings/theme-preferences-card";

export default async function PreferencesPage() {
  return (
    <Page>
      <ThemePreferencesCard />
    </Page>
  );
}
