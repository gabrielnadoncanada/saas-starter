import { ThemePreferencesCard } from "@/features/account/components/settings/theme-preferences-card";
import { Page } from "@/shared/components/layout/page-layout";

export default async function PreferencesPage() {
  return (
    <Page fixed className="ml-0 space-y-6">
      <ThemePreferencesCard />
    </Page>
  );
}
