import { OrganizationSettingsPage } from '@/features/teams/components/organization-settings-page';
import { ContentSection } from '@/features/account/components/settings/content-section';

export default function SettingsPage() {
  return (
    <ContentSection
      title="Organization Settings"
      desc="Manage your organization settings and invite new members."
    >
      <OrganizationSettingsPage />
    </ContentSection>
  )
}
