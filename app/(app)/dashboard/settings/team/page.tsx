import { TeamSettingsPage } from '@/features/teams/components/TeamSettingsPage';
import { ContentSection } from '@/features/account/components/settings/ContentSection';

export default function SettingsPage() {
  return (
    <ContentSection
      title='Team Settings'
      desc='Manage your team settings and invite new members.'
    >
      <TeamSettingsPage />
    </ContentSection>
  )
}

