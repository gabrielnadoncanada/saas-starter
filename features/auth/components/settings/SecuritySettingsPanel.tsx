import { SettingsPageHeader } from '@/components/shared/SettingsPageHeader';
import { DeleteAccountCard } from '@/features/auth/components/settings/DeleteAccountCard';
import { LinkedAccountsCard } from '@/features/auth/components/settings/LinkedAccountsCard';
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/auth/types/auth.types';

type SecuritySettingsPanelProps = {
  allowMagicLink: boolean;
  providers: LinkedProviderOverview[];
  feedback?: SecuritySettingsFeedback;
};

export function SecuritySettingsPanel({
  allowMagicLink,
  providers,
  feedback
}: SecuritySettingsPanelProps) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="Security Settings" />
      <LinkedAccountsCard
        allowMagicLink={allowMagicLink}
        providers={providers}
        feedback={feedback}
      />
      <DeleteAccountCard />
    </section>
  );
}
