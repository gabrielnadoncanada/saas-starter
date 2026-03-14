import { SettingsPageHeader } from '@/shared/components/app/SettingsPageHeader';
import { DeleteAccountCard } from '@/features/account/components/settings/DeleteAccountCard';
import { LinkedAccountsCard } from '@/features/account/components/settings/LinkedAccountsCard';
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/account/types/account.types';

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
