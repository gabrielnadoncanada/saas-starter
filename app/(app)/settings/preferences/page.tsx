import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page";
import { ThemePreferencesCard } from "@/features/account/components/settings/theme-preferences-card";

export default function PreferencesPage() {
  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>Preferences</PageTitle>
        <PageDescription>
          Manage how the app looks and behaves for your account.
        </PageDescription>
      </PageHeader>

      <ThemePreferencesCard />
    </Page>
  );
}
