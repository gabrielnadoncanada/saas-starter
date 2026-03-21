import { TeamSettingsPage } from '@/features/teams/components/team-settings-page';
import { ContentSection } from '@/features/account/components/settings/content-section';
import { terminology } from '@/shared/constants/terminology';

export default function SettingsPage() {
  return (
    <ContentSection
      title={`${terminology.Singular} Settings`}
      desc={`Manage your ${terminology.singular} settings and invite new members.`}
    >
      <TeamSettingsPage />
    </ContentSection>
  )
}

