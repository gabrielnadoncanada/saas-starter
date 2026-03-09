import { SettingsPageHeader } from '@/components/shared/SettingsPageHeader';
import { DeleteAccountCard } from '@/features/auth/components/settings/DeleteAccountCard';
import { LinkedAccountsCard } from '@/features/auth/components/settings/LinkedAccountsCard';
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/auth/types/auth.types';

type SecuritySettingsPanelProps = {
  providers: LinkedProviderOverview[];
  feedback?: SecuritySettingsFeedback;
};

export function SecuritySettingsPanel({ providers, feedback }: SecuritySettingsPanelProps) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="Security Settings" />
      <LinkedAccountsCard providers={providers} feedback={feedback} />
      <DeleteAccountCard />
    </section>
  );
}